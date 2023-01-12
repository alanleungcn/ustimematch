import type { UniqueIdentifier } from "@dnd-kit/core";
import type { AnimateLayoutChanges } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconEye,
  IconEyeOff,
  IconGripVertical,
} from "@tabler/icons";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import Button from "@ui/Button";
import { chevronHalfVariants } from "@ui/variants";
import { getFolderVisible, getTimetableCount } from "@utils/sortableTree";
import type { TreeItem } from "../../types/tree";
import ColorChip from "../Explorer/ColorChip";

interface Props {
  id: UniqueIdentifier;
  depth: number;
  clone?: boolean;
  indentationWidth: number;

  treeItem: TreeItem;
  childCount?: number;

  onClick?: () => void;
  onEyeClick?: () => void;
  onCollapse?: () => void;
}

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

const SortableTreeItem = ({
  id,
  depth,
  clone,
  indentationWidth,

  treeItem,
  childCount,

  onClick,
  onEyeClick,
  onCollapse,
}: Props) => {
  const {
    transform,
    transition,
    listeners,
    attributes,
    isDragging,
    setDroppableNodeRef,
    setDraggableNodeRef,
  } = useSortable({
    id,
    animateLayoutChanges,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    // For active opacity transition
    transition: "opacity 200ms ease, " + transition,
  };

  return (
    <li
      ref={setDroppableNodeRef}
      style={{ paddingLeft: `${indentationWidth * depth}px` }}
      className={clsx(
        "h-12 list-none",
        clone && "w-1/2",
        // Items must be relatively positioned to be given higher z-index
        // https://github.com/clauderic/dnd-kit/issues/503
        isDragging && "relative z-10",
      )}
    >
      <div
        style={style}
        onClick={onClick}
        ref={setDraggableNodeRef}
        className={clsx(
          "flex h-full cursor-pointer select-none items-center gap-2 rounded-md bg-bg-200 pl-4 pr-2 text-fg-100",
          "hover:bg-bg-300 hover:text-fg-200",
          clone && "pointer-events-none shadow-elevation",
          isDragging && "border border-border-100 opacity-50 shadow-elevation",
        )}
      >
        {/* Folder item collapse and name */}
        {treeItem.type === "FOLDER" && (
          <>
            <Button
              icon
              plain
              onClick={(e) => {
                e.stopPropagation();
                onCollapse && onCollapse();
              }}
            >
              <motion.div
                initial={false}
                variants={chevronHalfVariants}
                animate={treeItem.collapsed ? "close" : "open"}
              >
                <IconChevronDown stroke={1.75} className="h-5 w-5" />
              </motion.div>
            </Button>

            <span title={treeItem.name} className="flex-grow truncate">
              {treeItem.name}
            </span>
          </>
        )}

        {/* Timetable item color chip and name */}
        {treeItem.type === "TIMETABLE" && (
          <>
            <ColorChip color={treeItem.timetable.config.color} />
            <span
              title={treeItem.timetable.name}
              className="flex-grow truncate"
            >
              {treeItem.timetable.name}
            </span>
          </>
        )}

        {/* Children count badge on clone while dragging*/}
        {clone && childCount ? (
          <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-800 text-xs font-medium text-white">
            {childCount}
          </span>
        ) : null}

        {/* Toggle visibility button */}
        {!clone &&
          (treeItem.type === "FOLDER"
            ? getTimetableCount(treeItem) > 0
            : true) && (
            <Button
              icon
              plain
              onClick={(e) => {
                e.stopPropagation();
                onEyeClick && onEyeClick();
              }}
            >
              {(treeItem.type === "TIMETABLE" &&
                treeItem.timetable.config.visible) ||
              (treeItem.type === "FOLDER" && getFolderVisible(treeItem)) ? (
                <IconEye stroke={1.75} className="h-5 w-5" />
              ) : (
                <IconEyeOff stroke={1.75} className="h-5 w-5" />
              )}
            </Button>
          )}

        {/* Drag handle */}
        <Button
          icon
          plain
          {...listeners}
          {...attributes}
          className="cursor-grab touch-none"
        >
          <IconGripVertical stroke={1.75} className="h-5 w-5" />
        </Button>
      </div>
    </li>
  );
};

export default SortableTreeItem;