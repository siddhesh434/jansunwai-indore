// app/api/query-geocode/route.js
// Simple proxy to bypass CORS for Nominatim and Postal PIN APIs

export const runtime = "edge";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'search' | 'reverse' | 'pincode'

    let targetUrl;
    if (type === "pincode") {
      const pin = searchParams.get("pin");
      if (!pin) return Response.json({ error: "Missing pin" }, { status: 400 });
      targetUrl = `https://api.postalpincode.in/pincode/${encodeURIComponent(pin)}`;
    } else if (type === "reverse") {
      const lat = searchParams.get("lat");
      const lon = searchParams.get("lon");
      if (!lat || !lon)
        return Response.json({ error: "Missing lat/lon" }, { status: 400 });
      targetUrl = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&addressdetails=1`;
    } else {
      const q = searchParams.get("q");
      if (!q) return Response.json({ error: "Missing q" }, { status: 400 });
      targetUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`;
    }

    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent": "jansunwai-indore/1.0 (contact@example.com)",
        "Accept-Language": "en",
      },
      next: { revalidate: 60 },
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
        "cache-control": "s-maxage=60, stale-while-revalidate=600",
      },
    });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


