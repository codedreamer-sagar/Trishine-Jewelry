(() => {
  const KEY = "trishineWishlist";
  const CART_KEY = "trishineCart";
  const readList = key => { try { const value=JSON.parse(localStorage.getItem(key)||"[]"); return Array.isArray(value)?value:[]; } catch { return []; } };
  const save = items => { localStorage.setItem(KEY,JSON.stringify(items)); paintWishlist(); paintHeartStates(); };
  const safe = value => String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const money = amount => "₹"+Math.round(amount).toLocaleString("en-IN");
  const slug = name => String(name).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

  function cardProduct(card) {
    const shop = card.classList.contains("shop-product-card");
    const name = card.querySelector(shop?".shop-product-info h3":".product-details h3")?.textContent.trim().replace(/\s+/g," ");
    const image = card.querySelector(shop?".shop-product-image img":".product-image img")?.getAttribute("src");
    const priceText = card.querySelector(shop?".shop-product-price span":".product-price .new-price")?.textContent;
    const price = Number(card.dataset.price || String(priceText||"").replace(/[^\d]/g,""));
    const category = card.querySelector(shop?".shop-product-category":".product-category")?.textContent.trim().replace(/\s+/g," ") || "Jewellery";
    if (!name || !image || !price) return null;
    return {id:slug(name),name,image,price,category};
  }
  function heartButtons() {
    return [...document.querySelectorAll(".shop-wishlist-btn, .product-icons a")].filter(button => button.matches(".shop-wishlist-btn") || button.querySelector(".fa-heart"));
  }
  function paintHeartStates() {
    const saved=new Set(readList(KEY).map(item=>item.id));
    heartButtons().forEach(button=>{
      const card=button.closest(".shop-product-card,.arrival-card"), product=card&&cardProduct(card);
      if(!product)return;
      const active=saved.has(product.id), icon=button.querySelector("i");
      button.classList.toggle("is-saved",active);
      button.setAttribute("aria-label",active?"Remove from wishlist":"Add to wishlist");
      if(icon){icon.classList.toggle("fa-solid",active);icon.classList.toggle("fa-regular",!active);}
    });
  }
  function paintBadge(items) {
    document.querySelectorAll('.nav-icons a[href="wishlist.html"]').forEach(link=>{
      let badge=link.querySelector(".wishlist-count-badge");
      if(!badge){badge=document.createElement("span");badge.className="wishlist-count-badge";link.appendChild(badge);}
      badge.textContent=items.length;badge.hidden=!items.length;
      link.setAttribute("aria-label",`Wishlist, ${items.length} saved ${items.length===1?"item":"items"}`);
    });
  }
  function paintCartBadge() {
    const count=readList(CART_KEY).reduce((sum,item)=>sum+Number(item.quantity||0),0);
    document.querySelectorAll('.nav-icons a[href="cart.html"]').forEach(link=>{
      let badge=link.querySelector(".cart-count-badge");
      if(!badge){badge=document.createElement("span");badge.className="cart-count-badge";link.appendChild(badge);}
      badge.textContent=count;badge.hidden=!count;
    });
  }  function paintWishlist() {
    const items=readList(KEY);paintBadge(items);paintCartBadge();
    const list=document.getElementById("wishlist-items");
    if(!list)return;
    const subtotal=items.reduce((sum,item)=>sum+Number(item.price||0),0);
    document.getElementById("wishlist-count").textContent=`(${items.length})`;
    document.getElementById("wishlist-summary-count").textContent=items.length;
    document.getElementById("wishlist-subtotal").textContent=money(subtotal);
    document.getElementById("wishlist-buy-now").disabled=!items.length;
    document.getElementById("wishlist-add-all").disabled=!items.length;
    if(!items.length){list.innerHTML='<div class="wishlist-empty"><i class="fa-regular fa-heart" aria-hidden="true"></i><h3>Your wishlist is waiting</h3><p>Tap the heart on anything you love and it will be saved here.</p><a href="shop.html">Explore the collection</a></div>';return;}
    list.innerHTML=items.map((item,index)=>`<article class="wishlist-item" data-index="${index}"><img class="wishlist-item-image" src="${safe(item.image)}" alt="${safe(item.name)}" loading="lazy"><div class="wishlist-item-info"><span class="wishlist-category">${safe(item.category)}</span><h3>${safe(item.name)}</h3><p>Saved for whenever you’re ready.</p><div class="wishlist-item-actions"><button type="button" class="wishlist-move-cart" data-wish-action="cart">Add to cart</button><button type="button" class="wishlist-remove" data-wish-action="remove">Remove</button></div></div><strong class="wishlist-item-price">${money(item.price)}</strong></article>`).join("");
  }
  function addItemsToCart(items) {
    const cart=readList(CART_KEY);
    items.forEach(item=>{const existing=cart.find(entry=>entry.id===item.id);if(existing)existing.quantity=Number(existing.quantity||1)+1;else cart.push({...item,quantity:1});});
    localStorage.setItem(CART_KEY,JSON.stringify(cart));paintCartBadge();
  }
  function toggleProduct(button) {
    const card=button.closest(".shop-product-card,.arrival-card"),product=card&&cardProduct(card);if(!product)return;
    const items=readList(KEY),index=items.findIndex(item=>item.id===product.id);
    if(index>=0)items.splice(index,1);else items.push(product);
    save(items);
  }

  document.addEventListener("click",event=>{
    const heart=event.target.closest(".shop-wishlist-btn, .product-icons a");
    if(heart&&(heart.matches(".shop-wishlist-btn")||heart.querySelector(".fa-heart"))){event.preventDefault();toggleProduct(heart);return;}
    const action=event.target.closest("[data-wish-action]");
    if(action){const row=action.closest(".wishlist-item"),items=readList(KEY),index=Number(row?.dataset.index);if(!items[index])return;if(action.dataset.wishAction==="remove")items.splice(index,1);else{addItemsToCart([items[index]]);items.splice(index,1);}save(items);return;}
    if(event.target.closest("#wishlist-add-all")){const items=readList(KEY);if(items.length){addItemsToCart(items);localStorage.setItem("trishineWishlist",JSON.stringify([]));paintWishlist();paintHeartStates();const button=document.getElementById("wishlist-add-all");button.innerHTML='<i class="fa-solid fa-check"></i> Added to cart';window.setTimeout(()=>{button.innerHTML='<i class="fa-solid fa-bag-shopping"></i> Add all to cart';button.disabled=!readList(KEY).length;},1400);}return;}
    if(event.target.closest("#wishlist-buy-now")){const items=readList(KEY);if(items.length){addItemsToCart(items);localStorage.setItem("trishineWishlist",JSON.stringify([]));window.location.href="checkout.html";}}
  });

  paintWishlist();paintHeartStates();
})();

