async function apiRequest(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function readCart() {
  if (!getToken()) return [];
  const data = await apiRequest("/cart");
  return data.items.map((i) => ({ id: i.productId, qty: i.quantity }));
}

async function addToCart(productId, qty = 1) {
  if (!getToken()) {
    window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname.split("/").pop());
    return;
  }
  await apiRequest("/cart", { method: "POST", body: JSON.stringify({ productId, quantity: qty }) });
  await updateCartCount();
  await renderCartDrawer();
  openCartDrawer();
  flashCartToggle();
}

async function removeFromCart(productId) {
  await apiRequest(`/cart/${productId}`, { method: "DELETE" });
  await updateCartCount();
  await renderCartDrawer();
}

async function setCartQty(productId, qty) {
  await apiRequest(`/cart/${productId}`, { method: "PUT", body: JSON.stringify({ quantity: qty }) });
  await updateCartCount();
  await renderCartDrawer();
}

async function cartTotalCount() {
  const cart = await readCart();
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

async function cartTotalPrice() {
  const cart = await readCart();
  return cart.reduce((sum, item) => {
    const product = getProductById(item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
}

async function updateCartCount() {
  const count = await cartTotalCount();
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
    el.classList.toggle("is-visible", count > 0);
  });
}

async function renderCartDrawer() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const emptyEl = document.getElementById("cartEmpty");
  if (!itemsEl) return;

  const cart = await readCart();

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

  if (totalEl) totalEl.textContent = formatPrice(await cartTotalPrice());

  itemsEl.querySelectorAll("[data-qty-up]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.qtyUp);
      const cart = await readCart();
      const item = cart.find((i) => i.id === id);
      await setCartQty(id, (item ? item.qty : 0) + 1);
    })
  );
  itemsEl.querySelectorAll("[data-qty-down]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.qtyDown);
      const cart = await readCart();
      const item = cart.find((i) => i.id === id);
      await setCartQty(id, (item ? item.qty : 0) - 1);
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