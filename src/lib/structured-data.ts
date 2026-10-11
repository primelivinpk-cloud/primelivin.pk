import { site } from "@/lib/site";

/**
 * Typed Schema.org structured-data (JSON-LD) builders.
 * All builders return plain objects — render them with <JsonLd data={...} />.
 */

export type LdNode = Record<string, unknown>;

const base = site.url.replace(/\/+$/, "");

export function organizationLd(): LdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: site.name,
    url: base,
    logo: {
      "@type": "ImageObject",
      url: `${base}/favicon.ico`,
      width: 512,
      height: 512,
    },
    description: site.description,
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Urdu"],
    },
    sameAs: [],
  };
}

export function websiteLd(): LdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: site.name,
    url: base,
    inLanguage: "en-PK",
    publisher: { "@id": `${base}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(
  items: { name: string; url?: string }[]
): LdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export function itemListLd(
  name: string,
  items: { name: string; url: string }[],
  listType: "Product" | "BlogPosting" = "Product"
): LdNode {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
      item: { "@type": listType, name: item.name, url: item.url },
    })),
  };
}

export type FaqPair = { question: string; answer: string };

export function faqLd(faqs: FaqPair[]): LdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export type HowToStep = { name: string; text: string };

export function howToLd(
  name: string,
  description: string,
  steps: HowToStep[],
  totalTime = "PT30M"
): LdNode {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime,
    estimatedCost: { "@type": "MonetaryAmount", currency: "PKR", value: "0" },
    tool: ["Screwdriver", "Included Allen key"],
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
