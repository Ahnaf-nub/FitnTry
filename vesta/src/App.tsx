import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ToastProvider } from "@/components/ui/Toast";
import { TryOnProvider } from "@/hooks/useTryOnStore";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Home from "@/pages/Home";
import TryOn from "@/pages/TryOn";
import Result from "@/pages/Result";
import Discover from "@/pages/Discover";
import Saved from "@/pages/Saved";
import MyStore from "@/pages/MyStore";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <TryOnProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/try-on"
                element={
                  <ProtectedRoute>
                    <TryOn />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/result"
                element={
                  <ProtectedRoute>
                    <Result />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <Saved />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-store"
                element={
                  <ProtectedRoute>
                    <MyStore />
                  </ProtectedRoute>
                }
              />
              <Route path="/discover" element={<Discover />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </TryOnProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
