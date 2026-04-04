import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET — admin only: list all signups
  if (req.method === "GET") {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { rows } = await sql`SELECT * FROM signups ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST — public: submit a membership application
  if (req.method === "POST") {
    try {
      const { full_name, email, interest, message } = req.body;

      if (!full_name || !email || !interest) {
        return res.status(400).json({ error: "Full name, email, and interest are required." });
      }

      // Check for duplicate email
      const existing = await sql`SELECT id FROM signups WHERE email = ${email}`;
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "This email has already submitted an application." });
      }

      const { rows } = await sql`
        INSERT INTO signups (full_name, email, interest, message)
        VALUES (${full_name}, ${email}, ${interest}, ${message || null})
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: rows[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
