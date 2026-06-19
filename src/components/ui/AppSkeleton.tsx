import { clsx } from "clsx";
import styles from "./AppSkeleton.module.scss";

type AppSkeletonProps = {
  className?: string;
  variant?: "line" | "avatar" | "card" | "chart";
};

const appSkeletonVariants: Record<NonNullable<AppSkeletonProps["variant"]>, string> = {
  line: "",
  avatar: styles.avatar,
  card: styles.card,
  chart: styles.chart,
};

export function AppSkeleton({ className = "", variant = "line" }: AppSkeletonProps) {
  return (
    <span aria-hidden className={clsx(styles.skeleton, appSkeletonVariants[variant], className)} />
  );
}

export function AppSkeletonStack() {
  return (
    <div className={styles.stack}>
      <AppSkeleton className={styles.lineSm} />
      <AppSkeleton className={styles.lineMd} />
      <AppSkeleton className={styles.lineLg} />
    </div>
  );
}

export { AppSkeleton as Skeleton, AppSkeletonStack as SkeletonStack };
