import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Force update to sync with Vercel
  // ─── USERS ────────────────────────────────────────
  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      fullName: "Admin User",
      email: "admin@optixshop.com",
      passwordHash: hash("admin123"),
      role: "ADMIN",
      isActive: true
    },
  });

  const manager = await prisma.user.upsert({
    where: { username: "manager" },
    update: {},
    create: {
      username: "manager",
      fullName: "Store Manager",
      email: "manager@optixshop.com",
      passwordHash: hash("manager123"),
      role: "MANAGER",
      isActive: true
    },
  });

  const cashier1 = await prisma.user.upsert({
    where: { username: "cashier1" },
    update: {},
    create: {
      username: "cashier1",
      fullName: "Priya Sharma",
      email: "cashier1@optixshop.com",
      passwordHash: hash("cashier123"),
      role: "CASHIER",
      isActive: true
    },
  });

  const optician = await prisma.user.upsert({
    where: { username: "optician" },
    update: {},
    create: {
      username: "optician",
      fullName: "Dr. Rahul Verma",
      email: "optician@optixshop.com",
      passwordHash: hash("optician123"),
      role: "SALES_PERSON",
      isActive: true
    },
  });

  console.log("  ✅ Users created");

  // ─── SETTINGS ─────────────────────────────────────
  const settings = [
    { key: "store_name", value: "OptixShop Optical Store", category: "general" },
    { key: "store_phone", value: "+91 98765 43210", category: "general" },
    { key: "store_email", value: "info@optixshop.com", category: "general" },
    { key: "store_address", value: "123 MG Road, Bangalore, Karnataka 560001", category: "general" },
    { key: "gst_number", value: "29ABCDE1234F1Z5", category: "tax" },
    { key: "tax_rate", value: "18", category: "tax" },
    { key: "currency", value: "INR", category: "general" },
    { key: "loyalty_points_per_100", value: "1", category: "loyalty" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log("  ✅ Settings created");

  // ─── CATEGORIES ───────────────────────────────────
  const catFrames = await prisma.productCategory.create({
    data: { id: "cat-frames", name: "Eyeglasses Frames", sortOrder: 1, isActive: true }
  });
  const catLenses = await prisma.productCategory.create({
    data: { id: "cat-lenses", name: "Prescription Lenses", sortOrder: 2, isActive: true }
  });
  const catContacts = await prisma.productCategory.create({
    data: { id: "cat-contacts", name: "Contact Lenses", sortOrder: 3, isActive: true }
  });
  const catSunglasses = await prisma.productCategory.create({
    data: { id: "cat-sunglasses", name: "Sunglasses", sortOrder: 4, isActive: true }
  });
  const catAccessories = await prisma.productCategory.create({
    data: { id: "cat-accessories", name: "Accessories", sortOrder: 5, isActive: true }
  });
  const catSolutions = await prisma.productCategory.create({
    data: { id: "cat-solutions", name: "Lens Solutions", sortOrder: 6, isActive: true }
  });
  console.log("  ✅ Categories created");

  // ─── BRANDS ───────────────────────────────────────
  const brands: Record<string, { id: string; name: string }> = {};
  for (const name of ["Ray-Ban", "Oakley", "Titan", "Lenskart", "Vincent Chase", "John Jacobs", "Bausch & Lomb", "Acuvue", "Crizal", "Zeiss"]) {
    brands[name] = await prisma.brand.create({ data: { name, isActive: true } });
  }
  console.log("  ✅ Brands created");

  // ─── PRODUCTS ─────────────────────────────────────
  const productsData = [
    { sku: "FRM-001", name: "Ray-Ban Aviator Classic", type: "frame", catId: catFrames.id, brandId: brands["Ray-Ban"].id, cost: 4500, sell: 8500, mrp: 9500 },
    { sku: "FRM-002", name: "Oakley Half Jacket 2.0", type: "frame", catId: catFrames.id, brandId: brands["Oakley"].id, cost: 5200, sell: 9800, mrp: 11000 },
    { sku: "FRM-003", name: "Titan Full Rim Rectangle", type: "frame", catId: catFrames.id, brandId: brands["Titan"].id, cost: 1200, sell: 2400, mrp: 2800 },
    { sku: "FRM-004", name: "Lenskart Air Flex Round", type: "frame", catId: catFrames.id, brandId: brands["Lenskart"].id, cost: 800, sell: 1499, mrp: 1999 },
    { sku: "FRM-005", name: "John Jacobs Cat Eye", type: "frame", catId: catFrames.id, brandId: brands["John Jacobs"].id, cost: 1500, sell: 2999, mrp: 3499 },
    { sku: "FRM-006", name: "Vincent Chase Wayfarer", type: "frame", catId: catFrames.id, brandId: brands["Vincent Chase"].id, cost: 600, sell: 1299, mrp: 1499 },
    { sku: "LNS-001", name: "Crizal Sapphire UV 1.67", type: "lens", catId: catLenses.id, brandId: brands["Crizal"].id, cost: 3500, sell: 6500, mrp: 7500 },
    { sku: "LNS-002", name: "Zeiss SmartLife Progressive", type: "lens", catId: catLenses.id, brandId: brands["Zeiss"].id, cost: 8000, sell: 14500, mrp: 16000 },
    { sku: "LNS-003", name: "Crizal Blue Cut 1.56", type: "lens", catId: catLenses.id, brandId: brands["Crizal"].id, cost: 1800, sell: 3500, mrp: 4000 },
    { sku: "LNS-004", name: "Zeiss Single Vision 1.6", type: "lens", catId: catLenses.id, brandId: brands["Zeiss"].id, cost: 2200, sell: 4500, mrp: 5200 },
    { sku: "CL-001", name: "Acuvue Oasys Daily 30pk", type: "contact_lens", catId: catContacts.id, brandId: brands["Acuvue"].id, cost: 1200, sell: 1899, mrp: 2200 },
    { sku: "CL-002", name: "Bausch & Lomb SofLens Monthly", type: "contact_lens", catId: catContacts.id, brandId: brands["Bausch & Lomb"].id, cost: 400, sell: 799, mrp: 999 },
    { sku: "SUN-001", name: "Ray-Ban Wayfarer Polarized", type: "sunglasses", catId: catSunglasses.id, brandId: brands["Ray-Ban"].id, cost: 5500, sell: 9999, mrp: 12000 },
    { sku: "SUN-002", name: "Oakley Holbrook Sport", type: "sunglasses", catId: catSunglasses.id, brandId: brands["Oakley"].id, cost: 4800, sell: 8999, mrp: 10500 },
    { sku: "ACC-001", name: "Premium Microfiber Cloth Set", type: "accessory", catId: catAccessories.id, brandId: null, cost: 50, sell: 149, mrp: 199 },
    { sku: "ACC-002", name: "Hard Shell Glasses Case", type: "accessory", catId: catAccessories.id, brandId: null, cost: 120, sell: 349, mrp: 499 },
    { sku: "SOL-001", name: "Bausch & Lomb ReNu Multi 360ml", type: "solution", catId: catSolutions.id, brandId: brands["Bausch & Lomb"].id, cost: 220, sell: 399, mrp: 450 },
    { sku: "SOL-002", name: "Acuvue RevitaLens 300ml", type: "solution", catId: catSolutions.id, brandId: brands["Acuvue"].id, cost: 280, sell: 499, mrp: 550 },
  ];

  const createdProducts: Record<string, { id: string; sku: string; name: string }> = {};
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        productType: p.type,
        categoryId: p.catId,
        brandId: p.brandId,
        costPrice: p.cost,
        sellingPrice: p.sell,
        mrp: p.mrp,
        taxRate: 18,
        isActive: true,
      },
    });
    createdProducts[p.sku] = product;
    // Create inventory
    const qty = p.type === "accessory" || p.type === "solution" ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 30) + 5;
    await prisma.inventory.create({
      data: { productId: product.id, location: "main", quantity: qty },
    });
  }
  console.log("  ✅ Products + Inventory created");

  // ─── CUSTOMERS ────────────────────────────────────
  const customersData = [
    { no: "CUST00001", first: "Rahul", last: "Kumar", phone: "9876543210", email: "rahul@email.com", city: "Bangalore", gender: "Male" },
    { no: "CUST00002", first: "Priya", last: "Singh", phone: "9876543211", email: "priya@email.com", city: "Bangalore", gender: "Female" },
    { no: "CUST00003", first: "Amit", last: "Patel", phone: "9876543212", email: "amit@email.com", city: "Mumbai", gender: "Male" },
    { no: "CUST00004", first: "Sneha", last: "Reddy", phone: "9876543213", email: "sneha@email.com", city: "Hyderabad", gender: "Female" },
    { no: "CUST00005", first: "Vikram", last: "Joshi", phone: "9876543214", email: "vikram@email.com", city: "Pune", gender: "Male" },
    { no: "CUST00006", first: "Anjali", last: "Gupta", phone: "9876543215", email: "anjali@email.com", city: "Delhi", gender: "Female" },
    { no: "CUST00007", first: "Karan", last: "Mehta", phone: "9876543216", email: "karan@email.com", city: "Bangalore", gender: "Male" },
    { no: "CUST00008", first: "Deepa", last: "Nair", phone: "9876543217", email: "deepa@email.com", city: "Kochi", gender: "Female" },
    { no: "CUST00009", first: "Suresh", last: "Rao", phone: "9876543218", city: "Chennai", gender: "Male" },
    { no: "CUST00010", first: "Meena", last: "Iyer", phone: "9876543219", email: "meena@email.com", city: "Bangalore", gender: "Female" },
    { no: "CUST00011", first: "Arjun", last: "Shah", phone: "9876543220", city: "Ahmedabad", gender: "Male" },
    { no: "CUST00012", first: "Ritu", last: "Kapoor", phone: "9876543221", email: "ritu@email.com", city: "Jaipur", gender: "Female" },
    { no: "CUST00013", first: "Naveen", last: "Prasad", phone: "9876543222", city: "Bangalore", gender: "Male" },
    { no: "CUST00014", first: "Kavitha", last: "Menon", phone: "9876543223", email: "kavitha@email.com", city: "Trivandrum", gender: "Female" },
    { no: "CUST00015", first: "Sanjay", last: "Deshmukh", phone: "9876543224", city: "Nagpur", gender: "Male" },
  ];

  for (const c of customersData) {
    await prisma.customer.create({
      data: {
        customerNo: c.no,
        firstName: c.first,
        lastName: c.last,
        phone: c.phone,
        email: c.email,
        city: c.city,
        gender: c.gender,
        isActive: true,
      },
    });
  }
  console.log("  ✅ Customers created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("   Login with: admin / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });