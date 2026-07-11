import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { siteContentTable, siteImagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function checkAdmin(req: any, res: any): boolean {
  const password = req.headers["x-admin-password"];
  const adminPassword = process.env["SESSION_SECRET"];
  if (!adminPassword || password !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.get("/content", async (req, res) => {
  try {
    const [textRows, imageRows] = await Promise.all([
      db.select().from(siteContentTable),
      db.select().from(siteImagesTable),
    ]);
    const text: Record<string, { en: string | null; ar: string | null }> = {};
    for (const row of textRows) {
      text[row.key] = { en: row.valueEn, ar: row.valueAr };
    }
    const images: Record<string, string> = {};
    for (const row of imageRows) {
      images[row.key] = row.dataUrl;
    }
    res.json({ text, images });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch content");
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

router.put("/content", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const { key, valueEn, valueAr } = req.body as {
      key: string;
      valueEn?: string;
      valueAr?: string;
    };
    if (!key || typeof key !== "string") {
      res.status(400).json({ error: "key is required" });
      return;
    }
    await db
      .insert(siteContentTable)
      .values({ key, valueEn: valueEn ?? null, valueAr: valueAr ?? null })
      .onConflictDoUpdate({
        target: siteContentTable.key,
        set: { valueEn: valueEn ?? null, valueAr: valueAr ?? null, updatedAt: new Date() },
      });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update content");
    res.status(500).json({ error: "Failed to update content" });
  }
});

router.get("/images/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const [row] = await db
      .select()
      .from(siteImagesTable)
      .where(eq(siteImagesTable.key, key))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Image not found" });
      return;
    }
    res.json({ dataUrl: row.dataUrl });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch image");
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

router.put("/images/:key", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const { key } = req.params;
    const { dataUrl } = req.body as { dataUrl: string };
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      res.status(400).json({ error: "Invalid image data URL" });
      return;
    }
    await db
      .insert(siteImagesTable)
      .values({ key, dataUrl })
      .onConflictDoUpdate({
        target: siteImagesTable.key,
        set: { dataUrl, updatedAt: new Date() },
      });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to save image");
    res.status(500).json({ error: "Failed to save image" });
  }
});

export default router;
