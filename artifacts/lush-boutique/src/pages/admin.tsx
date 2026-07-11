import React, { useState, useEffect, useRef } from "react";
import { Lock, Save, Upload, Eye, LogOut, Check, X, ChevronLeft } from "lucide-react";
import { t } from "@/lib/translations";

const API = "/api";

type ContentMap = Record<string, { en: string | null; ar: string | null }>;
type ImageMap = Record<string, string>;

const IMAGE_KEYS = [
  { key: "hero", label: "Hero (main banner)" },
  { key: "story", label: "Our Story" },
  { key: "fragrance", label: "Fragrance card" },
  { key: "skincare", label: "Skincare card" },
  { key: "makeup", label: "Makeup card" },
];

const TEXT_KEYS = [
  { key: "hero.title1", label: "Hero — Line 1", multiline: false },
  { key: "hero.title2", label: "Hero — Line 2 (pink italic)", multiline: false },
  { key: "hero.subtitle", label: "Hero — Subtitle", multiline: true },
  { key: "story.title", label: "Story — Title", multiline: false },
  { key: "story.p1", label: "Story — Paragraph 1", multiline: true },
  { key: "story.p2", label: "Story — Paragraph 2", multiline: true },
  { key: "collection.title", label: "Collection — Section Title", multiline: false },
  { key: "collection.subtitle", label: "Collection — Subtitle", multiline: true },
  { key: "why.testimonial", label: "Testimonial Quote", multiline: true },
  { key: "why.customer", label: "Testimonial Attribution", multiline: false },
  { key: "visit.subtitle", label: "Visit Us — Subtitle", multiline: false },
];

