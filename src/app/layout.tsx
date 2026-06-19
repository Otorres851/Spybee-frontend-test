import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/context/AppProviders";
import "@/styles/globals.scss";
import "mapbox-gl/dist/mapbox-gl.css";

export const metadata: Metadata = {
  title: "Spybee Technical UI",
  description: "Premium mockup for frontend technical test",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

const themeScript = `
  try {
    var theme = localStorage.getItem("spybee-theme");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (error) {}
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
