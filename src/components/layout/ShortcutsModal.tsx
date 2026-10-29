"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Kbd } from "@/components/ui/Kbd";
import { Keyboard, Stethoscope, Pill, User, ShieldAlert, Sparkles, X } from "lucide-react";

export function openShortcutsModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-shortcuts-modal"));
  }
}

export const ShortcutsModal: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    window.addEventListener("open-shortcuts-modal", handleOpen);
    window.addEventListener("close-shortcuts-modal", handleClose);

    return () => {
      window.removeEventListener("open-shortcuts-modal", handleOpen);
      window.removeEventListener("close-shortcuts-modal", handleClose);
    };
  }, []);

  const shortcutGroups = [
    {
      title: "Global & Search Navigation",
      items: [
        { keys: ["⌘", "K"], altKeys: ["Ctrl", "K"], description: "Open Command Palette / Spotlight search" },
        { keys: ["?"], description: "Open this keyboard shortcuts cheat sheet" },
        { keys: ["Esc"], description: "Close active modal, menu, or command palette" },
      ],
    },
    {
      title: "Instant Persona & Workspace Jump (Demo Mode)",
      items: [
        { keys: ["⌥", "1"], altKeys: ["Alt", "1"], description: "Switch to Pharmacist Clinical Workspace", icon: Pill },
        { keys: ["⌥", "2"], altKeys: ["Alt", "2"], description: "Switch to Attending Doctor Triage Portal", icon: Stethoscope },
        { keys: ["⌥", "3"], altKeys: ["Alt", "3"], description: "Switch to Patient Care Hub", icon: User },
        { keys: ["⌥", "4"], altKeys: ["Alt", "4"], description: "Switch to Hospital Administration Portal", icon: ShieldAlert },
      ],
    },
    {
      title: "Pharmacist & Clinical Workflow",
      items: [
        { keys: ["G", "P"], description: "Go to Pharmacist Work Queue" },
        { keys: ["G", "C"], description: "Go to Prescription Capture (Camera/OCR)" },
        { keys: ["G", "S"], description: "Go to Patient Search & Directory" },
        { keys: ["G", "D"], description: "Go to Doctor Triage Tasks" },
        { keys: ["G", "H"], description: "Go to Patient Health Overview" },
        { keys: ["G", "A"], description: "Go to Hospital Governance & Rules" },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl bg-white">
        <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-800 flex items-center justify-center font-bold">
              <Keyboard className="size-4.5" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Keyboard Shortcuts Cheat Sheet</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Super Smooth UX
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Navigate PharmaVigil with lightning speed using keyboard hotkeys.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </h4>
              <div className="space-y-1.5">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 transition-colors text-xs"
                  >
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      {item.icon && <item.icon className="size-3.5 text-teal-700 shrink-0" />}
                      <span>{item.description}</span>
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {item.keys.map((k, kIdx) => (
                        <Kbd key={kIdx} className="bg-white border-slate-200 text-slate-800 font-bold px-2 py-0.5 text-[11px]">
                          {k}
                        </Kbd>
                      ))}
                      {item.altKeys && (
                        <span className="text-[10px] text-slate-400 ml-1">
                          or {item.altKeys.join("+")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="size-3 text-teal-600" />
            <span>Tip: Press <Kbd className="bg-white">?</Kbd> anytime to toggle this helper</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
