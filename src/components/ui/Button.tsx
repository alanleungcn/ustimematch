import clsx from "clsx";
import React from "react";
import Spinner from "./Spinner";

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  plain?: boolean;
  icon?: boolean;
  error?: boolean;
  toggle?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Button component
 * @param   {boolean} plain     Remove border and background
 * @param   {boolean} toggle    Control the style of toggle button
 * @param   {boolean} loading   Whether button is loading (should be used with disabled)
 */
const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      children,
      className,
      plain = false,
      icon = false,
      error = false,
      toggle = false,
      loading = false,
      disabled = false,
      fullWidth = false,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      {...props}
      disabled={disabled}
      className={clsx(
        "flex h-10 select-none items-center justify-center gap-2 rounded-md border border-border-100 bg-bg-100 text-fg-100 transition-all",
        "active:bg-bg-200 active:text-fg-500 dark:bg-bg-200 dark:active:bg-bg-300",
        "enabled:hover:border-border-200 enabled:hover:text-fg-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        fullWidth && "w-full",
        icon ? "w-10 flex-shrink-0" : "px-4",
        toggle && "bg-bg-400 active:bg-bg-400",
        error &&
          "text-red-600 focus-visible:ring-red-200/80 focus-visible:ring-offset-red-400 enabled:hover:text-red-700 enabled:active:text-red-700",
        plain &&
          "h-auto w-auto border-none bg-transparent p-[2px] opacity-80 enabled:hover:opacity-100",
        className,
      )}
    >
      {loading ? <Spinner /> : children}
    </button>
  ),
);
Button.displayName = "Button";

export default Button;
