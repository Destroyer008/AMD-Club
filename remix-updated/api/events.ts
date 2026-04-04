import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const { rows } = await sql`SELECT * FROM events ORDER BY event_date ASC`;
      return res.status(200).json(rows);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    // Require admin auth for mutations
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { title, description, event_date, event_time, location, category, image_url, script_url } = req.body;
      const { rows } = await sql`
        INSERT INTO events (title, description, event_date, event_time, location, category, image_url, script_url)
        VALUES (${title}, ${description}, ${event_date}, ${event_time}, ${location}, ${category}, ${image_url}, ${script_url})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "PUT") {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { id, title, description, event_date, event_time, location, category, image_url, script_url } = req.body;
      const { rows } = await sql`
        UPDATE events SET
          title = ${title},
          description = ${description},
          event_date = ${event_date},
          event_time = ${event_time},
          location = ${location},
          category = ${category},
          image_url = ${image_url},
          script_url = ${script_url},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return res.status(200).json(rows[0]);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { id } = req.body;
      await sql`DELETE FROM events WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
