import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";

const baseLinks = [
  { to: "/try-on", label: "Try On" },
  { to: "/discover", label: "Discover" },
  { to: "/saved", label: "Saved Looks" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, username, role, signOut } = useAuth();

  const links = role === "shop" ? [...baseLinks, { to: "/my-store", label: "My Store" }] : baseLinks;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [navigate]);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
   <header className="sticky top-0 z-50 bg-canvas/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-line/50 dark:border-zinc-800/80 transition-colors">
      <div className="container-fitntry flex h-[68px] items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3" aria-label="FitnTryss home">
          <span className="font-display text-[22px] tracking-wide">FitnTry</span>
          <span className="hidden h-4 w-px bg-line-strong sm:block" aria-hidden="true" />
          <span className="hidden text-[10px] uppercase tracking-widest2 text-ink-faint sm:block">
            Virtual Try-On
          </span>
        </NavLink>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "relative py-2 text-[13px] font-medium tracking-wide text-ink-soft transition-colors hover:text-ink",
                  isActive && "text-ink after:absolute after:-bottom-[1px] after:left-0 after:h-[1.5px] after:w-full after:bg-oxblood"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle/>
          {user ? (
            <>
              <span className="text-[13px] text-ink-soft">{username}</span>
              <Button size="sm" variant="ghost" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => navigate("/login")}>
              Log in
            </Button>
          )}
          <Button size="sm" onClick={() => navigate("/try-on")}>
            Try It Now
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-canvas md:hidden animate-fade-in">
          <nav className="container-FitnTry flex flex-col py-3" aria-label="Mobile">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "border-b border-line/70 py-3.5 text-[15px] font-medium",
                    isActive ? "text-ink" : "text-ink-soft"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="border-b border-line/70 py-3.5 text-left text-[15px] font-medium text-ink-soft"
              >
                Sign out ({username})
              </button>
            ) : (
              <NavLink
                to="/login"
                className="border-b border-line/70 py-3.5 text-[15px] font-medium text-ink-soft"
              >
                Log in
              </NavLink>
            )}
            <Button className="mt-4 w-full" onClick={() => navigate("/try-on")}>
              Try It Now
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
