import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST and require admin secret
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Create all tables
    await sql`
      CREATE TABLE IF NOT EXISTS productions (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(200) NOT NULL,
        subtitle VARCHAR(300),
        year INTEGER NOT NULL,
        author VARCHAR(200),
        category VARCHAR(100) DEFAULT 'Theatre',
        image_url TEXT,
        description TEXT,
        cast_list JSONB DEFAULT '[]',
        performances INTEGER DEFAULT 0,
        attendees INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_date DATE,
        event_time VARCHAR(50),
        location VARCHAR(200),
        category VARCHAR(100),
        image_url TEXT,
        script_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS signups (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        interest VARCHAR(200),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS volunteers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL,
        role VARCHAR(200),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sponsors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200),
        organisation VARCHAR(200),
        type VARCHAR(100),
        message TEXT,
        logo_url TEXT,
        tier VARCHAR(50) DEFAULT 'standard',
        active BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS site_images (
        id SERIAL PRIMARY KEY,
        section VARCHAR(100) NOT NULL,
        label VARCHAR(200),
        url TEXT NOT NULL,
        blob_pathname TEXT,
        sort_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        role VARCHAR(200),
        quote TEXT NOT NULL,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Seed initial production data if empty
    const existing = await sql`SELECT COUNT(*) as count FROM productions`;
    if (parseInt(existing.rows[0].count) === 0) {
      await sql`
        INSERT INTO productions (slug, title, subtitle, year, author, category, image_url, cast_list, performances, attendees)
        VALUES
          ('tertulia-2026', 'Tertulia 2026', 'Don''t Tell Daddy What Happened in Lagos', 2026, 'Yemi Odunfa', 'Theatre',
           'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800',
           '[{"character":"Chief Ade","actor":"Yemi Odunfa"},{"character":"Mama Lagos","actor":"Sarah Owusu"},{"character":"The Stranger","actor":"David Tetteh"}]',
           12, 1200),
          ('tertulia-2025', 'Tertulia 2025', 'The Lion and the Jewel', 2025, 'Wole Soyinka', 'Theatre',
           'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
           '[{"character":"Baroka","actor":"Kwame Nkrumah"},{"character":"Sidi","actor":"Efua Sutherland"}]',
           10, 900),
          ('tertulia-2024', 'Tertulia 2024', 'The Beautiful Ones Are Not Yet Born', 2024, 'Ayi Kwei Armah', 'Theatre',
           'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
           '[{"character":"The Man","actor":"Ayi Kwei Armah"},{"character":"Oyo","actor":"Tsitsi Dangarembga"}]',
           8, 750)
      `;
    }

    return res.status(200).json({ success: true, message: "All tables created and seeded successfully." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
