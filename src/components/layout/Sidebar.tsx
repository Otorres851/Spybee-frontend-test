"use client";

import spybeeLogo from "@/assets/logo/spybee-logo.png";
import { useT } from "@/hooks/useT";
import { routes } from "@/router/routes";
import { useUiStore } from "@/stores/useUiStore";
import clsx from "clsx";
import {
  Calendar,
  Clock,
  Folder,
  Home,
  Image,
  Info,
  MapPin,
  Settings,
  Share2,
  X,
} from "lucide-react";
import LogoImage from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.scss";

/**
 * Responsive navigation: desktop rail, mobile drawer and bottom tabs.
 */
export function Sidebar() {
  const path = usePathname();
  const t = useT();
  const { mobileNav, setMobileNav } = useUiStore();
  const items = [
    [routes.dashboard, Home, t.home],
    [routes.map, MapPin, t.map],
    [routes.details, Info, t.details],
    [routes.risk, Clock, t.risk],
    [routes.calendar, Calendar, t.activity],
    [routes.media, Image, t.media],
    [routes.files, Folder, t.files],
  ] as const;

  const isActive = (href: string) =>
    path === href ||
    (href === routes.dashboard && path === routes.dashboard) ||
    (href === routes.map && path === routes.map);

  const getIconClassName = (href: string) =>
    clsx(styles.iconLink, {
      [styles.active]: isActive(href),
    });

  const getDrawerLinkClassName = (href: string) =>
    clsx(styles.drawerLink, {
      [styles.drawerLinkActive]: isActive(href),
    });

  const getBottomTabClassName = (href: string) =>
    clsx(styles.bottomTab, {
      [styles.bottomTabActive]: isActive(href),
    });

  return (
    <>
      <aside className={styles.desktopSidebar}>
        <div className={styles.navList}>
          {items.slice(0, 8).map(([href, Icon, label]) => (
            <Link
              aria-label={label}
              key={`${href}-${label}`}
              href={href}
              className={getIconClassName(href)}
            >
              <Icon size={20} />
            </Link>
          ))}
        </div>

        <div className={styles.footerActions}>
          <button className={styles.actionButton} aria-label={t.settings}>
            <Settings size={19} />
          </button>
          <button className={styles.actionButton} aria-label={t.share}>
            <Share2 size={19} />
          </button>
        </div>
      </aside>

      <div
        className={clsx(
          styles.backdrop,
          mobileNav ? styles.backdropVisible : styles.backdropHidden
        )}
        onClick={() => setMobileNav(false)}
      />

      <aside className={clsx(styles.drawer, mobileNav ? styles.drawerOpen : styles.drawerClosed)}>
        <div className={styles.drawerHeader}>
          <b className={styles.drawerLogo}>
            <span className={styles.drawerLogoMark} aria-hidden="true">
              <LogoImage src={spybeeLogo} alt="" width={64} height={64} priority />
            </span>
            Spy<span className={styles.drawerLogoAccent}>bee</span>
          </b>
          <button
            onClick={() => setMobileNav(false)}
            className={styles.closeButton}
            aria-label={t.closeMenu}
          >
            <X size={18} />
          </button>
        </div>

        <nav className={styles.drawerNav}>
          {items.map(([href, Icon, label]) => (
            <Link
              onClick={() => setMobileNav(false)}
              key={`${href}-${label}`}
              href={href}
              className={getDrawerLinkClassName(href)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <nav className={styles.bottomNav}>
        {items.slice(0, 4).map(([href, Icon, label]) => (
          <Link key={`${href}-tab-${label}`} href={href} className={getBottomTabClassName(href)}>
            <Icon size={19} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
