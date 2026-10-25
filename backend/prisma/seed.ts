import { PrismaClient, Role, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌸 Starting database seed for Shri Radha Rani Devotional Store...');

  // 1. Clean existing records in reverse dependency order
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  console.log(' Cleared old records');

  // 2. Seed Users
  const passwordHashAdmin = await bcrypt.hash('RadheRadhe@108', 10);
  const passwordHashDevotee = await bcrypt.hash('RadheShyam@108', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Pujari Ji (Admin)',
      phone: '9876543210',
      email: 'admin@shriradharanishringar.com',
      passwordHash: passwordHashAdmin,
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Radhika Sharma',
      phone: '9812345678',
      email: 'radhika.bhakt@gmail.com',
      passwordHash: passwordHashDevotee,
      role: Role.CUSTOMER,
      addresses: {
        create: {
          recipientName: 'Radhika Sharma',
          phone: '9812345678',
          street: 'Plot 108, Raman Reti Marg, Near ISKCON Temple',
          landmark: 'Opposite Prem Mandir Gate 2',
          city: 'Vrindavan',
          state: 'Uttar Pradesh',
          pincode: '281121',
          isDefault: true,
        },
      },
    },
  });

  console.log(` Created Admin (${admin.phone}) and Customer (${customer.phone})`);

  // 3. Seed Categories
  const catPoshak = await prisma.category.create({
    data: {
      name: 'Radha Rani Poshak',
      nameHi: 'श्री राधा रानी पोशाक व वस्त्र',
      slug: 'radha-rani-poshak',
      description: 'Handcrafted royal silk and velvet poshak sets decorated with zari, zardozi and pearl embroidery for Kishori Ji.',
      descriptionHi: 'श्री जी के लिए भव्य जरी, जरदोजी और मोतियों के काम से सुसज्जित दिव्य रेशमी और मखमली पोशाकें।',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1,
    },
  });

  const catLadduGopal = await prisma.category.create({
    data: {
      name: 'Laddu Gopal Dress Sets',
      nameHi: 'लड्डू गोपाल जी की पोशाक',
      slug: 'laddu-gopal-dresses',
      description: 'Splendid festival and daily dress sets with matching pagdi and patka for Bal Gopal (Size 0 to Size 6).',
      descriptionHi: 'बाल गोपाल जी के लिए पगड़ी और पटके सहित मनमोहक उत्सव व नित्य पोशाक सेट (साइज़ 0 से साइज़ 6)।',
      imageUrl: 'https://images.unsplash.com/photo-1609137144822-4467c699faaa?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2,
    },
  });

  const catJewellery = await prisma.category.create({
    data: {
      name: 'Shringar & Jewellery',
      nameHi: 'श्रृंगार एवं आभूषण (मुकुट, बांसुरी, हार)',
      slug: 'shringar-jewellery',
      description: 'Kundan mukut, silver and brass bansuri, moti malas, kamarbandh, and payal for divine shringar.',
      descriptionHi: 'कुंदन मुकुट, मीनाकारी बांसुरी, चंद्रिका, मोतियों के हार और करधनी।',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3,
    },
  });

  const catPictures = await prisma.category.create({
    data: {
      name: 'Framed Pictures & Posters',
      nameHi: 'श्री राधा कृष्ण दिव्य स्वरूप चित्र',
      slug: 'framed-pictures-posters',
      description: 'Gold-embossed archival framed pictures of Barsana, Vrindavan, and Shri Radha Krishna.',
      descriptionHi: 'बरसाना, निधिवन एवं श्री राधा कृष्ण के अलौकिक दर्शन वाले स्वर्ण फ़्रेमयुक्त चित्र।',
      imageUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80',
      displayOrder: 4,
    },
  });

  const catDecoration = await prisma.category.create({
    data: {
      name: 'Pooja & Mandir Decoration',
      nameHi: 'मंदिर सज्जा, झूला, दीप एवं आरती थाली',
      slug: 'pooja-mandir-decoration',
      description: 'Hand-carved brass jhoolas, marigold flower garlands, akhand diya sets, and decorated puja thalis.',
      descriptionHi: 'हस्तनिर्मित पीतल के झूले, मखमली फूलों की मालाएं, पीतल के अखंड दीप और शुभ आरती थाली।',
      imageUrl: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80',
      displayOrder: 5,
    },
  });

  console.log(' Created 5 Devotional Categories');

  // 4. Seed 12 Detailed Products with Variants, Images and Descriptions
  const productsData = [
    // --- 1. Radha Rani Poshak ---
    {
      categoryId: catPoshak.id,
      name: 'Royal Vrindavan Zardozi Silk Radha Rani Poshak',
      nameHi: 'शाही वृन्दावन जरदोजी रेशम श्री राधा रानी पोशाक',
      slug: 'royal-vrindavan-zardozi-silk-radha-rani-poshak',
      description: 'Exquisite deep rose-pink silk poshak adorned with pure copper zardozi work, freshwater pearls, and heavy border embroidery. Perfect for Radhashtami and Sharad Purnima.',
      descriptionHi: 'शुद्ध रेशम और सुनहरी जरदोजी तारों से सजी अत्यंत मोहक गुलाबी पोशाक। राधाष्टमी एवं शरद पूर्णिमा महोत्सव हेतु विशेष।',
      basePrice: 1899,
      discountPrice: 1599,
      sku: 'RP-ZAR-01',
      stock: 25,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      material: 'Pure Chanderi Silk with Velvet Border',
      dimensions: 'Available in 10 inch to 18 inch idol heights',
      careInstructions: 'Dry clean only. Store wrapped in pure cotton or mulmul cloth.',
      careInstructionsHi: 'केवल ड्राई क्लीन कराएं। शुद्ध सूती कपड़े में लपेट कर रखें।',
      images: [
        { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Radha Rani Zardozi Poshak Front View' },
        { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', isPrimary: false, altText: 'Zardozi Embroidery Detail' },
      ],
      variants: [
        { size: '10 Inch Vigraha', color: 'Gulabi Pink (गुलाबी)', sku: 'RP-ZAR-01-10P', price: 1599, stock: 10 },
        { size: '12 Inch Vigraha', color: 'Gulabi Pink (गुलाबी)', sku: 'RP-ZAR-01-12P', price: 1799, stock: 8 },
        { size: '15 Inch Vigraha', color: 'Gulabi Pink (गुलाबी)', sku: 'RP-ZAR-01-15P', price: 2199, stock: 7 },
      ],
    },
    {
      categoryId: catPoshak.id,
      name: 'Peacock Feather Embroidered Teal Velvet Radha Rani Lehenga Set',
      nameHi: 'मयूर पंख जरी मोर-कंठ नीला मखमली लहंगा सेट',
      slug: 'peacock-feather-embroidered-teal-velvet-radha-rani-lehenga-set',
      description: 'Majestic peacock teal velvet lehenga with handcrafted Mor-Pankh motifs, fine gota patti ribbons, and sheer organza odhani with golden tassels.',
      descriptionHi: 'मयूर कंठ नीला मखमली लहंगा जिस पर मोरपंखी कसीदाकारी और सुनहरी गोटा पट्टी का भव्य काम है।',
      basePrice: 2299,
      discountPrice: 1999,
      sku: 'RP-VEL-02',
      stock: 18,
      isFeatured: true,
      isBestseller: false,
      isNewArrival: true,
      material: 'Micro Velvet with Handwork Gota',
      dimensions: 'Suitable for 12 to 16 inch vigraha',
      careInstructions: 'Steam iron gently on reverse. Do not spray water.',
      images: [
        { url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Teal Velvet Lehenga Set' },
      ],
      variants: [
        { size: '12 Inch Vigraha', color: 'Peacock Teal (मयूर नीला)', sku: 'RP-VEL-02-12T', price: 1999, stock: 10 },
        { size: '15 Inch Vigraha', color: 'Peacock Teal (मयूर नीला)', sku: 'RP-VEL-02-15T', price: 2399, stock: 8 },
      ],
    },
    {
      categoryId: catPoshak.id,
      name: 'Basant Panchami Marigold Yellow Organza Dress Set',
      nameHi: 'बसंत पंचमी पीताम्बरी बसंती पोशाक सेट',
      slug: 'basant-panchami-marigold-yellow-organza-dress-set',
      description: 'Luminous sunshine yellow organza dress decorated with delicate floral sequins, pearl border, and lightweight matching scarf for Kishori Ji.',
      descriptionHi: 'अलौकिक पीताम्बरी बसंती पोशाक, बारीक फूलों की सीक्वेंस व मोतियों की किनारी के साथ।',
      basePrice: 1299,
      discountPrice: 1099,
      sku: 'RP-ORG-03',
      stock: 30,
      isFeatured: false,
      isBestseller: true,
      isNewArrival: false,
      material: 'Pure Glass Organza with Zari Border',
      dimensions: 'Available in 8, 10, and 12 inches',
      careInstructions: 'Dry clean only.',
      images: [
        { url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Yellow Organza Poshak' },
      ],
      variants: [
        { size: '8 Inch', color: 'Basanti Yellow (पीला)', sku: 'RP-ORG-03-8Y', price: 1099, stock: 15 },
        { size: '10 Inch', color: 'Basanti Yellow (पीला)', sku: 'RP-ORG-03-10Y', price: 1299, stock: 15 },
      ],
    },

    // --- 2. Laddu Gopal Dress Sets ---
    {
      categoryId: catLadduGopal.id,
      name: 'Janmashtami Special Heavy Kundan Laddu Gopal Poshak with Pagdi',
      nameHi: 'जन्माष्टमी विशेष कुंदन वर्क लड्डू गोपाल पोशाक व पगड़ी',
      slug: 'janmashtami-special-heavy-kundan-laddu-gopal-poshak-with-pagdi',
      description: 'Stunning royal festival poshak embedded with shimmering Kundan stones, peacock crown (pagdi), matching patka, and flute for Thakurji.',
      descriptionHi: 'जन्माष्टमी उत्सव के लिए कुंदन, जरी और मोतियों से जड़ित भव्य पोशाक मय पगड़ी व मुरली।',
      basePrice: 899,
      discountPrice: 699,
      sku: 'LG-KUN-01',
      stock: 40,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      material: 'Silk Blend with Kundan Stone Work',
      dimensions: 'Sizes 0 to 6 available',
      careInstructions: 'Keep in velvet box after daily pooja.',
      images: [
        { url: 'https://images.unsplash.com/photo-1609137144822-4467c699faaa?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Laddu Gopal Kundan Poshak' },
      ],
      variants: [
        { size: 'Size 2 (3-4 inch)', color: 'Vrindavan Red (लाल)', sku: 'LG-KUN-01-S2', price: 699, stock: 15 },
        { size: 'Size 4 (5-6 inch)', color: 'Vrindavan Red (लाल)', sku: 'LG-KUN-01-S4', price: 799, stock: 15 },
        { size: 'Size 6 (7-8 inch)', color: 'Vrindavan Red (लाल)', sku: 'LG-KUN-01-S6', price: 999, stock: 10 },
      ],
    },
    {
      categoryId: catLadduGopal.id,
      name: 'Nitya Seva Cotton Daily Dress Set for Thakurji (Pack of 7 Days)',
      nameHi: 'नित्य सेवा शुद्ध सूती पोशाक सेट (7 दिनों के 7 रंग)',
      slug: 'nitya-seva-cotton-daily-dress-set-for-thakurji-pack-of-7-days',
      description: 'A sacred set of 7 pure handloom soft cotton dresses in the 7 colors of the week as prescribed in Vrindavan Vaishnav tradition.',
      descriptionHi: 'वृन्दावन परंपरानुसार सप्ताह के सातों दिनों के लिए शुद्ध सूती मुलायम पोशाकों का 7 रंगों का सेट।',
      basePrice: 1199,
      discountPrice: 949,
      sku: 'LG-NIT-02',
      stock: 35,
      isFeatured: false,
      isBestseller: true,
      isNewArrival: true,
      material: '100% Breathable Malmal Cotton',
      dimensions: 'Available in Size 0 to Size 5',
      careInstructions: 'Gentle hand wash with Ganga jal or mild soap.',
      images: [
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Pack of 7 Cotton Dresses' },
      ],
      variants: [
        { size: 'Size 1 (0-3 mo idol)', color: 'Assorted 7 Colors', sku: 'LG-NIT-02-S1', price: 949, stock: 15 },
        { size: 'Size 3 (Medium idol)', color: 'Assorted 7 Colors', sku: 'LG-NIT-02-S3', price: 1099, stock: 20 },
      ],
    },

    // --- 3. Shringar & Jewellery ---
    {
      categoryId: catJewellery.id,
      name: 'Vrindavan Chandrika Kundan Mukut with Natural Mor-Pankh',
      nameHi: 'वृन्दावन चंद्रिका कुंदन मुकुट एवं दिव्य मोरपंख',
      slug: 'vrindavan-chandrika-kundan-mukut-with-natural-mor-pankh',
      description: 'Masterfully crafted brass alloy mukut featuring miniature ruby and emerald colored stones, crowned with a natural sanctified Vrindavan peacock feather.',
      descriptionHi: 'माणिक्य व पन्ना जड़े कुंदन पत्थरों से अलंकृत दिव्य मुकुट, प्राकृतिक मोरपंख सहित।',
      basePrice: 799,
      discountPrice: 599,
      sku: 'JW-MUK-01',
      stock: 50,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      material: 'Brass with 24k Gold Polish & Real Peacock Feather',
      dimensions: 'Height: 3.5 inches, Width: 2.5 inches',
      careInstructions: 'Keep away from moisture and direct water contact.',
      images: [
        { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Kundan Mukut Front' },
      ],
      variants: [
        { size: 'Small (Size 1-3)', color: 'Gold & Green', sku: 'JW-MUK-01-S', price: 599, stock: 25 },
        { size: 'Large (Size 4-6)', color: 'Gold & Green', sku: 'JW-MUK-01-L', price: 749, stock: 25 },
      ],
    },
    {
      categoryId: catJewellery.id,
      name: 'Carved Brass Bansuri with Pearl Latkan & Radha Name Engraving',
      nameHi: 'नक्काशीदार पीतल की मुरली (राधा नाम उत्कीर्ण)',
      slug: 'carved-brass-bansuri-with-pearl-latkan-radha-name-engraving',
      description: 'Pure solid brass flute engraved with holy "श्री राधा" in Devanagari script, detailed with mini brass peacocks and cascading pearl latkan.',
      descriptionHi: 'शुद्ध पीतल पर श्री राधा नाम से अंकित मनोहर बांसुरी, मोतियों के सुंदर लटकन के साथ।',
      basePrice: 499,
      discountPrice: 399,
      sku: 'JW-BAN-02',
      stock: 60,
      isFeatured: false,
      isBestseller: true,
      isNewArrival: false,
      material: '100% Solid Brass with Antique Polish',
      dimensions: 'Length: 5 inches',
      careInstructions: 'Clean with dry soft microfiber cloth.',
      images: [
        { url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Brass Bansuri' },
      ],
      variants: [
        { size: '4 Inch Flute', color: 'Golden Brass', sku: 'JW-BAN-02-4IN', price: 399, stock: 30 },
        { size: '6 Inch Flute', color: 'Golden Brass', sku: 'JW-BAN-02-6IN', price: 499, stock: 30 },
      ],
    },
    {
      categoryId: catJewellery.id,
      name: 'Navratna & Moti Mala Shringar Set for Yugal Sarkar',
      nameHi: 'नवरत्न एवं मोती कंठहार श्रृंगार सेट (युगल सरकार)',
      slug: 'navratna-and-moti-malam-shringar-set-for-yugal-sarkar',
      description: 'Traditional five-string pearl necklace with Navratna pendant, matching earrings (kundal), and delicate kamarbandh.',
      descriptionHi: 'पाँच लड़ी मोतियों का नवरत्न कंठहार, कर्णफूल एवं करधनी का संपूर्ण युगल श्रृंगार सेट।',
      basePrice: 649,
      discountPrice: 499,
      sku: 'JW-MAL-03',
      stock: 45,
      isFeatured: false,
      isBestseller: false,
      isNewArrival: true,
      material: 'Cultured Faux Pearls and Colored Stones',
      dimensions: 'Adjustable thread length',
      images: [
        { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Pearl Mala Set' },
      ],
      variants: [
        { size: 'Standard Adjustable', color: 'Pearl White & Multicolor', sku: 'JW-MAL-03-STD', price: 499, stock: 45 },
      ],
    },

    // --- 4. Framed Pictures & Posters ---
    {
      categoryId: catPictures.id,
      name: 'Divine Yugal Sarkar Darshan in Vrindavan - Gold Embossed Frame',
      nameHi: 'श्री युगल सरकार दिव्य दर्शन - स्वर्ण नक्काशीदार फ्रेम',
      slug: 'divine-yugal-sarkar-darshan-in-vrindavan-gold-embossed-frame',
      description: 'Sanctified portrait of Shri Radha and Krishna surrounded by Vrindavan cows, kadamba trees, and peacocks. Non-glare acrylic glass and wooden frame.',
      descriptionHi: 'श्री राधा कृष्ण के निकुंज दर्शन का मनोहारी चित्र। ऐक्रेलिक ग्लास एवं स्वर्ण नक्काशी फ्रेम।',
      basePrice: 1499,
      discountPrice: 1199,
      sku: 'PIC-YUG-01',
      stock: 20,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      material: '300 GSM Archival Textured Canvas with Engineered Wood Frame',
      dimensions: '12 x 18 inches (30 x 45 cm)',
      careInstructions: 'Wipe clean with a dry duster.',
      images: [
        { url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Framed Yugal Sarkar Portrait' },
      ],
      variants: [
        { size: '12x18 Inch', color: 'Royal Golden Frame', sku: 'PIC-YUG-01-1218', price: 1199, stock: 12 },
        { size: '16x24 Inch', color: 'Royal Golden Frame', sku: 'PIC-YUG-01-1624', price: 1799, stock: 8 },
      ],
    },
    {
      categoryId: catPictures.id,
      name: 'Barsana Radha Rani Mahal Sunrise Divine Poster Frame',
      nameHi: 'बरसाना श्री राधा रानी महल दिव्य प्रभात फ्रेम',
      slug: 'barsana-radha-rani-mahal-sunrise-divine-poster-frame',
      description: 'Breathtaking high-definition panoramic photography of Shriji Temple atop Bhanugarh Hill, Barsana during Brahmamuhurta sunrise.',
      descriptionHi: 'बरसाना श्रीजी महल भानुगढ़ की ब्रह्ममुहूर्त प्रभात का विहंगम अलौकिक चित्र।',
      basePrice: 1299,
      discountPrice: 999,
      sku: 'PIC-BAR-02',
      stock: 22,
      isFeatured: false,
      isBestseller: false,
      isNewArrival: true,
      material: 'Metallic Photographic Paper with Teak Finish Frame',
      dimensions: '10 x 15 inches',
      images: [
        { url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Barsana Temple Sunrise Frame' },
      ],
      variants: [
        { size: '10x15 Inch', color: 'Antique Brown', sku: 'PIC-BAR-02-1015', price: 999, stock: 22 },
      ],
    },

    // --- 5. Pooja & Mandir Decoration ---
    {
      categoryId: catDecoration.id,
      name: 'Peacock Carved Brass Laddu Gopal Jhoola (Swing)',
      nameHi: 'मयूर नक्काशीदार शुद्ध पीतल झूला (लड्डू गोपाल जी)',
      slug: 'peacock-carved-brass-laddu-gopal-jhoola-swing',
      description: 'Solid brass handcrafted swing with double peacock arch, smooth silent chains, and padded velvet gaddi (cushion) for Bal Gopal Jhulan Yatra.',
      descriptionHi: 'झूलन यात्रा उत्सव हेतु शुद्ध पीतल का भव्य मयूर झूला, मखमली गद्दी सहित।',
      basePrice: 2899,
      discountPrice: 2499,
      sku: 'DEC-JHO-01',
      stock: 15,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      material: '100% Solid Heavy Brass (Weight: ~1.8 kg)',
      dimensions: 'Height: 10 inches, Base: 8 x 6 inches',
      careInstructions: 'Clean with Pitambari powder or lemon water for lasting luster.',
      images: [
        { url: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Brass Peacock Jhoola' },
      ],
      variants: [
        { size: 'Medium (Up to Size 4)', color: 'Lustrous Brass Gold', sku: 'DEC-JHO-01-MED', price: 2499, stock: 10 },
        { size: 'Large (Up to Size 6)', color: 'Lustrous Brass Gold', sku: 'DEC-JHO-01-LRG', price: 3299, stock: 5 },
      ],
    },
    {
      categoryId: catDecoration.id,
      name: 'Handcrafted Vrindavan Brass Aarti Thali Set with Akhand Diya & Bell',
      nameHi: 'वृन्दावन हस्तशिल्प पीतल आरती थाली सेट (अखंड दीप व घंटी सहित)',
      slug: 'handcrafted-vrindavan-brass-aarti-thali-set-with-akhand-diya-bell',
      description: 'Complete 7-piece pooja set: Engraved Radha-Krishna thali, peacock ghanti, Panchamrit bowl, dhoop daan, chandan batli, akhand diya with glass cover, and spoon.',
      descriptionHi: 'संपूर्ण 7-वस्तु पूजा सेट: नक्काशीदार थाली, मोर घंटी, पंचामृत कटोरी, धूपदान, अखंड दीप व आचमनी।',
      basePrice: 1999,
      discountPrice: 1699,
      sku: 'DEC-THA-02',
      stock: 25,
      isFeatured: false,
      isBestseller: true,
      isNewArrival: false,
      material: 'Pure Brass with Borosilicate Glass Diya Cover',
      dimensions: 'Thali Diameter: 11 inches',
      careInstructions: 'Wash gently with warm water and soap.',
      images: [
        { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80', isPrimary: true, altText: 'Brass Aarti Thali Set' },
      ],
      variants: [
        { size: '11 Inch Thali Set (7 Pcs)', color: 'Glossy Gold', sku: 'DEC-THA-02-11IN', price: 1699, stock: 25 },
      ],
    },
  ];

  for (const item of productsData) {
    const { images, variants, ...prod } = item;
    const createdProduct = await prisma.product.create({
      data: {
        ...prod,
        images: {
          create: images.map((img, idx) => ({
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
            displayOrder: idx,
          })),
        },
        variants: {
          create: variants.map((v) => ({
            size: v.size,
            color: v.color,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
          })),
        },
      },
    });

    // Seed 1-2 authentic reviews for each product
    await prisma.review.create({
      data: {
        productId: createdProduct.id,
        userId: customer.id,
        rating: 5,
        title: 'अति दिव्य एवं मनमोहक!',
        comment: 'श्री जी के दर्शन कर हृदय गदगद हो गया। वस्त्रों की कारीगरी और कपड़े की गुणवत्ता बहुत ही उत्तम है। राधे राधे!',
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });
  }

  console.log(` Seeded 12 comprehensive products across all 5 devotional categories with reviews`);

  // 5. Seed Discount Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'VRINDAVAN10',
        description: '10% discount on devotional orders above ₹499 (Max ₹200)',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 499,
        maxDiscountAmount: 200,
        usageLimit: 500,
        isActive: true,
      },
      {
        code: 'RADHE100',
        description: 'Flat ₹100 instant discount on orders above ₹799',
        discountType: DiscountType.FIXED,
        discountValue: 100,
        minOrderAmount: 799,
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: 'FIRSTBHAKTI',
        description: '15% welcome blessing discount for new devotees above ₹999 (Max ₹300)',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15,
        minOrderAmount: 999,
        maxDiscountAmount: 300,
        usageLimit: 200,
        isActive: true,
      },
    ],
  });

  console.log(' Seeded 3 active discount coupons (VRINDAVAN10, RADHE100, FIRSTBHAKTI)');

  console.log('🎉 Database seeding completed successfully! Radhe Radhe!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
