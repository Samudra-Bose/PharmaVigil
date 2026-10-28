"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api, ApiClientError } from "@/lib/api-client";
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

const DEFAULT_DEMO_USER: CurrentUserResponse["user"] = {
  id: "usr_pharma_01",
  displayName: "Priya Sharma, RPh",
  accountStatus: "ACTIVE",
};

const DEFAULT_DEMO_MEMBERSHIP: Membership = {
  id: "mem_usr_pharma_01",
  hospitalId: "Metro General Hospital",
  userId: "usr_pharma_01",
  assignedRole: "PHARMACIST",
  requestedRole: "PHARMACIST",
  status: "ACTIVE",
  version: 1,
};

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

  const resolveHospital = async (activeMem: Membership | null) => {
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
  };

  const refreshSession = useCallback(async () => {
    let hasToken: string | null = null;
    let cachedUser: CurrentUserResponse["user"] | null = null;
    let cachedMem: Membership | null = null;
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
    }

    if (!hasToken && !isMockMode && pathname?.startsWith("/auth")) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.getCurrentUser();
      setUser(res.user);
      const activeMem =
        res.memberships?.[0] || (res as any).membership || null;
      setMembership(activeMem);
      const assigned = (activeMem?.assignedRole ||
        activeMem?.requestedRole ||
        (activeMem as any)?.role) as UserRole | undefined;
      setRole(assigned || (isMockMode ? "PHARMACIST" : null));
      await resolveHospital(activeMem);
    } catch (err) {
      if (isMockMode && !pathname?.startsWith("/auth")) {
        setUser(cachedUser || DEFAULT_DEMO_USER);
        setMembership(cachedMem || DEFAULT_DEMO_MEMBERSHIP);
        const assigned = (cachedMem?.assignedRole ||
          cachedMem?.requestedRole ||
          (cachedMem as any)?.role) as UserRole | undefined;
        setRole(assigned || "PHARMACIST");
      } else {
        setUser(null);
        setMembership(null);
        setRole(null);
        setHospital(null);
        if (
          err instanceof ApiClientError &&
          err.code === "UNAUTHENTICATED" &&
          !pathname?.startsWith("/auth")
        ) {
          router.push("/auth/login");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router, isMockMode]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      const activeMem = res.memberships?.[0] || (res as any).membership || null;
      setMembership(activeMem);
      const userRole = (activeMem?.assignedRole ||
        activeMem?.requestedRole ||
        (activeMem as any)?.role) as UserRole | undefined;
      setRole(userRole || null);
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
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setMembership(null);
      setRole(null);
      setHospital(null);
      router.push("/auth/login");
    }
  };

  const switchRole = async (targetRole: UserRole) => {
    if (isMockMode) {
      api.switchDemoRole(targetRole);
      await refreshSession();
      if (targetRole === "PHARMACIST") router.push("/pharmacist");
      if (targetRole === "DOCTOR") router.push("/doctor");
      if (targetRole === "PATIENT") router.push("/patient");
      if (targetRole === "HOSPITAL_ADMIN") router.push("/admin");
    } else {
      console.warn("Role switching is disabled in live authenticated mode.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
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
