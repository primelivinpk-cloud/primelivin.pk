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
} as const;

export type Site = typeof site;
