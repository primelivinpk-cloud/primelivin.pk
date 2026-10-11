import type { FaqPair, HowToStep } from "@/lib/structured-data";

/** Site-wide FAQs (shown on /faq and reusable in AEO content). */
export const siteFaqs: FaqPair[] = [
  {
    question: "Do you deliver furniture anywhere in Pakistan?",
    answer:
      "Yes. We deliver across all of Pakistan — Islamabad, Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Gilgit-Baltistan and Azad Kashmir. Standard delivery is 3–7 working days, and delivery is free in major cities.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "We accept Cash on Delivery, Bank Transfer, EasyPaisa and JazzCash. Cash on Delivery is available nationwide; mobile-wallet and bank payments are confirmed by our team before dispatch.",
  },
  {
    question: "Can I pay in Pakistani Rupees (PKR)?",
    answer:
      "All prices on Prime Livin are in Pakistani Rupees (PKR) and include taxes. There are no hidden charges — the price you see at checkout is what you pay.",
  },
  {
    question: "How do I track my order?",
    answer:
      "After you place an order you get an order number like PL-XXXXXX. Our team calls you to confirm before dispatch, and you can request the current status anytime from the Contact page with your order number.",
  },
  {
    question: "What is your return and exchange policy?",
    answer:
      "You can report a damaged or incorrect item within 7 days of delivery and we will repair, replace or refund it. Items must be unused and in original packaging. See Shipping & Returns for full details.",
  },
  {
    question: "Do you offer assembly for beds and office chairs?",
    answer:
      "Yes. Office chairs and beds come with clear instructions and all required tools, and our delivery team can assemble them at your door in most cities for free.",
  },
];

/** FAQ additions shown on product pages, keyed by shop category slug. */
export const categoryFaqs: Record<string, FaqPair[]> = {
  "office-chairs": [
    {
      question: "How do I choose the right office chair height?",
      answer:
        "Sit with your feet flat on the floor and your thighs parallel to it. Your knees should be at about 90 degrees and the desk should hit just above your elbows. Adjustable gas lifts cover most heights from about 5'0\" to 6'2\".",
    },
    {
      question: "Are these chairs suitable for long work-from-home days?",
      answer:
        "Yes. Our ergonomic chairs include adjustable lumbar support, breathable mesh and adjustable armrests, which keep you comfortable across 8+ hour workdays.",
    },
    {
      question: "What is the weight capacity of your office chairs?",
      answer:
        "Standard office chairs support up to 120 kg, and our heavy-duty models support up to 150 kg. Each product page lists its exact capacity.",
    },
    {
      question: "How long does an office chair take to assemble?",
      answer:
        "About 15–30 minutes with the included Allen key and instructions. The back, gas lift and base click together without extra tools.",
    },
  ],
  sofas: [
    {
      question: "How long does sofa delivery take in Pakistan?",
      answer:
        "In-stock sofas are delivered in 3–7 working days across Pakistan. Free delivery applies in major cities; remote areas may take a little longer.",
    },
    {
      question: "What sofa fabric is best for hot Pakistani summers?",
      answer:
        "Breathable linen-blend and mesh-backed fabrics stay coolest. Velvet looks premium but holds heat; leatherette is easiest to clean in dusty weather.",
    },
    {
      question: "Do your sofas come with washable covers?",
      answer:
        "Most of our sofas have removable cushion covers that can be hand-washed or dry-cleaned. Check the product page for the specific care instructions.",
    },
  ],
  beds: [
    {
      question: "What bed sizes do you sell?",
      answer:
        "We stock single, semi-double, double and king sizes. Each product page lists exact dimensions in inches and centimetres so you can match your mattress and room.",
    },
    {
      question: "Do your beds need a box spring?",
      answer:
        "No. Our beds use a solid or slatted base that supports mattresses directly — a box spring is optional, not required.",
    },
    {
      question: "Can I assemble the bed myself?",
      answer:
        "Yes. Beds ship flat with numbered parts, screws and an Allen key. Assembly takes 30–45 minutes with one person, and our delivery team can do it for you in most cities.",
    },
  ],
  "dining-sets": [
    {
      question: "How much space do I need for a 4-seater dining set?",
      answer:
        "A 4-seater needs roughly 8×8 feet of open floor space so chairs can pull out comfortably. For narrow rooms, bench or wall-hugging chairs save space.",
    },
    {
      question: "Are the dining tables scratch resistant?",
      answer:
        "Yes. Our table tops use a scratch-resistant laminate or sealed wood finish that wipes clean and handles daily family use.",
    },
    {
      question: "Do dining sets come pre-assembled?",
      answer:
        "Table tops come pre-assembled; only the legs attach. Chairs arrive fully built, so most sets are ready to use in under 15 minutes.",
    },
  ],
  desks: [
    {
      question: "What desk size fits a small home office?",
      answer:
        "A 40×20 inch desk comfortably fits a laptop plus a monitor in most bedrooms. If you work on two screens, go for at least 48×24 inches.",
    },
    {
      question: "Are your desks height adjustable?",
      answer:
        "Select models include a crank or electric height adjustment for sit-stand work. Check the product page for the adjustable range.",
    },
    {
      question: "Can the desk hold multiple monitors?",
      answer:
        "Yes. Our desks are rated for at least 50 kg, which comfortably supports dual monitors, a laptop and accessories.",
    },
  ],
};

/** Generic office-chair assembly HowTo (shown on office chair product pages). */
export const chairAssemblySteps: HowToStep[] = [
  {
    name: "Unbox and check the parts",
    text: "Lay out the seat, backrest, gas lift, wheelbase, armrests and the hardware bag. Check the packing list so nothing is missing before you start.",
  },
  {
    name: "Insert castors into the wheelbase",
    text: "Push each castor firmly into the five holes of the wheelbase until it clicks. No tools are needed.",
  },
  {
    name: "Add the gas lift",
    text: "Drop the gas lift cylinder into the centre of the wheelbase with the wider end down.",
  },
  {
    name: "Mount the seat mechanism",
    text: "Place the seat mechanism onto the gas lift with the tension knob facing forward. If your chair has a lever, make sure it sits on your right-hand side.",
  },
  {
    name: "Attach the backrest",
    text: "Line up the backrest bracket with the seat mechanism holes and secure it with the provided bolts using the included Allen key. Tighten in a diagonal pattern.",
  },
  {
    name: "Fit armrests and test",
    text: "Bolt on the armrests, sit down and test the height lever, tilt and lumbar support. Re-tighten any bolt that feels loose before daily use.",
  },
];

/** Per-category FAQ lookup with a site-wide fallback. */
export function getFaqsForCategory(categorySlug?: string): FaqPair[] {
  const specific = categorySlug ? categoryFaqs[categorySlug] ?? [] : [];
  const generic = siteFaqs.slice(0, 3);
  return [...specific, ...generic];
}
