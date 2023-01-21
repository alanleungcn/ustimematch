import * as Popover from "@radix-ui/react-popover";
import { IconInfoCircle } from "@tabler/icons";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import type { HTMLAttributes } from "react";
import { useState } from "react";
import Button from "./Button";
import { tipsVariants } from "./variants";

interface Props extends HTMLAttributes<HTMLDivElement> {
  triggerClassName?: string;
  image?: boolean;
}

const Tips = ({ children, image, className, triggerClassName }: Props) => {
  const [openTips, setOpenTips] = useState(false);

  return (
    <Popover.Root open={openTips} onOpenChange={setOpenTips}>
      <Popover.Trigger asChild>
        <Button
          icon
          plain
          className={clsx("!h-5 !w-5 rounded-full", triggerClassName)}
        >
          <IconInfoCircle stroke={1.75} className="h-4 w-4" />
        </Button>
      </Popover.Trigger>

      <AnimatePresence>
        {openTips && (
          <Popover.Portal forceMount>
            <Popover.Content
              forceMount
              asChild
              side="top"
              sideOffset={6}
              collisionPadding={6}
            >
              <motion.div
                exit="close"
                animate="open"
                initial="close"
                variants={tipsVariants}
                className={clsx(
                  "z-50 origin-[var(--radix-popover-content-transform-origin)] rounded-md bg-bg-200 text-sm shadow-elevation focus-visible:outline-none",
                  image ? "w-96 rounded-lg p-2" : "w-52 px-4 py-2",
                  className,
                )}
              >
                {children}
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
};

export default Tips;
