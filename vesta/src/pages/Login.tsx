import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await signIn(username, password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/try-on";
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="container-FitnTry flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2 text-center">Welcome back</p>
        <h1 className="mb-8 text-center font-display text-3xl">Log in to FitnTry</h1>

        {error && (
          <div className="mb-6">
            <Alert title={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
            />
          </div>

          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-ink-soft">
          New to FitnTry?{" "}
          <Link to="/signup" className="font-medium text-ink underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
