"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, ApiClientError } from "@/lib/api-client";
import type { CurrentUserResponse, Membership, UserRole } from "@/types";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: CurrentUserResponse["user"] | null;
  membership: Membership | null;
  role: UserRole | null;
  hospitalName: string;
  isLoading: boolean;
  isMockMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUserResponse["user"] | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [hospitalName, setHospitalName] = useState<string>("Metro General Hospital");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const isMockMode = api.getMockMode();

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getCurrentUser();
      setUser(res.user);
      const activeMem = res.memberships[0] || null;
      setMembership(activeMem);
      const assigned = (activeMem?.assignedRole || activeMem?.requestedRole) as UserRole | undefined;
      setRole(assigned || null);
      setHospitalName("Metro General Hospital");
    } catch (err) {
      setUser(null);
      setMembership(null);
      setRole(null);
      if (
        err instanceof ApiClientError &&
        err.code === "UNAUTHENTICATED" &&
        !pathname?.startsWith("/auth")
      ) {
        router.push("/auth/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      const activeMem = res.memberships[0] || null;
      setMembership(activeMem);
      const userRole = (activeMem?.assignedRole || activeMem?.requestedRole) as UserRole | undefined;
      setRole(userRole || null);

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
      router.push("/auth/login");
    }
  };

  const switchRole = async (targetRole: UserRole) => {
    api.switchDemoRole(targetRole);
    await refreshSession();
    if (targetRole === "PHARMACIST") router.push("/pharmacist");
    if (targetRole === "DOCTOR") router.push("/doctor");
    if (targetRole === "PATIENT") router.push("/patient");
    if (targetRole === "HOSPITAL_ADMIN") router.push("/admin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        membership,
        role,
        hospitalName,
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
