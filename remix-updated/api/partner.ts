import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET — admin only: list all sponsor enquiries
  if (req.method === "GET") {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { rows } = await sql`SELECT * FROM sponsors ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST — public: submit a partnership/sponsor enquiry
  if (req.method === "POST") {
    try {
      const { name, email, organisation, type, message } = req.body;

      if (!name || !email || !type) {
        return res.status(400).json({ error: "Name, email, and partnership type are required." });
      }

      const { rows } = await sql`
        INSERT INTO sponsors (name, email, organisation, type, message, active)
        VALUES (${name}, ${email}, ${organisation || null}, ${type}, ${message || null}, false)
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: rows[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
