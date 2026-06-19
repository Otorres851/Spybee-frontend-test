"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useT } from "@/hooks/useT";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/useAuthStore";
import styles from "./CommonControls.module.scss";

export function UserDropdown() {
  const t = useT();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace(routes.login);
  };

  return (
    <div className={styles.userMenu}>
      <button
        type="button"
        className={`${styles.control} ${styles.userButton}`}
        aria-label={t.openUser}
      >
        <span className={styles.avatar}>{user?.initials ?? "JT"}</span>
        <span className={styles.userText}>
          <strong className={styles.userName}>{user?.name ?? "Julian"}</strong>
          <span className={styles.userRole}>{t.superadmin}</span>
        </span>
        <ChevronDown size={14} />
      </button>

      <button type="button" className={styles.logoutButton} onClick={handleLogout} aria-label={t.logout}>
        <LogOut size={15} />
        <span>{t.logout}</span>
      </button>
    </div>
  );
}
