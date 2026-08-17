import React, { useEffect, useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { fetchShops, Shop } from "@/services/shopsApi";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function NearbyStores() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchShops()
      .then(setShops)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load stores."))
      .finally(() => setLoading(false));

    // Best-effort only: if geolocation is unavailable, denied, or slow, the
    // list still renders fine without distances — it never blocks on this.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          /* silently ignore — distance sort is a nice-to-have, not required */
        },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!userCoords || shops.length === 0) return;
    const next: Record<string, number> = {};
    for (const shop of shops) {
      if (shop.latitude != null && shop.longitude != null) {
        next[shop.id] = haversineKm(userCoords.lat, userCoords.lng, shop.latitude, shop.longitude);
      }
    }
    setDistances(next);
  }, [userCoords, shops]);

  const sorted = [...shops].sort((a, b) => {
    const da = distances[a.id];
    const db = distances[b.id];
    if (da == null && db == null) return 0;
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });

  return (
    <div className="mb-10 rounded-md border border-line bg-surface p-5">
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
        <div>
          <p className="text-[14px] font-medium text-ink">Clothing stores near you</p>
          <p className="mt-1 text-[12.5px] text-ink-faint">
            Not a guarantee any specific saved item is in stock — stores don't expose live
            per-item inventory. Sorted by distance when your location is available.
          </p>
        </div>
      </div>

      {loading && <p className="mt-4 text-[13px] text-ink-faint">Loading nearby stores…</p>}
      {error && <p className="mt-4 text-[13px] text-oxblood">{error}</p>}
      {!loading && !error && sorted.length === 0 && (
        <p className="mt-4 text-[13px] text-ink-faint">No stores listed yet.</p>
      )}

      {!loading && sorted.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sorted.map((shop) => (
            <li key={shop.id} className="rounded-sm border border-line-strong bg-canvas p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-medium text-ink">{shop.name}</p>
                {shop.latitude != null && shop.longitude != null && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${shop.latitude}&mlon=${shop.longitude}#map=17/${shop.latitude}/${shop.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${shop.name} on the map`}
                    className="shrink-0 text-ink-faint hover:text-ink"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              {shop.address && <p className="mt-0.5 text-[12px] text-ink-faint">{shop.address}</p>}
              {distances[shop.id] != null && (
                <p className="mt-1 text-[11.5px] text-ink-soft">
                  {distances[shop.id] < 1
                    ? `${Math.round(distances[shop.id] * 1000)} m away`
                    : `${distances[shop.id].toFixed(1)} km away`}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
