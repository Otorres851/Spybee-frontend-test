"use client";

import spybeeLogo from "@/assets/logo/spybee-logo.png";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { NotificationBell } from "@/components/common/NotificationBell";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { UserDropdown } from "@/components/common/UserDropdown";
import { useT } from "@/hooks/useT";
import { routes } from "@/router/routes";
import { useUiStore } from "@/stores/useUiStore";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.scss";

/**
 * Top navigation with project context, language, theme and user actions.
 */
export function Header() {
  const t = useT();
  const mobileNav = useUiStore((state) => state.mobileNav);
  const setMobileNav = useUiStore((state) => state.setMobileNav);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          onClick={() => setMobileNav(!mobileNav)}
          className={styles.menuButton}
          aria-label={mobileNav ? t.closeMenu : t.openMenu}
        >
          {mobileNav ? <X size={19} /> : <Menu size={19} />}
        </button>

        <Link href={routes.dashboard} className={styles.brand} aria-label="Spybee">
          <span className={styles.logoMark} aria-hidden="true">
            <Image src={spybeeLogo} alt="" width={96} height={96} priority />
          </span>
          <span className={styles.logoText}>
            <span>Spy</span>
            <strong>bee</strong>
          </span>
        </Link>
      </div>

      <strong className={styles.project}>{t.project}</strong>

      <div className={styles.actions}>
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
        <UserDropdown />
      </div>
    </header>
  );
}
