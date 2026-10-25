export const ORDER_STATUS = {
  PLACED: 'PLACED',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export const PAYMENT_METHOD = {
  COD: 'COD',
  RAZORPAY: 'RAZORPAY',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const USER_ROLE = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
} as const;

export const DISCOUNT_TYPE = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
} as const;

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

export const DEVOTIONAL_CATEGORIES = [
  {
    name: 'Radha Rani Poshak',
    nameHi: 'श्री राधा रानी पोशाक व वस्त्र',
    slug: 'radha-rani-poshak',
    description: 'Exquisite silk, velvet and organza dresses intricately embroidered with zari, moti and gota patti for Shri Radha Rani.',
    descriptionHi: 'श्री राधा रानी के लिए जरी, मोती और गोटा पट्टी से सुसज्जित भव्य रेशम और मखमली पोशाकें।'
  },
  {
    name: 'Laddu Gopal Dress Sets',
    nameHi: 'लड्डू गोपाल जी की पोशाक',
    slug: 'laddu-gopal-dresses',
    description: 'Designer daily and festival poshak sets for Thakurji / Laddu Gopal from Size 0 to Size 6.',
    descriptionHi: 'ठाकुर जी और लड्डू गोपाल जी के लिए नित्य व उत्सव पोशाक सेट (साइज़ 0 से साइज़ 6 तक)।'
  },
  {
    name: 'Shringar & Jewellery',
    nameHi: 'श्रृंगार एवं आभूषण (मुकुट, बांसुरी, हार)',
    slug: 'shringar-jewellery',
    description: 'Handcrafted pearl necklaces, stone-studded mukut, peacock feather mor-pankh, and brass/silver bansuri.',
    descriptionHi: 'हस्तनिर्मित मोतियों के हार, कुंदन मुकुट, मोरपंख और नक्काशीदार बांसुरी।'
  },
  {
    name: 'Framed Pictures & Posters',
    nameHi: 'श्री राधा कृष्ण दिव्य स्वरूप चित्र एवं फ्रेम',
    slug: 'framed-pictures-posters',
    description: 'Sanctified and museum-quality framed portraits of Barsana, Vrindavan Dham and Yugal Sarkar.',
    descriptionHi: 'बरसाना, श्री वृन्दावन धाम एवं युगल सरकार के मनोहारी दिव्य चित्र एवं स्वर्ण फ़्रेम।'
  },
  {
    name: 'Pooja & Mandir Decoration',
    nameHi: 'मंदिर सज्जा, झूला, दीप एवं आरती थाली',
    slug: 'pooja-mandir-decoration',
    description: 'Carved wooden and brass jhoolas, fragrant flower garlands, brass diya sets and festive decorative thalis.',
    descriptionHi: 'नक्काशीदार पीतल व लकड़ी के झूले, फूलों की मालाएं, पीतल के अखंड दीप एवं सजावटी पूजा थाली।'
  }
];
