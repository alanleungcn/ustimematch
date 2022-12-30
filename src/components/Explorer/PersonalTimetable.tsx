import Button from "@ui/Button";
import ColorChip from "./ColorChip";
import PersonalTimetableModal from "../Form/PersonalTimetableModal";
import { useStore } from "../../store";
import { IconEye, IconEyeOff } from "@tabler/icons";

const PersonalTimetable = () => {
  const personalTimetable = useStore.use.personalTimetable();
  const personalTimetableConfig = useStore.use.personalTimetableConfig();
  const togglePersonalTimetableVisible =
    useStore.use.togglePersonalTimetableVisible();
  const setPersonalTimetable = useStore.use.setPersonalTimetable();

  return (
    <>
      <div className="border-t border-border-gray-100">
        {personalTimetable ? (
          <div className="flex gap-4">
            <div className="flex flex-grow items-center gap-2 overflow-hidden pl-4">
              <ColorChip color={personalTimetable.color} />
              <span title={personalTimetable.name} className="truncate">
                {personalTimetable.name}
              </span>
            </div>

            <div className="flex gap-2 py-2 pr-4">
              <Button
                icon
                title="Toggle personal timetable visibility"
                onClick={togglePersonalTimetableVisible}
              >
                {personalTimetableConfig.visible ? (
                  <IconEye stroke={1.75} className="h-5 w-5" />
                ) : (
                  <IconEyeOff stroke={1.75} className="h-5 w-5" />
                )}
              </Button>

              <PersonalTimetableModal
                onAdd={(timetable) => setPersonalTimetable(timetable)}
                timetable={personalTimetable}
                onDelete={() => setPersonalTimetable(null)}
              />
            </div>
          </div>
        ) : (
          <div className="py-2 px-4">
            <PersonalTimetableModal
              onAdd={(timetable) => setPersonalTimetable(timetable)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default PersonalTimetable;
