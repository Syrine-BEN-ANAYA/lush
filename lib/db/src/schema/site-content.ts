import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const siteContentTable = pgTable("site_content", {
  key: text("key").primaryKey(),
  valueEn: text("value_en"),
  valueAr: text("value_ar"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteImagesTable = pgTable("site_images", {
  key: text("key").primaryKey(),
  dataUrl: text("data_url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SiteContent = typeof siteContentTable.$inferSelect;
export type SiteImage = typeof siteImagesTable.$inferSelect;
