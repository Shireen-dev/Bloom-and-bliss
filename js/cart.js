const CART_KEY = "bloomAndBlissCart";

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
  renderCartDrawer();
}

function addToCart(productId, qty = 1) {
  const cart = readCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty });
  writeCart(cart);
  openCartDrawer();
  flashCartToggle();
}

function removeFromCart(productId) {
  writeCart(readCart().filter((item) => item.id !== productId));
}

function setCartQty(productId, qty) {
  let cart = readCart();
  if (qty <= 0) cart = cart.filter((item) => item.id !== productId);
  else {
    const existing = cart.find((item) => item.id === productId);
    if (existing) existing.qty = qty;
  }
  writeCart(cart);
}

function cartTotalCount() {
  return readCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartTotalPrice() {
  return readCart().reduce((sum, item) => {
    const product = getProductById(item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
}

function updateCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    const count = cartTotalCount();
    el.textContent = count;
    el.classList.toggle("is-visible", count > 0);
  });
}

function renderCartDrawer() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const emptyEl = document.getElementById("cartEmpty");
  if (!itemsEl) return;

  const cart = readCart();
  if (cart.length === 0) {
    itemsEl.innerHTML = "";
    if (emptyEl) emptyEl.hidden = false;
    if (totalEl) totalEl.textContent = formatPrice(0);
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  itemsEl.innerHTML = cart.map((item) => {
    const product = getProductById(item.id);
    if (!product) return "";
    return `
    <li class="cart-item" data-cart-item="${product.id}">
      <div class="cart-item__thumb"><img src="${product.image}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:6px;"></div>
      <div class="cart-item__info">
        <p class="cart-item__name">${product.name}</p>
        <p class="cart-item__price">${formatPrice(product.price)}</p>
        <div class="cart-item__qty">
          <button type="button" data-qty-down="${product.id}">&minus;</button>
          <span>${item.qty}</span>
          <button type="button" data-qty-up="${product.id}">&plus;</button>
        </div>
      </div>
      <button type="button" class="cart-item__remove" data-remove="${product.id}">&times;</button>
    </li>`;
  }).join("");

  if (totalEl) totalEl.textContent = formatPrice(cartTotalPrice());

  itemsEl.querySelectorAll("[data-qty-up]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.qtyUp);
      const item = readCart().find((i) => i.id === id);
      setCartQty(id, (item ? item.qty : 0) + 1);
    })
  );
  itemsEl.querySelectorAll("[data-qty-down]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.qtyDown);
      const item = readCart().find((i) => i.id === id);
      setCartQty(id, (item ? item.qty : 0) - 1);
    })
  );
  itemsEl.querySelectorAll("[data-remove]").forEach((btn) =>
    btn.addEventListener("click", () => removeFromCart(Number(btn.dataset.remove)))
  );
}

function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (!drawer) return;
  drawer.classList.add("is-open");
  if (overlay) overlay.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (!drawer) return;
  drawer.classList.remove("is-open");
  if (overlay) overlay.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
}

function flashCartToggle() {
  const toggle = document.getElementById("cartToggle");
  if (!toggle) return;
  toggle.classList.remove("cart-toggle--flash");
  void toggle.offsetWidth;
  toggle.classList.add("cart-toggle--flash");
}

function initCartUI() {
  const toggle = document.getElementById("cartToggle");
  const closeBtn = document.getElementById("cartClose");
  const overlay = document.getElementById("cartOverlay");
  if (toggle) toggle.addEventListener("click", openCartDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeCartDrawer);
  if (overlay) overlay.addEventListener("click", closeCartDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCartDrawer(); });
  updateCartCount();
  renderCartDrawer();
}

document.addEventListener("DOMContentLoaded", initCartUI);