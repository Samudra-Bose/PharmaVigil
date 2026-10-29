"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  api,
  ApiClientError,
  clearStoredSession,
  isSessionExpired,
  setSessionExpiration,
} from "@/lib/api-client";
import type {
  CurrentUserResponse,
  Membership,
  UserRole,
  Hospital,
} from "@/types";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: CurrentUserResponse["user"] | null;
  membership: Membership | null;
  role: UserRole | null;
  hospitalName: string;
  hospital: Hospital | null;
  isLoading: boolean;
  isMockMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const PROTECTED_PREFIXES = ["/doctor", "/pharmacist", "/patient", "/admin"];

export function isProtectedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export function getLoginRedirectForPath(pathname: string | null | undefined): string {
  if (pathname?.startsWith("/doctor")) return "/auth/login/doctor";
  if (pathname?.startsWith("/pharmacist")) return "/auth/login/pharmacist";
  if (pathname?.startsWith("/patient")) return "/auth/login/patient";
  if (pathname?.startsWith("/admin")) return "/auth/login/admin";
  return "/auth/login";
}

type MembershipWithRole = Membership & { role?: string };

function extractUserRole(mem: MembershipWithRole | null | undefined): UserRole | null {
  if (!mem) return null;
  const roleStr = mem.assignedRole || mem.requestedRole || mem.role;
  return (roleStr as UserRole) || null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<CurrentUserResponse["user"] | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [hospitalName, setHospitalName] = useState<string>(
    "Metro General Hospital",
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const isMockMode = api.getMockMode();

  const resolveHospital = useCallback(async (activeMem: Membership | null) => {
    try {
      const currentHosp = await api.getCurrentHospital();
      if (currentHosp && currentHosp.name) {
        setHospital(currentHosp);
        setHospitalName(currentHosp.name);
      } else if (activeMem?.hospitalId) {
        setHospitalName(activeMem.hospitalId);
      }
    } catch {
      setHospitalName(activeMem?.hospitalId || "Metro General Hospital");
    }
  }, []);

  const refreshSession = useCallback(async () => {
    let hasToken: string | null = null;
    let cachedUser: CurrentUserResponse["user"] | null = null;
    let cachedMem: MembershipWithRole | null = null;

    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        hasToken = localStorage.getItem("pharmavigil_session_token");
        const u = localStorage.getItem("pharmavigil_user");
        if (u) cachedUser = JSON.parse(u);
        const m = localStorage.getItem("pharmavigil_membership");
        if (m) cachedMem = JSON.parse(m);
      }
    } catch {
      hasToken = null;
      cachedUser = null;
      cachedMem = null;
    }

    // 1. Session Expiration Policy: Auto-logout after 2 days (48 hours)
    if (hasToken || cachedUser) {
      if (isSessionExpired()) {
        clearStoredSession();
        setUser(null);
        setMembership(null);
        setRole(null);
        setHospital(null);
        setIsLoading(false);
        try {
          await api.logout();
        } catch {
          // ignore
        }
        if (isProtectedPath(pathname)) {
          router.push(getLoginRedirectForPath(pathname));
        }
        return;
      }
    }

    // 2. Default: NO user is logged in. User MUST log in to access protected portals.
    if (!cachedUser && !hasToken) {
      setUser(null);
      setMembership(null);
      setRole(null);
      setHospital(null);
      setIsLoading(false);
      if (isProtectedPath(pathname)) {
        router.push(getLoginRedirectForPath(pathname));
      }
      return;
    }

    // 3. User is actively logged in within 2 days -> Restore session and stay logged in
    try {
      setIsLoading(true);
      if (isMockMode && cachedUser) {
        setUser(cachedUser);
        setMembership(cachedMem);
        const assigned = extractUserRole(cachedMem);
        setRole(assigned);
        if (assigned) {
          api.restoreMockSession(cachedUser.id, assigned);
        }
        await resolveHospital(cachedMem);
      } else {
        const res = await api.getCurrentUser();
        setUser(res.user);
        const activeMem =
          res.memberships?.[0] ||
          (res as unknown as { membership?: MembershipWithRole }).membership ||
          null;
        setMembership(activeMem);
        const assigned = extractUserRole(activeMem as MembershipWithRole);
        setRole(assigned);
        await resolveHospital(activeMem);
      }
    } catch {
      clearStoredSession();
      setUser(null);
      setMembership(null);
      setRole(null);
      setHospital(null);
      if (isProtectedPath(pathname)) {
        router.push(getLoginRedirectForPath(pathname));
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router, isMockMode, resolveHospital]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password?: string) => {
      setIsLoading(true);
      try {
        const res = await api.login(email, password);
        setUser(res.user);
        const activeMem =
          res.memberships?.[0] ||
          (res as unknown as { membership?: MembershipWithRole }).membership ||
          null;
        setMembership(activeMem);
        const userRole = extractUserRole(activeMem as MembershipWithRole);
        setRole(userRole);
        await resolveHospital(activeMem);

        if (activeMem?.status === "PENDING") {
          router.push("/auth/pending");
        } else if (userRole === "PHARMACIST") {
          router.push("/pharmacist");
        } else if (userRole === "DOCTOR") {
          router.push("/doctor");
        } else if (userRole === "PATIENT") {
          router.push("/patient");
        } else if (userRole === "HOSPITAL_ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router, resolveHospital]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      clearStoredSession();
      setUser(null);
      setMembership(null);
      setRole(null);
      setHospital(null);
      router.push("/auth/login");
    }
  }, [router]);

  const switchRole = useCallback(
    async (targetRole: UserRole) => {
      if (isMockMode) {
        const emailMap: Record<UserRole, string> = {
          PHARMACIST: "pharma@metro-general.invalid",
          DOCTOR: "doctor@metro-general.invalid",
          PATIENT: "patient@metro-general.invalid",
          HOSPITAL_ADMIN: "admin@metro-general.invalid",
        };
        await login(emailMap[targetRole]);
      } else {
        console.warn("Role switching is disabled in live authenticated mode.");
      }
    },
    [isMockMode, login]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      membership,
      role,
      hospitalName,
      hospital,
      isLoading,
      isMockMode,
      login,
      logout,
      switchRole,
      refreshSession,
    }),
    [
      user,
      membership,
      role,
      hospitalName,
      hospital,
      isLoading,
      isMockMode,
      login,
      logout,
      switchRole,
      refreshSession,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
