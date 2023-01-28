import { useTrackedStore } from "@store/index";
import { DISPLAYED_HOURS } from "@store/ui";
import useDate from "@hooks/useDate";

const Timeline = () => {
  const { date } = useDate();

  const showWeekend = useTrackedStore().ui.showWeekend();
  const minuteHeight = useTrackedStore().weekView.minuteHeight();

  const weekday = (date.getDay() + 6) % 7;

  // 1-indexed grid + 1 col time
  const gridColumnStart = weekday + 2;

  const minSinceBegin =
    (date.getHours() - (DISPLAYED_HOURS[0] as number)) * 60 + date.getMinutes();

  const overflow =
    (DISPLAYED_HOURS[0] as number) > date.getHours() ||
    (DISPLAYED_HOURS[DISPLAYED_HOURS.length - 1] as number) < date.getHours() ||
    (!showWeekend && weekday > 4);

  // check minuteHeight for preventing initial flash
  return !overflow && minuteHeight ? (
    <div
      className="pointer-events-none relative -ml-[3px] overflow-y-hidden sm:-ml-[4px]"
      style={{
        gridColumnStart,
        gridRow: "2/-1",
      }}
    >
      <div
        style={{ top: minSinceBegin * minuteHeight }}
        className="absolute -mt-[1.25px] h-[2.5px] w-full rounded-full bg-brand sm:-mt-[1.5px] sm:h-[3px]"
      />

      <div
        style={{ top: minSinceBegin * minuteHeight }}
        className="absolute -mt-[3px] h-[6px] w-[6px] rounded-full bg-brand sm:-mt-[4px] sm:h-[8px] sm:w-[8px]"
      />
    </div>
  ) : null;
};

export default Timeline;
