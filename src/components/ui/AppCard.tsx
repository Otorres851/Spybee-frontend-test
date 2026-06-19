import type { ReactNode } from "react";
import { clsx } from "clsx";
import styles from "./AppCard.module.scss";

type AppCardProps = {
  children: ReactNode;
  className?: string;
};

export function AppCard({ children, className = "" }: AppCardProps) {
  return <section className={clsx(styles.card, className)}>{children}</section>;
}

export { AppCard as Card };
