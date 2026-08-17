import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, usernameToEmail } from "@/lib/supabaseClient";

interface AuthError {
  message: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  username: string | null;
  role: "shopper" | "shop";
  loading: boolean;
  signUp: (username: string, password: string, role?: "shopper" | "shop") => Promise<AuthError | null>;
  signIn: (username: string, password: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (
    username: string,
    password: string,
    role: "shopper" | "shop" = "shopper"
  ): Promise<AuthError | null> => {
    const trimmed = username.trim();
    if (trimmed.length < 3) return { message: "Username must be at least 3 characters." };
    if (password.length < 6) return { message: "Password must be at least 6 characters." };

    const { data, error } = await supabase.auth.signUp({
      email: usernameToEmail(trimmed),
      password,
      options: { data: { username: trimmed, role } }, // stored in user_metadata
    });

    if (error) {
      // Supabase reports duplicate emails as "User already registered" —
      // translate that back into username language for the user.
      if (/already registered|already exists/i.test(error.message)) {
        return { message: "That username is taken. Try another." };
      }
      return { message: error.message };
    }

    if (data.session) setSession(data.session);
    return null;
  }, []);

  const signIn = useCallback(async (username: string, password: string): Promise<AuthError | null> => {
    const trimmed = username.trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(trimmed),
      password,
    });

    if (error) {
      return { message: "Incorrect username or password." };
    }

    setSession(data.session);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    username: (session?.user?.user_metadata?.username as string) ?? null,
    role: (session?.user?.user_metadata?.role as "shopper" | "shop") ?? "shopper",
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
