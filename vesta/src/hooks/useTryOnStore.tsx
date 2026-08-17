import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  BodyArea,
  Garment,
  GenerationStatus,
  SavedLook,
  StyleOccasion,
  TryOnError,
} from "@/types/tryOn";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import {
  fetchSavedLooks,
  insertSavedLook,
  setSavedLookFavorite,
  deleteSavedLook,
} from "@/services/savedLooksApi";

interface TryOnState {
  userImage: string | null;
  garment: Garment | null;
  bodyArea: BodyArea;
  style: StyleOccasion | null;
  status: GenerationStatus;
  jobId: string | null;
  resultImage: string | null;
  error: TryOnError | null;
}

interface TryOnContextValue extends TryOnState {
  setUserImage: (image: string | null) => void;
  setGarment: (garment: Garment | null) => void;
  setBodyArea: (area: BodyArea) => void;
  setStyle: (style: StyleOccasion | null) => void;
  setStatus: (status: GenerationStatus) => void;
  setJobId: (id: string | null) => void;
  setResultImage: (url: string | null) => void;
  setError: (err: TryOnError | null) => void;
  resetWorkflow: () => void;
  savedLooks: SavedLook[];
  savedLooksLoading: boolean;
  saveCurrentLook: () => Promise<SavedLook | null>;
  toggleFavorite: (id: string) => void;
  removeSavedLook: (id: string) => void;
}

const initialState: TryOnState = {
  userImage: null,
  garment: null,
  bodyArea: "Auto Detect",
  style: null,
  status: "idle",
  jobId: null,
  resultImage: null,
  error: null,
};

const TryOnContext = createContext<TryOnContextValue | null>(null);

export function TryOnProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { push } = useToast();

  const [state, setState] = useState<TryOnState>(initialState);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [savedLooksLoading, setSavedLooksLoading] = useState(false);

  // Load this user's saved looks from Supabase on login; clear on logout so
  // one account never sees a flash of the previous account's looks.
  useEffect(() => {
    if (!user) {
      setSavedLooks([]);
      return;
    }
    let cancelled = false;
    setSavedLooksLoading(true);
    fetchSavedLooks(user.id)
      .then((looks) => {
        if (!cancelled) setSavedLooks(looks);
      })
      .catch((err) => {
        if (!cancelled) {
          push({
            kind: "error",
            title: "Couldn't load your saved looks",
            description: err instanceof Error ? err.message : undefined,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setSavedLooksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, push]);

  const setUserImage = useCallback((image: string | null) => {
    setState((s) => ({ ...s, userImage: image }));
  }, []);
  const setGarment = useCallback((garment: Garment | null) => {
    setState((s) => ({ ...s, garment }));
  }, []);
  const setBodyArea = useCallback((bodyArea: BodyArea) => {
    setState((s) => ({ ...s, bodyArea }));
  }, []);
  const setStyle = useCallback((style: StyleOccasion | null) => {
    setState((s) => ({ ...s, style }));
  }, []);
  const setStatus = useCallback((status: GenerationStatus) => {
    setState((s) => ({ ...s, status }));
  }, []);
  const setJobId = useCallback((jobId: string | null) => {
    setState((s) => ({ ...s, jobId }));
  }, []);
  const setResultImage = useCallback((resultImage: string | null) => {
    setState((s) => ({ ...s, resultImage }));
  }, []);
  const setError = useCallback((error: TryOnError | null) => {
    setState((s) => ({ ...s, error }));
  }, []);
  const resetWorkflow = useCallback(() => {
    setState((s) => ({ ...initialState, userImage: s.userImage }));
  }, []);

  const saveCurrentLook = useCallback(async (): Promise<SavedLook | null> => {
    if (!state.garment || !state.resultImage || !state.userImage || !user) return null;
    try {
      const look = await insertSavedLook(user.id, {
        resultImage: state.resultImage,
        beforeImage: state.userImage,
        garment: state.garment,
        style: state.style ?? undefined,
      });
      setSavedLooks((looks) => [look, ...looks]);
      return look;
    } catch (err) {
      push({
        kind: "error",
        title: "Couldn't save this look",
        description: err instanceof Error ? err.message : undefined,
      });
      return null;
    }
  }, [state.garment, state.resultImage, state.userImage, state.style, user, push]);

  const toggleFavorite = useCallback(
    (id: string) => {
      const current = savedLooks.find((l) => l.id === id);
      if (!current) return;
      const nextFavorite = !current.favorite;

      // Optimistic update — the DB write happens in the background and
      // rolls the UI back if it fails, instead of blocking on it.
      setSavedLooks((looks) => looks.map((l) => (l.id === id ? { ...l, favorite: nextFavorite } : l)));

      setSavedLookFavorite(id, nextFavorite).catch((err) => {
        setSavedLooks((looks) => looks.map((l) => (l.id === id ? { ...l, favorite: current.favorite } : l)));
        push({
          kind: "error",
          title: "Couldn't update favorite",
          description: err instanceof Error ? err.message : undefined,
        });
      });
    },
    [savedLooks, push]
  );

  const removeSavedLook = useCallback(
    (id: string) => {
      const removed = savedLooks.find((l) => l.id === id);
      if (!removed) return;

      // Optimistic removal, restored on failure — same pattern as favorites.
      setSavedLooks((looks) => looks.filter((l) => l.id !== id));

      deleteSavedLook(id).catch((err) => {
        setSavedLooks((looks) => [removed, ...looks]);
        push({
          kind: "error",
          title: "Couldn't remove this look",
          description: err instanceof Error ? err.message : undefined,
        });
      });
    },
    [savedLooks, push]
  );

  const value = useMemo<TryOnContextValue>(
    () => ({
      ...state,
      setUserImage,
      setGarment,
      setBodyArea,
      setStyle,
      setStatus,
      setJobId,
      setResultImage,
      setError,
      resetWorkflow,
      savedLooks,
      savedLooksLoading,
      saveCurrentLook,
      toggleFavorite,
      removeSavedLook,
    }),
    [
      state,
      savedLooks,
      savedLooksLoading,
      setUserImage,
      setGarment,
      setBodyArea,
      setStyle,
      setStatus,
      setJobId,
      setResultImage,
      setError,
      resetWorkflow,
      saveCurrentLook,
      toggleFavorite,
      removeSavedLook,
    ]
  );

  return <TryOnContext.Provider value={value}>{children}</TryOnContext.Provider>;
}

export function useTryOnStore() {
  const ctx = useContext(TryOnContext);
  if (!ctx) throw new Error("useTryOnStore must be used within TryOnProvider");
  return ctx;
}
