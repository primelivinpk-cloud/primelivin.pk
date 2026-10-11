export const site = {
  name: "Prime Livin",
  tagline: "Premium Furniture for Pakistani Homes",
  description:
    "Shop quality furniture in Pakistan — office chairs, sofas, beds, dining sets and more. Cash on Delivery, EasyPaisa & JazzCash. Free delivery in major cities.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
  currency: process.env.NEXT_PUBLIC_CURRENCY ?? "PKR",
  locale: "en_PK",
  urduEnabled: process.env.NEXT_PUBLIC_ENABLE_URDU === "true",

  // Pakistan-specific
  regions: [
    "Islamabad",
    "Punjab",
    "Sindh",
    "Khyber Pakhtunkhwa",
    "Balochistan",
    "Gilgit-Baltistan",
    "Azad Kashmir",
  ],
  paymentMethods: ["Cash on Delivery", "Bank Transfer", "EasyPaisa", "JazzCash"],

  /** Geo signals used in meta tags (Islamabad coordinates). */
  geo: {
    countryCode: "PK",
    placename: "Pakistan",
    latitude: "33.6844",
    longitude: "73.0479",
  },

  /** Estimated delivery time per region (single source of truth). */
  deliveryEstimates: {
    Islamabad: "2–4 working days",
    Punjab: "3–6 working days",
    Sindh: "3–7 working days",
    "Khyber Pakhtunkhwa": "4–7 working days",
    Balochistan: "5–10 working days",
    "Gilgit-Baltistan": "5–10 working days",
    "Azad Kashmir": "4–8 working days",
  } as Record<string, string>,
} as const;

export type Site = typeof site;
