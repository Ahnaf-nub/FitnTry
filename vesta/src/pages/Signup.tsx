import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"shopper" | "shop">("shopper");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const err = await signUp(username, password, role);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate(role === "shop" ? "/my-store" : "/try-on", { replace: true });
  }

  return (
    <div className="container-FitnTry flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2 text-center">Get started</p>
        <h1 className="mb-8 text-center font-display text-3xl">Create your FitnTry account</h1>

        {error && (
          <div className="mb-6">
            <Alert title={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">Account type</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("shopper")}
                className={`rounded-sm border px-3.5 py-2.5 text-[13.5px] font-medium transition-colors ${
                  role === "shopper"
                    ? "border-ink bg-ink text-canvas"
                    : "border-line-strong text-ink-soft hover:border-ink/40"
                }`}
              >
                I'm shopping
              </button>
              <button
                type="button"
                onClick={() => setRole("shop")}
                className={`rounded-sm border px-3.5 py-2.5 text-[13.5px] font-medium transition-colors ${
                  role === "shop"
                    ? "border-ink bg-ink text-canvas"
                    : "border-line-strong text-ink-soft hover:border-ink/40"
                }`}
              >
                I own a store
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="username" className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-sm border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-sm border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
            />
          </div>

          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-ink-soft">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
