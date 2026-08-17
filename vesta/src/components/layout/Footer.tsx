import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="container-FitnTry grid grid-cols-2 gap-10 py-14 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="font-display text-[22px]">FitnTry</span>
          <p className="mt-3 max-w-[220px] text-[13px] leading-relaxed text-ink-soft">
            Discover, compare, and slay the fits that feel so you
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4">Product</p>
          <ul className="space-y-2.5 text-[13px] text-ink-soft">
            <li><Link to="/try-on" className="hover:text-ink">Try On</Link></li>
            <li><Link to="/discover" className="hover:text-ink">Discover</Link></li>
            <li><Link to="/saved" className="hover:text-ink">Saved Looks</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Company</p>
          <ul className="space-y-2.5 text-[13px] text-ink-soft">
            <li><Link to="/about" className="hover:text-ink">About</Link></li>
            <li><a href="#" className="hover:text-ink">Careers</a></li>
            <li><a href="#" className="hover:text-ink">Press</a></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Support</p>
          <ul className="space-y-2.5 text-[13px] text-ink-soft">
            <li><a href="#" className="hover:text-ink">Help Center</a></li>
            <li><a href="#" className="hover:text-ink">Privacy</a></li>
            <li><a href="#" className="hover:text-ink">Terms</a></li>
          </ul>
        </div>
      </div>

      <div className="hairline">
        <div className="container-FitnTry flex flex-col items-start justify-between gap-2 py-5 text-[12px] text-ink-faint sm:flex-row sm:items-center">
          <span>© 2026 FitnTry. A virtual try-on concept built for the YouCam Apparel VTO Hackathon.</span>
          <span>Made with AI-powered try-on technology.</span>
        </div>
      </div>
    </footer>
  );
}
