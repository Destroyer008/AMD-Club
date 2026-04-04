import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Upload, Save, LogOut, Eye, EyeOff, RefreshCw, Image, Calendar, Users, Star } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface SiteImage {
  id: number;
  section: string;
  label: string;
  url: string;
  sort_order: number;
}

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  category: string;
  image_url: string;
}

interface Signup {
  id: number;
  full_name: string;
  email: string;
  interest: string;
  message: string;
  status: string;
  created_at: string;
}

// ── Admin Panel ───────────────────────────────────────────────────────────────

const IMAGE_SECTIONS = [
  { key: "hero", label: "Hero Background" },
  { key: "productions", label: "Productions" },
  { key: "bts", label: "Behind the Scenes" },
  { key: "art", label: "Art Exhibition" },
  { key: "community", label: "Community" },
  { key: "tertulia", label: "Tertulia Gallery" },
  { key: "team", label: "Team / Leadership" },
];

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [secret, setSecret] = useState("");
  const [activeTab, setActiveTab] = useState<"images" | "events" | "signups">("images");

  // Images
  const [images, setImages] = useState<SiteImage[]>([]);
  const [uploadSection, setUploadSection] = useState("hero");
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Events
  const [events, setEvents] = useState<Event[]>([]);
  const [eventForm, setEventForm] = useState({ title: "", description: "", event_date: "", event_time: "", location: "", category: "Theatre", image_url: "" });
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventMsg, setEventMsg] = useState("");
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  // Signups
  const [signups, setSignups] = useState<Signup[]>([]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  async function handleLogin() {
    setLoginError("");
    // Test the secret against a protected endpoint
    const res = await fetch("/api/join", {
      headers: { Authorization: `Bearer ${password}` },
    });
    if (res.ok || res.status === 200) {
      setSecret(password);
      setAuthed(true);
      loadAll(password);
    } else {
      setLoginError("Incorrect admin password.");
    }
  }

  // ── Data Loading ──────────────────────────────────────────────────────────

  async function loadAll(s = secret) {
    loadImages(s);
    loadEvents(s);
    loadSignups(s);
  }

  async function loadImages(s = secret) {
    const res = await fetch("/api/images", { headers: { Authorization: `Bearer ${s}` } });
    if (res.ok) setImages(await res.json());
  }

  async function loadEvents(s = secret) {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }

  async function loadSignups(s = secret) {
    const res = await fetch("/api/join", { headers: { Authorization: `Bearer ${s}` } });
    if (res.ok) setSignups(await res.json());
  }

  // ── Image Upload ──────────────────────────────────────────────────────────

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": file.type,
          "x-vercel-filename": file.name,
          "x-image-section": uploadSection,
          "x-image-label": uploadLabel || file.name.replace(/\.[^.]+$/, ""),
        },
        body: file,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadMsg("✓ Image uploaded successfully");
        setUploadLabel("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        loadImages();
      } else {
        setUploadMsg(`✗ ${data.error}`);
      }
    } catch {
      setUploadMsg("✗ Upload failed");
    }
    setUploading(false);
  }

  async function handleDeleteImage(id: number) {
    if (!confirm("Delete this image?")) return;
    await fetch("/api/images", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadImages();
  }

  // ── Events ────────────────────────────────────────────────────────────────

  async function handleSaveEvent() {
    setSavingEvent(true);
    setEventMsg("");
    const method = editingEventId ? "PUT" : "POST";
    const body = editingEventId ? { ...eventForm, id: editingEventId } : eventForm;
    const res = await fetch("/api/events", {
      method,
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setEventMsg("✓ Event saved");
      setEventForm({ title: "", description: "", event_date: "", event_time: "", location: "", category: "Theatre", image_url: "" });
      setEditingEventId(null);
      loadEvents();
    } else {
      setEventMsg(`✗ ${data.error}`);
    }
    setSavingEvent(false);
  }

  async function handleDeleteEvent(id: number) {
    if (!confirm("Delete this event?")) return;
    await fetch("/api/events", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadEvents();
  }

  function startEditEvent(ev: Event) {
    setEditingEventId(ev.id);
    setEventForm({
      title: ev.title,
      description: ev.description || "",
      event_date: ev.event_date?.split("T")[0] || "",
      event_time: ev.event_time || "",
      location: ev.location || "",
      category: ev.category || "Theatre",
      image_url: ev.image_url || "",
    });
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  const s = {
    page: { minHeight: "100vh", background: "#0B0B0F", color: "#F5F5F5", fontFamily: "system-ui, sans-serif" } as React.CSSProperties,
    card: { background: "#17171C", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 } as React.CSSProperties,
    input: { width: "100%", background: "#0B0B0F", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", color: "#F5F5F5", fontSize: 14, outline: "none", boxSizing: "border-box" } as React.CSSProperties,
    label: { display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#D4A017", marginBottom: 6 },
    btnPrimary: { background: "#C1121F", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13 } as React.CSSProperties,
    btnOutline: { background: "transparent", color: "#F5F5F5", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 } as React.CSSProperties,
    tab: (active: boolean) => ({ padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, background: active ? "#C1121F" : "transparent", color: active ? "#fff" : "#9A9A9A", border: "none" } as React.CSSProperties),
  };

  // ── Login Screen ──────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...s.card, width: 380, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 4 }}>REMIX</h1>
          <p style={{ color: "#D4A017", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 32 }}>Admin Panel</p>
          <div style={{ marginBottom: 16, textAlign: "left" }}>
            <label style={s.label}>Admin Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={s.input}
                placeholder="Enter admin password"
              />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9A9A9A", cursor: "pointer" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {loginError && <p style={{ color: "#C1121F", fontSize: 13, marginBottom: 12 }}>{loginError}</p>}
          <button onClick={handleLogin} style={{ ...s.btnPrimary, width: "100%" }}>Sign In</button>
          <p style={{ fontSize: 11, color: "#9A9A9A", marginTop: 16 }}>Set ADMIN_SECRET in your Vercel environment variables</p>
        </div>
      </div>
    );
  }

  // ── Main Admin UI ─────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ background: "#17171C", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontWeight: 800, letterSpacing: "0.15em", fontSize: 18 }}>REMIX</span>
          <span style={{ color: "#D4A017", fontSize: 11, letterSpacing: "0.2em", marginLeft: 12, textTransform: "uppercase" }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => loadAll()} style={s.btnOutline} title="Refresh"><RefreshCw size={14} /></button>
          <a href="/" style={{ ...s.btnOutline, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}><Eye size={14} /> View Site</a>
          <button onClick={() => setAuthed(false)} style={s.btnOutline}><LogOut size={14} /></button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          <button style={s.tab(activeTab === "images")} onClick={() => setActiveTab("images")}><Image size={14} style={{ marginRight: 6 }} />Images</button>
          <button style={s.tab(activeTab === "events")} onClick={() => setActiveTab("events")}><Calendar size={14} style={{ marginRight: 6 }} />Events</button>
          <button style={s.tab(activeTab === "signups")} onClick={() => setActiveTab("signups")}><Users size={14} style={{ marginRight: 6 }} />Signups ({signups.length})</button>
        </div>

        {/* ── IMAGES TAB ── */}
        {activeTab === "images" && (
          <div>
            <div style={{ ...s.card, marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Upload New Image</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={s.label}>Section</label>
                  <select value={uploadSection} onChange={e => setUploadSection(e.target.value)} style={s.input}>
                    {IMAGE_SECTIONS.map(sec => <option key={sec.key} value={sec.key}>{sec.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Label (optional)</label>
                  <input type="text" value={uploadLabel} onChange={e => setUploadLabel(e.target.value)} style={s.input} placeholder="e.g. Tertulia 2026 Hero" />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
              <button onClick={() => fileInputRef.current?.click()} style={s.btnPrimary} disabled={uploading}>
                {uploading ? "Uploading..." : <><Upload size={14} style={{ marginRight: 8 }} />Choose & Upload Image</>}
              </button>
              {uploadMsg && <p style={{ marginTop: 12, fontSize: 13, color: uploadMsg.startsWith("✓") ? "#4CAF50" : "#C1121F" }}>{uploadMsg}</p>}
            </div>

            {IMAGE_SECTIONS.map(sec => {
              const secImages = images.filter(img => img.section === sec.key);
              if (secImages.length === 0) return null;
              return (
                <div key={sec.key} style={{ ...s.card, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#D4A017", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>{sec.label}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                    {secImages.map(img => (
                      <div key={img.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", background: "#0B0B0F" }}>
                        <img src={img.url} alt={img.label} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "8px 10px", fontSize: 11, color: "#9A9A9A" }}>{img.label}</div>
                        <button onClick={() => handleDeleteImage(img.id)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 4, color: "#C1121F", cursor: "pointer", padding: 4 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {images.length === 0 && (
              <div style={{ textAlign: "center", color: "#9A9A9A", padding: 48 }}>
                <Image size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <p>No images uploaded yet. Upload your first image above.</p>
              </div>
            )}
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {activeTab === "events" && (
          <div>
            <div style={{ ...s.card, marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{editingEventId ? "Edit Event" : "Add New Event"}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={s.label}>Event Title</label>
                  <input type="text" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} style={s.input} placeholder="e.g. Tertulia 2027 Auditions" />
                </div>
                <div>
                  <label style={s.label}>Date</label>
                  <input type="date" value={eventForm.event_date} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })} style={s.input} />
                </div>
                <div>
                  <label style={s.label}>Time</label>
                  <input type="text" value={eventForm.event_time} onChange={e => setEventForm({ ...eventForm, event_time: e.target.value })} style={s.input} placeholder="e.g. 3:00 PM" />
                </div>
                <div>
                  <label style={s.label}>Location</label>
                  <input type="text" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} style={s.input} placeholder="e.g. School Auditorium" />
                </div>
                <div>
                  <label style={s.label}>Category</label>
                  <select value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })} style={s.input}>
                    {["Theatre", "Audition", "Exhibition", "Media", "Workshop", "Performance", "Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={s.label}>Image URL</label>
                  <input type="text" value={eventForm.image_url} onChange={e => setEventForm({ ...eventForm, image_url: e.target.value })} style={s.input} placeholder="Paste URL or upload to Images tab first" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={s.label}>Description</label>
                  <textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} style={{ ...s.input, minHeight: 90, resize: "vertical" }} placeholder="Event details..." />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSaveEvent} style={s.btnPrimary} disabled={savingEvent}>
                  <Save size={14} style={{ marginRight: 6 }} />{savingEvent ? "Saving..." : editingEventId ? "Update Event" : "Add Event"}
                </button>
                {editingEventId && <button onClick={() => { setEditingEventId(null); setEventForm({ title: "", description: "", event_date: "", event_time: "", location: "", category: "Theatre", image_url: "" }); }} style={s.btnOutline}>Cancel</button>}
              </div>
              {eventMsg && <p style={{ marginTop: 12, fontSize: 13, color: eventMsg.startsWith("✓") ? "#4CAF50" : "#C1121F" }}>{eventMsg}</p>}
            </div>

            <div style={s.card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>All Events ({events.length})</h2>
              {events.length === 0 ? (
                <p style={{ color: "#9A9A9A", textAlign: "center", padding: 32 }}>No events yet.</p>
              ) : events.map(ev => (
                <div key={ev.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{ev.title}</div>
                    <div style={{ fontSize: 12, color: "#9A9A9A" }}>{ev.event_date ? new Date(ev.event_date).toLocaleDateString() : "No date"} · {ev.category} · {ev.location || "No location"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEditEvent(ev)} style={s.btnOutline}>Edit</button>
                    <button onClick={() => handleDeleteEvent(ev.id)} style={{ ...s.btnOutline, color: "#C1121F", borderColor: "#C1121F" }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SIGNUPS TAB ── */}
        {activeTab === "signups" && (
          <div style={s.card}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Membership Applications ({signups.length})</h2>
            {signups.length === 0 ? (
              <p style={{ color: "#9A9A9A", textAlign: "center", padding: 32 }}>No applications yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#D4A017", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      <th style={{ padding: "8px 12px" }}>Name</th>
                      <th style={{ padding: "8px 12px" }}>Email</th>
                      <th style={{ padding: "8px 12px" }}>Interest</th>
                      <th style={{ padding: "8px 12px" }}>Message</th>
                      <th style={{ padding: "8px 12px" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signups.map(s => (
                      <tr key={s.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={{ padding: "12px 12px", fontWeight: 600 }}>{s.full_name}</td>
                        <td style={{ padding: "12px 12px", color: "#9A9A9A" }}>{s.email}</td>
                        <td style={{ padding: "12px 12px" }}>{s.interest}</td>
                        <td style={{ padding: "12px 12px", color: "#9A9A9A", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.message || "—"}</td>
                        <td style={{ padding: "12px 12px", color: "#9A9A9A", whiteSpace: "nowrap" }}>{new Date(s.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
