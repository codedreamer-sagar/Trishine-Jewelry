(() => {
  const KEY = "trishineCart";
  const FREE_SHIPPING = 1999;
  const readCart = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(value) ? value.filter(item => item && item.id && item.name) : [];
    } catch { return []; }
  };
  const saveCart = cart => {
    localStorage.setItem(KEY, JSON.stringify(cart));
    updateBadge(cart);
    renderCart(cart);
  };
  const money = value => "₹" + Math.round(value).toLocaleString("en-IN");
  const updateBadge = cart => {
    const links = document.querySelectorAll('.nav-icons a[href="cart.html"]');
    const count = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    links.forEach(link => {
      let badge = link.querySelector(".cart-count-badge");
      if (!badge) { badge = document.createElement("span"); badge.className = "cart-count-badge"; link.appendChild(badge); }
      badge.textContent = count;
      badge.hidden = count === 0;
      link.setAttribute("aria-label", `Shopping cart, ${count} ${count === 1 ? "item" : "items"}`);
    });
  };
  const renderCart = cart => {
    const list = document.getElementById("cart-items");
    if (!list) return;
    const countNode = document.getElementById("cart-item-count");
    const subtotalNode = document.getElementById("cart-subtotal");
    const totalNode = document.getElementById("cart-total");
    const shippingNode = document.getElementById("cart-shipping");
    const note = document.getElementById("shipping-note");
    const itemCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    countNode.textContent = `(${itemCount})`;
    subtotalNode.textContent = money(subtotal);
    totalNode.textContent = money(subtotal);
    shippingNode.textContent = subtotal >= FREE_SHIPPING ? "Free" : (subtotal ? "Calculated at checkout" : "—");
    note.textContent = subtotal >= FREE_SHIPPING ? "Lovely choice! Your order qualifies for free shipping." : subtotal ? `Add ${money(FREE_SHIPPING - subtotal)} more for free shipping.` : "Free shipping on orders above ₹1,999.";
    if (!cart.length) {
      list.innerHTML = '<div class="cart-empty"><i class="fa-solid fa-bag-shopping" aria-hidden="true"></i><h3>Your cart is waiting to be filled</h3><p>Find something special and it will appear here.</p><a href="shop.html">Explore the collection</a></div>';
      return;
    }
    list.innerHTML = cart.map((item, index) => `
      <article class="cart-row" data-index="${index}">
        <img class="cart-product-image" src="${escapeAttribute(item.image || "images/products/ring1.jpg")}" alt="${escapeAttribute(item.name)}" loading="lazy">
        <div class="cart-product-info">
          <span class="cart-product-category">${escapeHtml(item.category || "Jewellery")}</span>
          <h3>${escapeHtml(item.name)}</h3>
          <p>Ready to make your day shine</p>
          <div class="cart-row-actions">
            <div class="quantity-control" aria-label="Quantity for ${escapeAttribute(item.name)}"><button type="button" data-action="decrease" aria-label="Decrease quantity">−</button><output>${Number(item.quantity) || 1}</output><button type="button" data-action="increase" aria-label="Increase quantity">+</button></div>
            <button class="remove-item" type="button" data-action="remove">Remove</button>
          </div>
        </div>
        <strong class="cart-row-price">${money(Number(item.price) * Number(item.quantity))}</strong>
      </article>`).join("");
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  const escapeAttribute = escapeHtml;

  document.addEventListener("click", event => {
    const addButton = event.target.closest(".add-cart");
    if (addButton) {
      const card = addButton.closest(".shop-product-card");
      if (!card) return;
      const name = card.querySelector(".shop-product-info h3")?.textContent.trim();
      const price = Number(card.dataset.price || card.querySelector(".shop-product-price span")?.textContent.replace(/[^\d]/g, ""));
      const image = card.querySelector(".shop-product-image img")?.getAttribute("src");
      if (!name || !price) return;
      const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`;
      const cart = readCart();
      const existing = cart.find(item => item.id === id);
      if (existing) existing.quantity = Number(existing.quantity || 1) + 1;
      else cart.push({ id, name, price, image, category: card.dataset.category || "Jewellery", quantity: 1 });
      saveCart(cart);
      const original = addButton.innerHTML;
      addButton.innerHTML = '<i class="fa-solid fa-check"></i> Added';
      window.setTimeout(() => { addButton.innerHTML = original; }, 1200);
      return;
    }
    const action = event.target.closest("[data-action]");
    if (!action) return;
    const row = action.closest(".cart-row");
    if (!row) return;
    const cart = readCart();
    const index = Number(row.dataset.index);
    if (!cart[index]) return;
    if (action.dataset.action === "remove") cart.splice(index, 1);
    else if (action.dataset.action === "increase") cart[index].quantity = Number(cart[index].quantity || 1) + 1;
    else if (action.dataset.action === "decrease") {
      cart[index].quantity = Number(cart[index].quantity || 1) - 1;
      if (cart[index].quantity <= 0) cart.splice(index, 1);
    }
    saveCart(cart);
  });
  const cart = readCart();
  updateBadge(cart);
  renderCart(cart);
})();
