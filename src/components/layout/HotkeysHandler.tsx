"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useHotkeys } from "@mantine/hooks";

/**
 * Mantine Hooks - Hotkeys Handler
 * Uses `@mantine/hooks` to provide hospital-grade clinical keyboard navigation
 * across portals without requiring mouse intervention.
 */
export const HotkeysHandler: React.FC = () => {
  const router = useRouter();

  useHotkeys([
    ["alt+1", () => router.push("/pharmacist")],
    ["alt+2", () => router.push("/doctor")],
    ["alt+3", () => router.push("/patient")],
    ["alt+4", () => router.push("/admin")],
  ]);

  return null;
};
