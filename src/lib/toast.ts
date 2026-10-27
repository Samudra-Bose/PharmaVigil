import { toast } from "sonner";
import { ApiClientError } from "./api-client";

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const clinicalToast = {
  /** High-contrast clinical success notification */
  success(title: string, description?: string, options?: ToastOptions) {
    return toast.success(title, {
      description,
      duration: options?.duration ?? 3500,
      action: options?.action,
    });
  },

  /** Safety warnings (e.g. non-blocking risk, unreviewed items) */
  warning(title: string, description?: string, options?: ToastOptions) {
    return toast.warning(title, {
      description,
      duration: options?.duration ?? 5000,
      action: options?.action,
    });
  },

  /** Clinical info or operational notice */
  info(title: string, description?: string, options?: ToastOptions) {
    return toast.info(title, {
      description,
      duration: options?.duration ?? 3500,
      action: options?.action,
    });
  },

  /**
   * Actionable 409 Stale Version Conflict Prompt.
   * Provides immediate inline action to reload state and avoid clinical data loss.
   */
  conflict(message: string, onReload?: () => void) {
    return toast.error("Clinical Version Conflict (409)", {
      description: message,
      duration: 8000,
      action: {
        label: "Reload Case",
        onClick: () => {
          if (onReload) onReload();
          else if (typeof window !== "undefined") window.location.reload();
        },
      },
    });
  },

  /**
   * Enterprise error envelope handler.
   * Parses ApiClientError, RFC-7807 problem payloads, requestId, and details.
   */
  error(err: unknown, fallbackMessage = "Operation Failed") {
    if (err instanceof ApiClientError) {
      if (err.code === "CONFLICT" || err.code === "STALE_VERSION" || err.message?.includes("409")) {
        return clinicalToast.conflict(
          err.message || "Prescription was updated by another clinician. Please reload.",
          () => {
            if (typeof window !== "undefined") window.location.reload();
          }
        );
      }

      const reqIdTag = err.requestId ? ` [Ref: ${err.requestId.slice(0, 8)}]` : "";
      const fieldDetails = err.details?.length
        ? err.details.map((d) => d.message).join(" • ")
        : undefined;

      return toast.error(`${fallbackMessage}${reqIdTag}`, {
        description: fieldDetails || err.message,
        duration: 6000,
      });
    }

    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "CONFLICT") {
      const msg = (err as { message?: string }).message || "Version conflict detected.";
      return clinicalToast.conflict(msg);
    }

    const message = err instanceof Error ? err.message : String(err ?? fallbackMessage);
    return toast.error(fallbackMessage, {
      description: message !== fallbackMessage ? message : undefined,
      duration: 5000,
    });
  },

  /** Wrapper for async promises with loading state */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) {
    return toast.promise(promise, messages);
  },
};