function resizeImage(file: File, maxWidth = 1200, maxHeight = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<ContentMap>({});
  const [images, setImages] = useState<ImageMap>({});
  const [localContent, setLocalContent] = useState<ContentMap>({});
  const [localImages, setLocalImages] = useState<ImageMap>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"text" | "images">("text");
  const storedPassword = useRef<string>("");

  async function login() {
    setLoading(true);
    setPasswordError(false);
    try {
      // Validate password by attempting a PUT with a ping key
      const testRes = await fetch(`${API}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ key: "__admin_ping__", valueEn: "ok", valueAr: "ok" }),
      });
      if (testRes.status === 401) {
        setPasswordError(true);
        setLoading(false);
        return;
      }
      storedPassword.current = password;
      // Fetch all content
      const res = await fetch(`${API}/content`);
      const data = await res.json();
      setContent(data.text || {});
      setImages(data.images || {});
      setLocalContent(data.text || {});
      setLocalImages(data.images || {});
      setAuthed(true);
    } catch {
      setPasswordError(true);
    }
    setLoading(false);
  }

  async function loadContent() {
    const res = await fetch(`${API}/content`);
    if (!res.ok) return;
    const data = await res.json();
    setContent(data.text || {});
    setImages(data.images || {});
    setLocalContent(data.text || {});
    setLocalImages(data.images || {});
  }

  useEffect(() => {
    if (authed) loadContent();
  }, [authed]);

  async function saveText(key: string) {
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      const val = localContent[key] || { en: null, ar: null };
      await fetch(`${API}/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword.current,
        },
        body: JSON.stringify({ key, valueEn: val.en, valueAr: val.ar }),
      });
      setSaved((s) => ({ ...s, [key]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000);
    } catch {}
    setSaving((s) => ({ ...s, [key]: false }));
  }

  async function saveImage(key: string, dataUrl: string) {
    setSaving((s) => ({ ...s, [`img_${key}`]: true }));
    try {
      await fetch(`${API}/images/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword.current,
        },
        body: JSON.stringify({ dataUrl }),
      });
      setSaved((s) => ({ ...s, [`img_${key}`]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [`img_${key}`]: false })), 2000);
    } catch {}
    setSaving((s) => ({ ...s, [`img_${key}`]: false }));
  }

  async function handleImageUpload(key: string, file: File) {
    const dataUrl = await resizeImage(file);
    setLocalImages((prev) => ({ ...prev, [key]: dataUrl }));
    await saveImage(key, dataUrl);
  }

  // Get display value for a text key (fall back to defaults)
  function getDefault(key: string, lang: "en" | "ar"): string {
    const parts = key.split(".");
    let val: any = t[lang];
    for (const p of parts) {
      if (val && typeof val === "object") val = val[p];
      else return "";
    }
    return typeof val === "string" ? val : "";
  }

  function getLocal(key: string, lang: "en" | "ar"): string {
    return localContent[key]?.[lang === "en" ? "en" : "ar"] ?? getDefault(key, lang);
  }

  function setLocal(key: string, lang: "en" | "ar", value: string) {
    setLocalContent((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { en: null, ar: null }), [lang === "en" ? "en" : "ar"]: value },
    }));
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg shadow-primary/10 border border-primary/10 p-10 w-full max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="text-primary" size={24} />
          </div>
          <h1 className="text-2xl font-serif text-center mb-2">Admin Panel</h1>
          <p className="text-muted-foreground text-center text-sm mb-8">Enter your admin password to continue.</p>
          <div className="space-y-4">
            <input
              type="password"
              className={`w-full bg-background border rounded-xl p-4 text-sm focus:outline-none transition-colors ${passwordError ? "border-red-400 focus:border-red-400" : "border-border focus:border-primary"}`}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              autoFocus
            />
            {passwordError && <p className="text-red-500 text-xs text-center">Incorrect password. Try again.</p>}
            <button
              onClick={login}
              disabled={loading || !password}
              className="w-full bg-primary text-white py-3 rounded-xl text-sm uppercase tracking-widest hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {loading ? "Checking…" : "Enter"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm">
              <ChevronLeft size={16} /> Back to site
            </a>
            <span className="text-border">|</span>
            <h1 className="font-serif text-xl text-primary">Lush Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors border border-border rounded-full px-4 py-1.5">
              <Eye size={14} /> Preview
            </a>
            <button onClick={() => { setAuthed(false); setPassword(""); }} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-muted-foreground text-sm mb-8">Edit your website content. Changes are saved individually — click <strong>Save</strong> after each edit.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {(["text", "images"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm capitalize border-b-2 transition-colors -mb-px ${activeTab === tab ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab === "text" ? "Text Content" : "Photos"}
            </button>
          ))}
        </div>

        {/* Text Tab */}
        {activeTab === "text" && (
          <div className="space-y-8">
            {TEXT_KEYS.map(({ key, label, multiline }) => {
              const isSaving = saving[key];
              const isSaved = saved[key];
              return (
                <div key={key} className="bg-white rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-sm text-foreground">{label}</h3>
                    <button
                      onClick={() => saveText(key)}
                      disabled={isSaving}
                      className={`flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full transition-all ${isSaved ? "bg-green-100 text-green-600" : "bg-primary text-white hover:bg-primary/80"} disabled:opacity-50`}
                    >
                      {isSaved ? <><Check size={12} /> Saved</> : isSaving ? "Saving…" : <><Save size={12} /> Save</>}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">English</label>
                      {multiline ? (
                        <textarea
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none h-24"
                          value={getLocal(key, "en")}
                          onChange={(e) => setLocal(key, "en", e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors"
                          value={getLocal(key, "en")}
                          onChange={(e) => setLocal(key, "en", e.target.value)}
                        />
                      )}
                    </div>
                    <div dir="rtl">
                      <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider text-right">العربية</label>
                      {multiline ? (
                        <textarea
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none h-24 font-arabic"
                          style={{ fontFamily: "Tajawal, sans-serif" }}
                          value={getLocal(key, "ar")}
                          onChange={(e) => setLocal(key, "ar", e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors font-arabic"
                          style={{ fontFamily: "Tajawal, sans-serif" }}
                          value={getLocal(key, "ar")}
                          onChange={(e) => setLocal(key, "ar", e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {IMAGE_KEYS.map(({ key, label }) => {
              const preview = localImages[key];
              const isSaving = saving[`img_${key}`];
              const isSaved = saved[`img_${key}`];
              return (
                <div key={key} className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm">{label}</h3>
                    {isSaved && (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <Check size={12} /> Saved
                      </span>
                    )}
                    {isSaving && <span className="text-xs text-muted-foreground">Uploading…</span>}
                  </div>
                  <div className="aspect-video bg-secondary/40 rounded-xl overflow-hidden mb-3 relative">
                    {preview ? (
                      <img src={preview} alt={label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Current photo</div>
                    )}
                  </div>
                  <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm border transition-all cursor-pointer ${isSaving ? "opacity-50 cursor-not-allowed border-border text-muted-foreground" : "border-primary text-primary hover:bg-primary hover:text-white"}`}>
                    <Upload size={14} />
                    {isSaving ? "Uploading…" : "Upload new photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isSaving}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(key, file);
                      }}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2 text-center">JPG, PNG, WebP. Auto-resized to fit.</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
