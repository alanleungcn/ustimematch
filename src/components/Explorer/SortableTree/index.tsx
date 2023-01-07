import type {
  Announcements,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  DragOverEvent,
  DropAnimation,
  Modifier,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FolderModal from "@components/Form/FolderModal";
import ImportModal from "@components/Form/ImportModal";
import { actions, useStore } from "@store/index";
import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeChildrenOf,
} from "@utils/sortableTree";
import { sortableTreeKeyboardCoordinates } from "@utils/sortableTree/keyboardCoordinates";
import type {
  FlattenedItem,
  FolderItem,
  SensorContext,
  TimetableItem,
} from "../../../types/tree";
import { SortableTreeItem } from "./SortableTreeItem";

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig: DropAnimation = {
  duration: 300,
  easing: "ease-out",
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString(transform.final),
      },
    ];
  },
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300,
      easing: "ease-in",
    });
  },
};

interface Props {
  indicator?: boolean;
  indentationWidth?: number;
}

const SortableTree = ({ indicator = true, indentationWidth = 24 }: Props) => {
  const items = useStore().timetable.timetablesTree();
  const setItems = actions.timetable.setTimetablesTree;

  const toggleVisibility = actions.timetable.toggleVisibility;
  const toggleFolderCollapse = actions.timetable.toggleFolderCollapse;

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { treeItem }) =>
        treeItem.type === "FOLDER" &&
        treeItem.collapsed &&
        treeItem.children.length
          ? [...acc, treeItem.id]
          : acc,
      [],
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems,
    );
  }, [activeId, items]);

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth,
        )
      : null;

  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });

  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    }),
  );

  const sortedIds = useMemo(
    () => flattenedItems.map((item) => item.treeItem.id),
    [flattenedItems],
  );

  const activeItem = activeId
    ? flattenedItems.find((item) => item.treeItem.id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement("onDragMove", active.id, over?.id);
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement("onDragOver", active.id, over?.id);
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement("onDragEnd", active.id, over?.id);
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  // Handle editing modal of folder and timetable
  const [openTimetableModal, setOpenTimetableModal] = useState(false);
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderItem>();
  const [editingTimetable, setEditingTimetable] = useState<TimetableItem>();

  const editTreeItem = actions.timetable.editTreeItem;
  const removeTreeItem = actions.timetable.removeTreeItem;

  const onFolderClick = (folderItem: FolderItem) => {
    setOpenFolderModal(true);
    setEditingFolder(folderItem);
  };

  const onTimetableClick = (timetableItem: TimetableItem) => {
    setOpenTimetableModal(true);
    setEditingTimetable(timetableItem);
  };

  return (
    <>
      <div className="h-full overflow-y-auto">
        <DndContext
          accessibility={{ announcements }}
          sensors={sensors}
          collisionDetection={closestCenter}
          measuring={measuring}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={sortedIds}
            strategy={verticalListSortingStrategy}
          >
            {flattenedItems.map(({ depth, treeItem }) => {
              return (
                <SortableTreeItem
                  id={treeItem.id}
                  key={treeItem.id}
                  treeItem={treeItem}
                  indentationWidth={indentationWidth}
                  depth={
                    treeItem.id === activeId && projected
                      ? projected.depth
                      : depth
                  }
                  onCollapse={
                    treeItem.type === "FOLDER"
                      ? () => toggleFolderCollapse(treeItem.id)
                      : undefined
                  }
                  onClick={
                    treeItem.type === "FOLDER"
                      ? () => onFolderClick(treeItem)
                      : () => onTimetableClick(treeItem)
                  }
                  onEyeClick={() => toggleVisibility(treeItem.id)}
                />
              );
            })}
            {createPortal(
              <DragOverlay
                dropAnimation={dropAnimationConfig}
                modifiers={indicator ? [adjustTranslate] : undefined}
              >
                {activeId && activeItem ? (
                  <SortableTreeItem
                    clone
                    depth={0}
                    id={activeId}
                    indentationWidth={indentationWidth}
                    childCount={getChildCount(items, activeId)}
                    treeItem={activeItem.treeItem}
                  />
                ) : null}
              </DragOverlay>,
              document.body,
            )}
          </SortableContext>
        </DndContext>
      </div>

      {/* Timetable editing modal */}
      <ImportModal
        onEdit={(timetable) =>
          editingTimetable &&
          editTreeItem(editingTimetable?.id, { ...editingTimetable, timetable })
        }
        onDelete={() =>
          editingTimetable && removeTreeItem(editingTimetable?.id)
        }
        open={openTimetableModal}
        setOpen={setOpenTimetableModal}
        timetable={editingTimetable?.timetable}
      />

      {/* Folder editing modal */}
      <FolderModal
        onEdit={(name) =>
          editingFolder &&
          editTreeItem(editingFolder?.id, { ...editingFolder, name })
        }
        onDelete={() => editingFolder && removeTreeItem(editingFolder?.id)}
        folder={editingFolder}
        open={openFolderModal}
        setOpen={setOpenFolderModal}
      />
    </>
  );

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = flattenedItems.find(
      (item) => item.treeItem.id === activeId,
    );

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items)),
      );

      const overIndex = clonedItems.findIndex(
        (item) => item.treeItem.id === over.id,
      );

      const activeIndex = clonedItems.findIndex(
        (item) => item.treeItem.id === active.id,
      );

      const activeTreeItem = clonedItems[activeIndex];
      if (!activeTreeItem) return;

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const newItems = buildTree(sortedItems);

      setItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty("cursor", "");
  }

  function getMovementAnnouncement(
    eventName: string,
    activeId: UniqueIdentifier,
    overId?: UniqueIdentifier,
  ) {
    if (overId && projected) {
      if (eventName !== "onDragEnd") {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items)),
      );
      const overIndex = clonedItems.findIndex(
        (item) => item.treeItem.id === overId,
      );
      const activeIndex = clonedItems.findIndex(
        (item) => item.treeItem.id === activeId,
      );
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const activeItem = sortedItems[activeIndex];
      const previousItem = sortedItems[overIndex - 1];

      function getName(item: FlattenedItem) {
        return item.treeItem.type === "FOLDER"
          ? `Folder ${item.treeItem.name}`
          : item.treeItem.type === "TIMETABLE"
          ? `Timetable ${item.treeItem.timetable.name}`
          : null;
      }
      const activeName = activeItem ? getName(activeItem) : "";

      let announcement;
      const movedVerb = eventName === "onDragEnd" ? "dropped" : "moved";
      const nestedVerb = eventName === "onDragEnd" ? "dropped" : "nested";

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        const nextName = nextItem ? getName(nextItem) : "";
        announcement = `${activeName} was ${movedVerb} before ${nextName}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          const previousName = previousItem ? getName(previousItem) : "";
          announcement = `${activeName} was ${nestedVerb} under ${previousName}.`;
        } else {
          let previousSibling: FlattenedItem | undefined = previousItem;
          const previousSiblingName = previousSibling
            ? getName(previousSibling)
            : "";
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: UniqueIdentifier | null = previousSibling.parentId;
            previousSibling = sortedItems.find(
              (item) => item.treeItem.id === parentId,
            );
          }

          if (previousSibling) {
            announcement = `${activeName} was ${movedVerb} after ${previousSiblingName}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }
};

const adjustTranslate: Modifier = ({ transform, draggingNodeRect }) => {
  if (!draggingNodeRect) return transform;
  return {
    ...transform,
    x: transform.x + draggingNodeRect.width,
  };
};

export default SortableTree;