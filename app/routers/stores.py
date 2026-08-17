"""
Nearby clothing stores, via OpenStreetMap's Overpass API — free, public,
no API key or signup required at all (unlike Google Places, which needs
billing enabled even on its free tier).

Honesty note baked into the response shape: this returns clothing stores
near the shopper's location, not "stores that stock this exact garment."
No retail chain exposes live per-item inventory over a public API, so
claiming otherwise would be fabricating data. The frontend presents this
as "clothing stores near you," not "in stock nearby."

Trade-off vs Google Places: OSM coverage depends on community mapping,
so it's denser in some areas/cities than others, and there's no rating
data. That's the honest cost of "free and keyless."
"""

import math

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api", tags=["stores"])

OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter"


def _haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def _format_address(tags: dict) -> str | None:
    parts = [
        tags.get("addr:housenumber", "") + " " + tags.get("addr:street", "")
        if tags.get("addr:street")
        else None,
        tags.get("addr:city"),
    ]
    parts = [p.strip() for p in parts if p and p.strip()]
    return ", ".join(parts) if parts else None


@router.get("/nearby-stores")
async def nearby_stores(
    lat: float = Query(..., description="Shopper's latitude"),
    lng: float = Query(..., description="Shopper's longitude"),
    radius_m: int = Query(5000, ge=500, le=50000, description="Search radius in meters"),
):
    query = f"""
    [out:json][timeout:20];
    (
      node["shop"~"^(clothes|boutique|fashion)$"](around:{radius_m},{lat},{lng});
      way["shop"~"^(clothes|boutique|fashion)$"](around:{radius_m},{lat},{lng});
    );
    out center tags 20;
    """

    try:
        async with httpx.AsyncClient(timeout=25) as client:
            resp = await client.post(OVERPASS_ENDPOINT, data={"data": query})
    except httpx.TimeoutException:
        raise HTTPException(504, "Overpass API timed out — try again in a moment.")

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, f"Overpass API request failed: {resp.text[:300]}")

    elements = resp.json().get("elements", [])

    stores = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue  # unnamed shop nodes aren't useful to show

        el_lat = el.get("lat") or el.get("center", {}).get("lat")
        el_lng = el.get("lon") or el.get("center", {}).get("lon")
        distance_m = _haversine_m(lat, lng, el_lat, el_lng) if el_lat and el_lng else None

        stores.append(
            {
                "name": name,
                "address": _format_address(tags),
                "distanceM": round(distance_m) if distance_m is not None else None,
                "mapsUrl": f"https://www.openstreetmap.org/?mlat={el_lat}&mlon={el_lng}#map=18/{el_lat}/{el_lng}"
                if el_lat and el_lng
                else None,
                "location": {"latitude": el_lat, "longitude": el_lng} if el_lat and el_lng else None,
            }
        )

    stores.sort(key=lambda s: s["distanceM"] if s["distanceM"] is not None else float("inf"))
    return {"stores": stores[:15]}
