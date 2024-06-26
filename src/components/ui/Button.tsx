import clsx from "clsx";
import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import React from "react";
import Spinner from "./Spinner";

interface Props
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  icon?: boolean;
  plain?: boolean;
  error?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Button component
 * @param   {boolean} plain     Remove border and background
 * @param   {boolean} loading   Whether button is loading (should be used with disabled)
 */
const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    { icon, plain, error, loading, fullWidth, className, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      {...props}
      className={clsx(
        "relative flex h-10 select-none items-center justify-center whitespace-nowrap rounded-md transition-focusable",
        "enabled:hover:border-border-200 enabled:hover:text-fg-200",
        "enabled:active:border-border-200 enabled:active:bg-bg-300 enabled:active:text-fg-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        icon ? "w-10 flex-shrink-0 p-1" : "px-4",
        plain
          ? "h-auto w-auto border-none bg-transparent opacity-80 enabled:hover:opacity-100"
          : "border border-border-100 bg-bg-200 text-fg-100",
        error &&
          "text-red-500 focus-visible:ring-red-200/80 focus-visible:ring-offset-red-400 enabled:hover:text-red-600 enabled:active:text-red-600 dark:focus-visible:ring-red-400/20 dark:focus-visible:ring-offset-red-600",
        fullWidth && "w-full",
        className,
      )}
    >
      {/* Preserve layout when loading */}
      <div
        className={clsx(
          "flex items-center justify-center gap-2",
          loading && "invisible",
        )}
      >
        {children}
      </div>

      {loading && <Spinner className="absolute" />}
    </button>
  ),
);
Button.displayName = "Button";

export default Button;
