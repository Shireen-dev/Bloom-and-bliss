function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("is-open"))
  );
}

function cardMarkup(product) {
  return `
  <article class="bouquet-card" data-category="${product.category}">
    <div class="bouquet-card__media">
      <img src="${product.image}" alt="${product.name} bouquet" loading="lazy">
    </div>
    <div class="bouquet-card__body">
      <p class="bouquet-card__category">${product.category}</p>
      <h3 class="bouquet-card__name">${product.name}</h3>
      <p class="bouquet-card__tagline">${product.tagline}</p>
      <p class="bouquet-card__price">${formatPrice(product.price)}</p>
      <div class="bouquet-card__actions">
        <a class="btn btn--outline btn--small" href="product.html?id=${product.id}">View Details</a>
        <button type="button" class="btn btn--primary btn--small" data-add-to-cart="${product.id}">Add to Cart</button>
      </div>
    </div>
  </article>`;
}

function bindAddToCartButtons(scope = document) {
  scope.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.addToCart), 1));
  });
}

function renderFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  grid.innerHTML = PRODUCTS.slice(0, 10).map(cardMarkup).join("");
  bindAddToCartButtons(grid);
}

function renderProductGrid() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const chips = document.querySelectorAll(".filter-chip");
  const draw = (category) => {
    const list = category === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
    grid.innerHTML = list.map(cardMarkup).join("");
    bindAddToCartButtons(grid);
  };
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      draw(chip.dataset.filter);
    });
  });
  draw("All");
}

function renderProductDetail() {
  const root = document.getElementById("productDetail");
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  const product = getProductById(params.get("id")) || PRODUCTS[0];
  document.title = `${product.name} — Bloom & Bliss`;

  root.innerHTML = `
    <div class="detail-media">
      <img src="${product.image}" alt="${product.name} bouquet" style="width:100%; height:100%; object-fit:cover; border-radius:14px;">
    </div>
    <div class="detail-info">
      <p class="detail-category">${product.category}</p>
      <h1>${product.name}</h1>
      <p class="detail-tagline">${product.tagline}</p>
      <p class="detail-price">${formatPrice(product.price)}</p>
      <p class="detail-description">${product.description}</p>
      <ul class="detail-facts">
        <li><strong>Stem count</strong>${product.stemCount}</li>
        <li><strong>Bouquet size</strong>${product.size}</li>
      </ul>
      <p class="qty-label" style="margin-bottom:8px;">What's inside</p>
      <div class="flower-tags">
        ${product.flowers.map((f) => `<span class="flower-tag">${f}</span>`).join("")}
      </div>
      <div class="qty-row">
        <span class="qty-label">Quantity</span>
        <div class="qty-control">
          <button type="button" id="qtyMinus">&minus;</button>
          <input type="number" id="qtyInput" value="1" min="1" max="20">
          <button type="button" id="qtyPlus">&plus;</button>
        </div>
      </div>
      <div class="detail-actions">
        <button type="button" class="btn btn--primary" id="detailAddToCart">Add to Cart</button>
        <a class="btn btn--outline" href="products.html">Back to Products</a>
      </div>
      <p class="add-confirm" id="addConfirm">Added to your cart.</p>
    </div>
  `;

  const qtyInput = document.getElementById("qtyInput");
  document.getElementById("qtyMinus").addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    qtyInput.value = Math.min(20, Number(qtyInput.value) + 1);
  });
  qtyInput.addEventListener("change", () => {
    qtyInput.value = Math.min(20, Math.max(1, Number(qtyInput.value) || 1));
  });

  document.getElementById("detailAddToCart").addEventListener("click", () => {
    addToCart(product.id, Number(qtyInput.value) || 1);
    const confirm = document.getElementById("addConfirm");
    confirm.classList.add("is-visible");
    setTimeout(() => confirm.classList.remove("is-visible"), 2200);
  });

  const relatedGrid = document.getElementById("relatedGrid");
  if (relatedGrid) {
    const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
    relatedGrid.innerHTML = (related.length ? related : PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3))
      .map(cardMarkup).join("");
    bindAddToCartButtons(relatedGrid);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  renderFeatured();
  renderProductGrid();
  renderProductDetail();
});