"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CommandPalette, openCommandPalette } from "@/components/layout/CommandPalette";
import { ShortcutsModal, openShortcutsModal } from "@/components/layout/ShortcutsModal";
import { clinicalToast } from "@/lib/toast";

/**
 * Global Hotkeys & Shortcuts Handler
 * Provides super smooth keyboard accessibility:
 * - Cmd+K / Ctrl+K: Global Command Palette Spotlight
 * - ?: Shortcuts cheat sheet dialog
 * - Alt+1..4 (in mock mode): Instant workspace switching across roles
 */
export const HotkeysHandler: React.FC = () => {
  const router = useRouter();
  const { switchRole, isMockMode } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      // ? key opens shortcuts modal (when not inside an input field)
      if (e.key === "?" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openShortcutsModal();
        return;
      }

      // Alt+1..4 workspace jumping in mock/demo mode
      if (e.altKey && !e.ctrlKey && !e.metaKey && isMockMode) {
        if (e.key === "1") {
          e.preventDefault();
          switchRole("PHARMACIST");
          router.push("/pharmacist");
          clinicalToast.info("Clinical Workspace: Pharmacist", "Switched to Outpatient CDS Terminal (⌥1)");
        } else if (e.key === "2") {
          e.preventDefault();
          switchRole("DOCTOR");
          router.push("/doctor");
          clinicalToast.info("Clinical Workspace: Doctor (MD)", "Switched to Attending Physician Triage (⌥2)");
        } else if (e.key === "3") {
          e.preventDefault();
          switchRole("PATIENT");
          router.push("/patient");
          clinicalToast.info("Clinical Workspace: Patient Hub", "Switched to Patient Care Overview (⌥3)");
        } else if (e.key === "4") {
          e.preventDefault();
          switchRole("HOSPITAL_ADMIN");
          router.push("/admin");
          clinicalToast.info("Clinical Workspace: Hospital Admin", "Switched to Governance & Rules (⌥4)");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, switchRole, isMockMode]);

  return (
    <>
      <CommandPalette />
      <ShortcutsModal />
    </>
  );
};
