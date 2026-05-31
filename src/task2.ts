import {
  products as initialProducts,
  suppliers,
  discountRules,
  calculateAvailable,
  getStockStatus,
  calculateAverageRating,
  applyDiscount,
  Product,
} from './core';

const STORAGE_KEY = 'store-analytics-products';

// --- localStorage ---

function loadProducts(): Product[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Product[];
  } catch {
    // corrupted data — fall back to defaults
  }
  return [...initialProducts];
}

function saveProducts(list: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

let productList: Product[] = loadProducts();

// --- helpers ---

function getSupplierName(supplierId: string): string {
  return suppliers.find(s => s.id === supplierId)?.name ?? supplierId;
}

function generateSku(name: string, category: string): string {
  const prefix = category.substring(0, 2).toUpperCase();
  const initials = name
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .substring(0, 5);
  const suffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${initials}-${suffix}`;
}

function parseSpecs(raw: string): Record<string, string | number> | undefined {
  if (!raw.trim()) return undefined;
  const result: Record<string, string | number> = {};
  raw.split(',').forEach(pair => {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) return;
    const key = pair.slice(0, eqIdx).trim();
    const val = pair.slice(eqIdx + 1).trim();
    if (!key) return;
    const num = Number(val);
    result[key] = isNaN(num) || val === '' ? val : num;
  });
  return Object.keys(result).length ? result : undefined;
}

// --- validation ---

interface FormErrors {
  name?: string;
  category?: string;
  price?: string;
  quantities?: string;
}

function validateForm(name: string, category: string, price: string, quantities: string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim()) errors.name = 'Required';
  if (!category.trim()) errors.category = 'Required';
  const priceNum = parseFloat(price);
  if (!price.trim() || isNaN(priceNum) || priceNum <= 0) errors.price = 'Must be > 0';
  const qtys = quantities.split(',').map(q => parseInt(q.trim(), 10));
  if (!quantities.trim() || qtys.length === 0 || qtys.some(q => isNaN(q) || q < 0)) {
    errors.quantities = 'Must be comma-separated non-negative integers';
  }
  return errors;
}

// --- DOM: card ---

function createProductCard(product: Product): HTMLElement {
  const available = calculateAvailable(product.warehouseQuantities);
  const status = getStockStatus(available);
  const avgRating = calculateAverageRating(product.reviews);
  const discounted = applyDiscount(product, discountRules);

  const card = document.createElement('div');
  card.className = 'product-card';

  const priceHtml = discounted !== null
    ? `<span class="original">$${product.price.toFixed(2)}</span>
       <span class="discounted">$${discounted.toFixed(2)}</span>`
    : `$${product.price.toFixed(2)}`;

  const specsHtml = product.specs
    ? `<div class="specs">${
        Object.entries(product.specs).map(([k, v]) => `${k}=${v}`).join(', ')
      }</div>`
    : '';

  card.innerHTML = `
    <h3>${product.name}</h3>
    <div class="sku">${product.sku}</div>
    <div class="category">${product.category} · ${getSupplierName(product.supplierId)}</div>
    <div class="price">${priceHtml}</div>
    <div class="available">Available: ${available}</div>
    <span class="status status-${status}">${status}</span>
    <div class="rating">Rating: ${avgRating !== null ? avgRating.toFixed(2) : 'no reviews'}</div>
    ${specsHtml}
  `;

  return card;
}

// --- DOM: filter + sort + render ---

function getFilteredSorted(): Product[] {
  const query = (document.getElementById('filter') as HTMLInputElement).value.toLowerCase().trim();
  const sortBy = (document.getElementById('sort') as HTMLSelectElement).value;

  const list = productList.filter(p => p.name.toLowerCase().includes(query));

  list.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'available':
        return calculateAvailable(b.warehouseQuantities) - calculateAvailable(a.warehouseQuantities);
      case 'rating': {
        const ra = calculateAverageRating(a.reviews) ?? -1;
        const rb = calculateAverageRating(b.reviews) ?? -1;
        return rb - ra;
      }
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return list;
}

function renderProducts(): void {
  const container = document.getElementById('products-container')!;
  container.innerHTML = '';
  getFilteredSorted().forEach(p => container.appendChild(createProductCard(p)));
}

// --- init ---

document.addEventListener('DOMContentLoaded', () => {
  // populate supplier select from core.ts data
  const supplierSelect = document.getElementById('supplierId') as HTMLSelectElement;
  suppliers.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    supplierSelect.appendChild(opt);
  });

  renderProducts();

  // filter + sort
  document.getElementById('filter')!.addEventListener('input', renderProducts);
  document.getElementById('sort')!.addEventListener('change', renderProducts);

  // form submit
  const form = document.getElementById('product-form') as HTMLFormElement;
  form.addEventListener('submit', e => {
    e.preventDefault();

    const nameInput     = document.getElementById('name')       as HTMLInputElement;
    const categoryInput = document.getElementById('category')   as HTMLInputElement;
    const priceInput    = document.getElementById('price')      as HTMLInputElement;
    const qtysInput     = document.getElementById('quantities') as HTMLInputElement;
    const specsInput    = document.getElementById('specs')      as HTMLInputElement;

    // clear previous error highlights
    [nameInput, categoryInput, priceInput, qtysInput].forEach(el => el.classList.remove('error'));

    const errors = validateForm(nameInput.value, categoryInput.value, priceInput.value, qtysInput.value);

    if (Object.keys(errors).length) {
      if (errors.name)       nameInput.classList.add('error');
      if (errors.category)   categoryInput.classList.add('error');
      if (errors.price)      priceInput.classList.add('error');
      if (errors.quantities) qtysInput.classList.add('error');
      return;
    }

    const newProduct: Product = {
      name:               nameInput.value.trim(),
      sku:                generateSku(nameInput.value.trim(), categoryInput.value.trim()),
      category:           categoryInput.value.trim(),
      supplierId:         supplierSelect.value,
      warehouseQuantities: qtysInput.value.split(',').map(q => parseInt(q.trim(), 10)),
      price:              parseFloat(priceInput.value),
      reviews:            [],
      specs:              parseSpecs(specsInput.value),
    };

    productList = [...productList, newProduct];
    saveProducts(productList);
    renderProducts();
    form.reset();
  });
});
