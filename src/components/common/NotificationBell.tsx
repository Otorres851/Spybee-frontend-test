import { Bell } from "lucide-react";
import { useT } from "@/hooks/useT";
import styles from "./CommonControls.module.scss";

export function NotificationBell() {
  const t = useT();

  return (
    <button
      type="button"
      className={`${styles.control} ${styles.notification}`}
      aria-label={t.notifications}
    >
      <Bell size={17} />
      <span className={styles.badge}>3</span>
    </button>
  );
}
