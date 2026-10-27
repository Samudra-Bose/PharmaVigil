"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ExternalLink, Inbox, Loader2 } from "lucide-react";
import { api, type NotificationItem } from "@/lib/api-client";
import { clinicalToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export const NotificationBell: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications(false);
      setNotifications(data || []);
    } catch (err) {
      // Background fetch failure should not crash UI
      console.warn("Notification auto-refresh failed:", err);
    }
  }, []);

  // Initial fetch and 30s polling + window focus revalidation
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    const onFocus = () => {
      fetchNotifications();
    };

    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNotifications]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Optimistic Mark As Read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMarkingId(id);

    // Snapshot previous state for rollback
    const prevList = [...notifications];
    setNotifications((curr) =>
      curr.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await api.markNotificationRead(id);
    } catch (err) {
      // Rollback on failure
      setNotifications(prevList);
      clinicalToast.error(err, "Failed to mark notification read");
    } finally {
      setMarkingId(null);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadItems = notifications.filter((n) => !n.read);
    if (unreadItems.length === 0) return;

    const prevList = [...notifications];
    setNotifications((curr) => curr.map((n) => ({ ...n, read: true })));

    try {
      await Promise.all(unreadItems.map((n) => api.markNotificationRead(n.id)));
      clinicalToast.success("All caught up", "Marked all notifications as read.");
    } catch (err) {
      setNotifications(prevList);
      clinicalToast.error(err, "Failed to mark all as read");
    }
  };

  const getPriorityInfo = (type: string) => {
    switch (type) {
      case "PRESCRIPTION_ALERT_FLAGGED":
      case "ALERT_FLAGGED":
        return {
          priority: "CRITICAL",
          badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
          dotClass: "bg-rose-500",
        };
      case "MEDICATION_ORDER_ALERT_FLAGGED":
      case "CHANGE_REQUIRED":
        return {
          priority: "WARNING",
          badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
          dotClass: "bg-amber-500",
        };
      default:
        return {
          priority: "INFO",
          badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
          dotClass: "bg-teal-500",
        };
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      handleMarkAsRead(item.id);
    }
    setIsOpen(false);

    // Smart route navigation based on type / subjectId
    if (item.type === "PRESCRIPTION_ALERT_FLAGGED" && item.subjectId) {
      router.push(`/pharmacist/cases/${item.subjectId}/results`);
    } else if (item.type === "APPOINTMENT_BOOKED") {
      router.push("/patient/appointments");
    } else if (item.type === "MEMBERSHIP_REQUEST") {
      router.push("/admin/memberships");
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  const displayedNotifications = activeTab === "UNREAD"
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="Clinical notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(
          "relative p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
          isOpen && "bg-slate-100 text-slate-900"
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <>
            <span
              className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold font-mono text-white ring-2 ring-white"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-400 animate-ping opacity-60" />
          </>
        )}
      </button>

      {/* Dropdown / Drawer Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications Drawer"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200/90 shadow-xl z-50 overflow-hidden flex flex-col text-xs animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold font-mono border border-rose-200/80">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-medium text-teal-700 hover:text-teal-900 hover:underline transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center border-b border-slate-200 px-3 bg-slate-50/40 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "py-2 px-2 border-b-2 text-[11px] font-semibold transition-all -mb-[1px]",
                activeTab === "ALL"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={cn(
                "py-2 px-2 border-b-2 text-[11px] font-semibold transition-all -mb-[1px]",
                activeTab === "UNREAD"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Inbox className="w-8 h-8 mx-auto stroke-[1.5] text-slate-300" />
                <p className="text-xs">No notifications found.</p>
              </div>
            ) : (
              displayedNotifications.map((n) => {
                const priorityInfo = getPriorityInfo(n.type);
                const isMarking = markingId === n.id;

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50/80 group",
                      !n.read && "bg-teal-50/20"
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        n.read ? "bg-slate-200" : priorityInfo.dotClass
                      )}
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded border text-[9px] font-bold font-mono tracking-wider",
                            priorityInfo.badgeClass
                          )}
                        >
                          {priorityInfo.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "text-xs leading-snug",
                          n.read ? "text-slate-700 font-medium" : "text-slate-900 font-bold"
                        )}
                      >
                        {n.title}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        disabled={isMarking}
                        title="Mark as read"
                        aria-label={`Mark "${n.title}" as read`}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 opacity-70 group-hover:opacity-100"
                      >
                        {isMarking ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
