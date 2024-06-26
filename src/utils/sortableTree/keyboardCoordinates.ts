import type {
  KeyboardCoordinateGetter,
  DroppableContainer,
} from "@dnd-kit/core";
import { closestCorners, getFirstCollision, KeyboardCode } from "@dnd-kit/core";
import { getProjection } from "@utils/sortableTree";
import type { FlattenedItem, SensorContext } from "../../types/tree";

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

const horizontal: string[] = [KeyboardCode.Left, KeyboardCode.Right];

export const sortableTreeKeyboardCoordinates: (
  context: SensorContext,
  indentationWidth: number,
) => KeyboardCoordinateGetter =
  (context, indentationWidth) =>
  (
    event,
    {
      currentCoordinates,
      context: {
        active,
        over,
        collisionRect,
        droppableRects,
        droppableContainers,
      },
    },
  ) => {
    if (directions.includes(event.code)) {
      if (!active || !collisionRect) {
        return;
      }

      event.preventDefault();

      const {
        current: { items, offset },
      } = context;

      if (horizontal.includes(event.code) && over?.id) {
        const projection = getProjection(
          items,
          active.id,
          over.id,
          offset,
          indentationWidth,
        );
        if (!projection) return undefined;
        const { depth, maxDepth, minDepth } = projection;

        switch (event.code) {
          case KeyboardCode.Left:
            if (depth > minDepth) {
              return {
                ...currentCoordinates,
                x: currentCoordinates.x - indentationWidth,
              };
            }
            break;
          case KeyboardCode.Right:
            if (depth < maxDepth) {
              return {
                ...currentCoordinates,
                x: currentCoordinates.x + indentationWidth,
              };
            }
            break;
        }

        return undefined;
      }

      const containers: DroppableContainer[] = [];

      droppableContainers.forEach((container) => {
        if (container?.disabled || container.id === over?.id) {
          return;
        }

        const rect = droppableRects.get(container.id);

        if (!rect) {
          return;
        }

        switch (event.code) {
          case KeyboardCode.Down:
            if (collisionRect.top < rect.top) {
              containers.push(container);
            }
            break;
          case KeyboardCode.Up:
            if (collisionRect.top > rect.top) {
              containers.push(container);
            }
            break;
        }
      });

      const collisions = closestCorners({
        active,
        collisionRect,
        pointerCoordinates: null,
        droppableRects,
        droppableContainers: containers,
      });
      let closestId = getFirstCollision(collisions, "id");

      if (closestId === over?.id && collisions.length > 1) {
        // @ts-expect-error copied from dnd-kit tree example
        closestId = collisions[1].id;
      }

      if (closestId && over?.id) {
        const activeRect = droppableRects.get(active.id);
        const newRect = droppableRects.get(closestId);
        const newDroppable = droppableContainers.get(closestId);

        if (activeRect && newRect && newDroppable) {
          const newIndex = items.findIndex(
            (item: FlattenedItem) => item.treeItem.id === closestId,
          );
          const newItem = items[newIndex];
          const activeIndex = items.findIndex(
            (item: FlattenedItem) => item.treeItem.id === active.id,
          );
          const activeItem = items[activeIndex];

          if (newItem && activeItem) {
            const projection = getProjection(
              items,
              active.id,
              closestId,
              (newItem.depth - activeItem.depth) * indentationWidth,
              indentationWidth,
            );
            if (!projection) return undefined;

            const isBelow = newIndex > activeIndex;
            const modifier = isBelow ? 1 : -1;
            const offset = (collisionRect.height - activeRect.height) / 2;

            const newCoordinates = {
              x: newRect.left + projection.depth * indentationWidth,
              y: newRect.top + modifier * offset,
            };

            return newCoordinates;
          }
        }
      }
    }

    return undefined;
  };
