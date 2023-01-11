import { IconCalendarPlus, IconFolderPlus } from "@tabler/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import SortableTree from "@components/Explorer/SortableTree";
import FolderForm from "@components/Modal/FolderForm";
import TimetableForm from "@components/Modal/TimetableForm";
import Button from "@ui/Button";
import { explorerVariants } from "@ui/variants";
import { actions, useTrackedStore } from "@store/index";
import { type Timetable } from "../../types/timetable";
import PersonalTimetable from "./PersonalTimetable";

const AddTimetable = () => {
  const [openImportModal, setOpenImportModal] = useState(false);
  const addTimetable = actions.timetable.addTimetable;

  const onAddTimetable = useCallback(
    (timetable: Timetable) => {
      addTimetable(timetable);
    },
    [addTimetable],
  );

  return (
    <>
      <Button
        fullWidth
        title="Add Timetable"
        onClick={() => setOpenImportModal(true)}
      >
        <IconCalendarPlus stroke={1.75} className="h-5 w-5" />
        Timetable
      </Button>
      <TimetableForm
        open={openImportModal}
        setOpen={setOpenImportModal}
        onAdd={onAddTimetable}
      />
    </>
  );
};

const AddFolder = () => {
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const addFolder = actions.timetable.addFolder;

  const onAddFolder = useCallback(
    (name: string) => {
      addFolder(name);
    },
    [addFolder],
  );

  return (
    <>
      <Button icon title="Add Folder" onClick={() => setOpenFolderModal(true)}>
        <IconFolderPlus stroke={1.75} className="h-5 w-5" />
      </Button>
      <FolderForm
        onAdd={onAddFolder}
        open={openFolderModal}
        setOpen={setOpenFolderModal}
      />
    </>
  );
};

const Explorer = () => {
  const showExplorer = useTrackedStore().ui.showExplorer();

  return (
    <AnimatePresence initial={false}>
      {showExplorer && (
        <motion.div
          exit="close"
          animate="open"
          initial="close"
          variants={explorerVariants}
          className="flex h-full w-[clamp(256px,20%,512px)] flex-shrink-0 flex-col border-r border-border-100"
        >
          <div className="flex gap-2 border-b border-border-100 px-4 py-2">
            <AddTimetable />
            <AddFolder />
          </div>

          <SortableTree />

          <PersonalTimetable />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Explorer;
