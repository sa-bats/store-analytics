export type StockStatus = 'OUT' | 'LOW' | 'IN_STOCK';

export interface Supplier {
  id: string;
  name: string;
}

export interface Review {
  rating: number;
}

export interface DiscountRule {
  category: string;
  discountPercent: number;
  minRating?: number;
}

export interface Product {
  name: string;
  sku: string;
  category: string;
  supplierId: string;
  warehouseQuantities: number[];
  price: number;
  reviews: Review[];
  specs?: Record<string, string | number>;
}

export function calculateAvailable(quantities: number[]): number {
  return quantities.reduce((sum, q) => sum + q, 0);
}

export function getStockStatus(available: number): StockStatus {
  if (available === 0) return 'OUT';
  if (available <= 2) return 'LOW';
  return 'IN_STOCK';
}

export function calculateAverageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

export function applyDiscount(product: Product, rules: DiscountRule[]): number | null {
  const rule = rules.find(r => r.category === product.category);
  if (!rule) return null;

  if (rule.minRating !== undefined) {
    const avg = calculateAverageRating(product.reviews);
    if (avg === null || avg < rule.minRating) return null;
  }

  return Math.round(product.price * (1 - rule.discountPercent / 100) * 100) / 100;
}

export const suppliers: Supplier[] = [
  { id: 'techpro', name: 'TechPro Estonia' },
  { id: 'bookworld', name: 'BookWorld Baltic' },
  { id: 'gadgetzone', name: 'GadgetZone EU' },
];

export const discountRules: DiscountRule[] = [
  { category: 'Electronics', discountPercent: 10, minRating: 4.0 },
  { category: 'Books', discountPercent: 15, minRating: 4.0 },
  { category: 'Accessories', discountPercent: 12 },
];

export const products: Product[] = [
  {
    name: 'Sony WH-1000XM5',
    sku: 'EL-SONY-WH5',
    category: 'Electronics',
    supplierId: 'techpro',
    warehouseQuantities: [2, 1, 0],
    price: 349.99,
    reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 4 }],
    specs: { driver: '40mm', battery: '30h' },
  },
  {
    name: 'Raspberry Pi 5',
    sku: 'EL-RPI-5',
    category: 'Electronics',
    supplierId: 'techpro',
    warehouseQuantities: [0, 0, 0],
    price: 89.99,
    reviews: [],
    specs: { cpu: 'ARM A76', ram: 8 },
  },
  {
    name: 'JavaScript: The Good Parts',
    sku: 'BK-JS-GOOD',
    category: 'Books',
    supplierId: 'bookworld',
    warehouseQuantities: [1, 0, 0],
    price: 34.90,
    reviews: [{ rating: 5 }, { rating: 4 }],
    specs: { pages: 176, language: 'EN' },
  },
  {
    name: 'Clean Code',
    sku: 'BK-CLEAN-CODE',
    category: 'Books',
    supplierId: 'bookworld',
    warehouseQuantities: [4, 3, 5],
    price: 44.90,
    reviews: [{ rating: 3 }, { rating: 2 }, { rating: 4 }],
    specs: { pages: 431, language: 'EN' },
  },
  {
    name: 'Anker USB-C 65W Charger',
    sku: 'AC-ANKER-65W',
    category: 'Accessories',
    supplierId: 'gadgetzone',
    warehouseQuantities: [6, 3, 0],
    price: 49.99,
    reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
    specs: { watts: 65, ports: 2 },
  },
  {
    name: 'Logitech Pebble M350',
    sku: 'AC-LOG-M350',
    category: 'Accessories',
    supplierId: 'gadgetzone',
    warehouseQuantities: [2, 0, 0],
    price: 39.99,
    reviews: [],
    specs: { dpi: 4000, wireless: 'true' },
  },
];