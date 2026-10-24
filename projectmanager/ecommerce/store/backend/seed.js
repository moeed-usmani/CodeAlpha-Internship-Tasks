import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';
dotenv.config();

const raw = [
  ['Chronos Tourbillon Watch', 'Watches', 1850, 'Swiss-movement automatic with sapphire crystal and a hand-finished gold dial.', true],
  ['Noir Skeleton Watch', 'Watches', 1290, 'Open-heart skeleton dial in matte black steel. Limited run.', true],
  ['Meridian Chronograph', 'Watches', 980, 'Precision chronograph with a brushed titanium case and leather strap.', false],
  ['Velvet Oud Parfum', 'Fragrance', 240, 'Deep oud, saffron and amber. 100ml extrait de parfum.', true],
  ['Aurora Eau de Parfum', 'Fragrance', 180, 'Bergamot, white musk and iris. Light, clean, long-lasting.', false],
  ['Midnight Cedar Cologne', 'Fragrance', 150, 'Smoky cedarwood with a hint of black pepper.', false],
  ['Aviator Gold Sunglasses', 'Eyewear', 320, 'Polarised lenses in a 18k gold-plated frame.', true],
  ['Obsidian Round Frames', 'Eyewear', 275, 'Handmade acetate frames with anti-glare lenses.', false],
  ['Milano Leather Wallet', 'Leather', 210, 'Full-grain Italian leather, six card slots, RFID safe.', false],
  ['Atelier Weekender Bag', 'Leather', 680, 'Hand-stitched calfskin duffle with brass hardware.', true],
  ['Sovereign Leather Belt', 'Leather', 160, 'Reversible belt with a polished gold buckle.', false],
  ['Lumen Silk Scarf', 'Accessories', 130, 'Hand-rolled mulberry silk with an abstract gold print.', false],
  ['Eclipse Cufflinks', 'Accessories', 190, 'Onyx and rose-gold cufflinks in a presentation box.', false],
  ['Regent Fountain Pen', 'Accessories', 420, 'Resin barrel with a 14k nib, gift boxed.', true],
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const products = raw.map(([name, category, price, description, featured], i) => ({
  name, category, price, description, featured,
  slug: slugify(name),
  image: `/products/${slugify(name)}.svg`,
  stock: 10 + ((i * 7) % 25),
  rating: +(4.5 + ((i * 3) % 5) / 10).toFixed(1),
}));

await mongoose.connect(process.env.MONGO_URI);
await Product.deleteMany({});
await Product.insertMany(products);
console.log(`Seeded ${products.length} products`);
process.exit(0);
