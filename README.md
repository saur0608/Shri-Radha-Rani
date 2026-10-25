# Shri Radha Rani Devotional E-Commerce Store (श्री राधा रानी श्रृंगार)

A production-ready e-commerce platform dedicated to holy Radha Rani and Thakurji devotional items, designed for devotees across India.

## 🌸 Shop Profile
- **Shop Name**: Shri Radha Rani Shringar (श्री राधा रानी श्रृंगार)
- **Sacred Offerings**:
  1. Radha Rani Poshak / Clothes (Zardozi, Silk, Velvet, Organza)
  2. Laddu Gopal Dress Sets (Size 0 to Size 6, Pagdi, Patka)
  3. Shringar & Jewellery (Kundan Mukut, Chandrika, Mor-Pankh, Brass Bansuri, Moti Mala)
  4. Framed Pictures & Posters (Vrindavan, Barsana, Yugal Sarkar)
  5. Mandir & Pooja Decoration (Brass Jhoola, Akhand Diya, Thali sets, Garlands)
- **Target Audience**: Devotees across India (Mobile-first experience)
- **Bilingual**: English & Hindi (हिंदी)
- **Currency**: Indian Rupees (₹ INR)

## 🏗️ Tech Stack
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Lucide Icons, Devanagari Typography
- **Backend**: Node.js, Express, TypeScript, Zod Input Validation
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with secure `httpOnly` cookies & bcrypt hashing
- **Payments**: Razorpay (UPI, Cards, Net Banking) + Cash on Delivery (COD)
- **Image Storage**: Cloudinary

---

## 🚀 Development Phases

- [x] **Phase 1: Database + Backend API** (Completed & Verified)
  - 13 Relational models in Prisma schema
  - 12 Rich sample products across all devotional categories
  - Zod validation on every input
  - Database-enforced price calculations (never trusts browser prices)
  - Atomic transactions with stock decrement/restoration
  - JWT auth (httpOnly cookies) + Admin role guard
  - Rate limiting, Helmet, CORS, and request logging
  - Razorpay order creation, HMAC-SHA256 signature verification, and webhook handlers
- [ ] **Phase 2: Customer Frontend** (Next.js App Router, Tailwind, Hindi/English toggle, Mobile-first)
- [ ] **Phase 3: Razorpay Payments Integration** (Frontend checkout flow, Webhook testing)
- [ ] **Phase 4: Admin Panel** (Dashboard, products, orders, inventory, coupons)
- [ ] **Phase 5: Deployment** (Vercel + Render/Railway + Pre-launch checklist)
