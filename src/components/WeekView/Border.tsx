import clsx from "clsx";
import { useTrackedStore } from "@store/index";
import { WEEKVIEW_ROWS } from "@store/ui";

const Border = () => {
  const cols = useTrackedStore().ui.weekViewCols();

  // Pixel perfect and relatively fast (no. of divs = rows + cols)
  return (
    <>
      {/* Horizontal lines */}
      {Array.from({ length: WEEKVIEW_ROWS }, (_, i) => (
        <div
          key={i}
          style={{
            // + 1 for 1-index grid
            // + 1 for first row weekdays
            gridRowStart: i + 2,
            gridColumnStart: 2,
            gridColumnEnd: -1,
          }}
          className={clsx(
            // Translate to ensure lines are in middle of two rows, with 0.5px on each side.
            "-translate-y-[0.5px] select-none border-t border-t-border-200",
            i % 2 === 1 && "border-t-border-200/40",
          )}
        />
      ))}

      {/* Vertical lines */}
      {Array.from(
        { length: cols },
        (_, i) =>
          i !== 0 && (
            <div
              key={i}
              style={{
                gridRowStart: 2,
                gridRowEnd: -1,
                // + 1 for 1-index grid
                // + 1 for first column times
                gridColumnStart: i + 2,
              }}
              className={clsx(
                // Translate to ensure lines are in the middle of two columns, with 0.5px on each side.
                "-translate-x-[0.5px] select-none border-l border-l-border-200",
                // Darken weekends
                (i === 5 || i === 6) && "bg-bg-300/50",
              )}
            />
          ),
      )}
    </>
  );
};

export default Border;
