"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUiStore } from "@/stores/useUiStore";
import styles from "./AppShell.module.scss";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dark = useUiStore((state) => state.dark);
  const setTheme = useUiStore((state) => state.setTheme);
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const authStatus = useAuthStore((state) => state.status);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("spybee-theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme === "dark");
    }
    setHydrated(true);
  }, [setTheme]);

  useEffect(() => {
    if (hydrated && authStatus === "unauthenticated") {
      router.replace(routes.login);
    }
  }, [authStatus, hydrated, router]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    if (hydrated) window.localStorage.setItem("spybee-theme", dark ? "dark" : "light");
  }, [dark, hydrated]);

  if (!hydrated || authStatus === "idle" || authStatus === "unauthenticated") {
    return <div className={styles.authLoader} aria-hidden="true" />;
  }

  return (
    <>
      <Header />
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </>
  );
}
