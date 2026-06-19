import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import styles from "./AppButton.module.scss";

type AppButtonVariant = "primary" | "ghost" | "soft";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: AppButtonVariant;
};

const appButtonVariants: Record<AppButtonVariant, string> = {
  primary: styles.primary,
  ghost: styles.ghost,
  soft: styles.soft,
};

export function AppButton({ children, variant = "primary", className = "", ...props }: AppButtonProps) {
  return (
    <button className={clsx(styles.button, appButtonVariants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export { AppButton as Button };
