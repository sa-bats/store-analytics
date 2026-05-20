import {
  products,
  suppliers,
  discountRules,
  calculateAvailable,
  getStockStatus,
  calculateAverageRating,
  applyDiscount,
  Product,
} from './core';

function formatSpecs(specs: Record<string, string | number>): string {
  return Object.entries(specs)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
}

function formatRating(reviews: Product['reviews']): string {
  const avg = calculateAverageRating(reviews);
  return avg === null ? 'no reviews' : avg.toFixed(2);
}

function formatPrice(price: number, discounted: number | null): string {
  if (discounted === null) return price.toFixed(2);
  return `${price.toFixed(2)} -> ${discounted.toFixed(2)}`;
}

function formatProduct(product: Product): string {
  const supplier = suppliers.find(s => s.id === product.supplierId);
  const supplierName = supplier ? supplier.name : 'Unknown';

  const available = calculateAvailable(product.warehouseQuantities);
  const status = getStockStatus(available);
  const discounted = applyDiscount(product, discountRules);

  const parts = [
    `${product.name} [${product.sku}]`,
    product.category,
    `supplier: ${supplierName}`,
    `available: ${available} (${status})`,
    `rating: ${formatRating(product.reviews)}`,
  ];

  if (product.specs) {
    parts.push(`specs: ${formatSpecs(product.specs)}`);
  }

  parts.push(`price: ${formatPrice(product.price, discounted)}`);

  return ` - ${parts.join(' | ')}`;
}

function printReport(): void {
  console.log('Products:');
  products.forEach(product => console.log(formatProduct(product)));
}

printReport();
