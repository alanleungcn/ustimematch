import clsx from "clsx";
import { useContext } from "react";
import { WeekViewContext } from "./Context";

const Border = () => {
  const { rows, cols } = useContext(WeekViewContext);

  // This method renders too much divs and is quite slow
  return (
    <>
      {Array.from({ length: rows * cols }, (_, i) => (
        <div
          key={i}
          style={{
            // + 1 because grid is 1-indexed
            // + 1 because first row is weekday
            gridRowStart: Math.floor(i / cols) + 2,
            // + 1 because grid is 1-indexed
            // + 1 because first column is time
            gridColumnStart: (i % cols) + 2,
          }}
          className={clsx(
            "border-[0.5px] border-border-gray-200",
            // Increase topmost border width
            i < cols && "border-t-[1px]",
            // Removes leftmost border
            i % cols === 0 && "border-l-0",
            // Removes bottom-most border
            i > cols * rows - cols - 1 && "border-b-0",
            // Removes rightmost border
            (i + 1) % cols === 0 && "border-r-0",
            // Composition of lighter border
            Math.floor(i / cols) % 2
              ? "border-t-border-gray-100"
              : "border-b-border-gray-100",
            // Darken weekends
            (i % cols === 5 || i % cols === 6) && "bg-zinc-200/40",
          )}
        />
      ))}
    </>
  );
};

export default Border;