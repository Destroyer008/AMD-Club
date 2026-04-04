import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Run all queries in parallel
    const [events, testimonials, sponsors, siteImages, productions] = await Promise.all([
      sql`SELECT * FROM events ORDER BY event_date ASC`,
      sql`SELECT * FROM testimonials WHERE active = true ORDER BY created_at DESC`,
      sql`SELECT * FROM sponsors WHERE active = true ORDER BY tier ASC, name ASC`,
      sql`SELECT * FROM site_images ORDER BY section ASC, sort_order ASC`,
      sql`SELECT * FROM productions ORDER BY year DESC`,
    ]);

    return res.status(200).json({
      events: events.rows,
      testimonials: testimonials.rows,
      sponsors: sponsors.rows,
      siteImages: siteImages.rows,
      productions: productions.rows,
    });
  } catch (error: any) {
    console.error("Content API error:", error);
    // Return empty arrays so the site still renders with fallback data
    return res.status(200).json({
      events: [],
      testimonials: [],
      sponsors: [],
      siteImages: [],
      productions: [],
      _error: error.message,
    });
  }
}
