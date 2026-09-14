let PRODUCTS = [];

async function fetchProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  const data = await res.json();
  PRODUCTS = data.products;
  return PRODUCTS;
}

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === Number(id));
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}