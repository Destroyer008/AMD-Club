import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put, del } from "@vercel/blob";
import { sql } from "@vercel/postgres";

export const config = {
  api: {
    bodyParser: false, // needed for streaming file uploads
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-vercel-filename, x-image-section, x-image-label, x-image-sort-order");
  if (req.method === "OPTIONS") return res.status(200).end();

  // All image mutations require admin auth
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET — list all site images
  if (req.method === "GET") {
    try {
      const { rows } = await sql`SELECT * FROM site_images ORDER BY section ASC, sort_order ASC`;
      return res.status(200).json(rows);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST — upload a new image to Vercel Blob and register it in DB
  if (req.method === "POST") {
    try {
      const filename = req.headers["x-vercel-filename"] as string;
      const section = req.headers["x-image-section"] as string || "general";
      const label = req.headers["x-image-label"] as string || filename;
      const sortOrder = parseInt(req.headers["x-image-sort-order"] as string || "0");

      if (!filename) {
        return res.status(400).json({ error: "x-vercel-filename header is required" });
      }

      // Upload to Vercel Blob
      const blob = await put(`site-images/${section}/${Date.now()}-${filename}`, req, {
        access: "public",
        contentType: req.headers["content-type"] as string,
      });

      // Save URL to Postgres
      const { rows } = await sql`
        INSERT INTO site_images (section, label, url, blob_pathname, sort_order)
        VALUES (${section}, ${label}, ${blob.url}, ${blob.pathname}, ${sortOrder})
        RETURNING *
      `;

      return res.status(201).json({ success: true, image: rows[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PUT — update label or sort order for an existing image
  if (req.method === "PUT") {
    try {
      const { id, label, sort_order, section } = req.body;
      const { rows } = await sql`
        UPDATE site_images
        SET label = ${label}, sort_order = ${sort_order}, section = ${section}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return res.status(200).json(rows[0]);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE — remove from Blob and DB
  if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      // Get the blob pathname first
      const { rows } = await sql`SELECT blob_pathname FROM site_images WHERE id = ${id}`;
      if (rows.length === 0) return res.status(404).json({ error: "Image not found" });

      // Delete from Vercel Blob
      if (rows[0].blob_pathname) {
        await del(rows[0].blob_pathname);
      }

      // Delete from DB
      await sql`DELETE FROM site_images WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
