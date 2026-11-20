(() => {
  const PRODUCTS = [
    {name:"Golden Elegance Ring",category:"Rings",price:1499,image:"images/products/ring1.jpg"},
    {name:"Royal Pearl Necklace",category:"Necklaces",price:2499,image:"images/products/necklace1.jpg"},
    {name:"Crystal Drop Earrings",category:"Earrings",price:999,image:"images/products/earrings1.jpg"},
    {name:"Golden Charm Bracelet",category:"Bracelets",price:1799,image:"images/products/bracelet1.jpg"},
    {name:"Classic Diamond Ring",category:"Rings",price:1899,image:"images/products/ring2.jpg"},
    {name:"Emerald Grace Necklace",category:"Necklaces",price:2199,image:"images/products/necklace2.jpg"},
    {name:"Golden Pearl Earrings",category:"Earrings",price:1299,image:"images/products/earrings2.jpg"},
    {name:"Luxury Link Bracelet",category:"Bracelets",price:1599,image:"images/products/bracelet2.jpg"}
  ];
  const money = value => "₹" + Number(value).toLocaleString("en-IN");
  const norm = value => String(value||"").toLowerCase().trim().replace(/[^a-z0-9₹ ]/g," ").replace(/\s+/g," ");
  const safe = value => String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const overlay=document.createElement("div");overlay.className="search-overlay";overlay.innerHTML='<section class="search-dialog" role="dialog" aria-modal="true" aria-label="Search jewellery"><div class="search-dialog-head"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="site-search-input" placeholder="Search rings, necklaces, earrings…" autocomplete="off" aria-label="Search jewellery"><button class="search-close" type="button" aria-label="Close search"><i class="fa-solid fa-xmark"></i></button></div><div class="search-content"><p class="search-caption" id="search-caption">Popular right now</p><div class="search-suggestions" id="search-suggestions"></div><a href="shop.html" class="search-view-all" id="search-view-all" hidden>See all matching products <i class="fa-solid fa-arrow-right"></i></a></div></section>';
  document.body.appendChild(overlay);
  const input=overlay.querySelector("#site-search-input"), suggestions=overlay.querySelector("#search-suggestions"), caption=overlay.querySelector("#search-caption"), viewAll=overlay.querySelector("#search-view-all");
  const open=()=>{overlay.classList.add("is-open");document.body.classList.add("search-open");input.value="";render("");window.setTimeout(()=>input.focus(),40);};
  const close=()=>{overlay.classList.remove("is-open");document.body.classList.remove("search-open");};
  function matches(query){
    const q=norm(query);if(!q)return PRODUCTS.slice(0,4);
    const terms=q.split(" ").filter(Boolean);
    return PRODUCTS.map(product=>{const text=norm(`${product.name} ${product.category} jewellery`);let score=0;terms.forEach(term=>{if(text.includes(term))score+=term.length>3?3:2;if(norm(product.name).startsWith(term))score+=2;if(String(product.price)===term)score+=5;});return {product,score};}).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.product.name.localeCompare(b.product.name)).map(item=>item.product);
  }
  function render(query){
    const q=query.trim(),results=matches(q);caption.textContent=q?`${results.length} ${results.length===1?"matching item":"matching items"}`:"Popular right now";
    viewAll.hidden=!q;
    if(q)viewAll.href=`shop.html?search=${encodeURIComponent(q)}`;
    if(!results.length){suggestions.innerHTML='<div class="search-empty">No matching jewellery found. Try “ring”, “gold”, “necklace” or “earrings”.</div>';return;}
    suggestions.innerHTML=results.slice(0,6).map(product=>`<a class="search-suggestion" href="shop.html?search=${encodeURIComponent(q||product.name)}#product-${encodeURIComponent(product.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"))}"><img src="${safe(product.image)}" alt=""><span class="search-suggestion-copy"><strong>${safe(product.name)}</strong><small>${safe(product.category)}</small></span><span class="search-suggestion-price">${money(product.price)}</span></a>`).join("");
  }
  function applyShopSearch(query, targetId){
    const cards=[...document.querySelectorAll(".shop-product-card")];if(!cards.length)return false;
    const q=norm(query), terms=q.split(" ").filter(Boolean);let shown=[];
    cards.forEach(card=>{
      const name=card.querySelector(".shop-product-info h3")?.textContent||"",category=card.querySelector(".shop-product-category")?.textContent||"",hay=norm(`${name} ${category} jewellery`);
      const isMatch=!q||terms.every(term=>hay.includes(term)||String(card.dataset.price||"").includes(term.replace(/[^\d]/g,"")));
      card.hidden=!isMatch;card.style.display=isMatch?"":"none";if(isMatch){const id=`product-${name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`;card.id=id;shown.push(card);}
    });
    const grid=cards[0].parentElement;let status=document.getElementById("shop-search-status");
    if(!status){status=document.createElement("div");status.className="shop-search-status";status.id="shop-search-status";grid.parentElement.insertBefore(status,grid);}
    status.innerHTML=`<span>${shown.length?`Showing ${shown.length} result${shown.length===1?"":"s"} for “${safe(query)}”`:`No products found for “${safe(query)}”`}</span><button type="button" id="clear-shop-search">Clear search</button>`;
    if(targetId){const target=document.getElementById(decodeURIComponent(targetId));if(target){target.classList.add("search-highlight");window.setTimeout(()=>target.scrollIntoView({behavior:"smooth",block:"center"}),250);window.setTimeout(()=>target.classList.remove("search-highlight"),1800);}else if(shown[0])shown[0].scrollIntoView({behavior:"smooth",block:"center"});}
    return true;
  }
  function submit(){const query=input.value.trim();if(!query)return;close();if(!applyShopSearch(query)){window.location.href=`shop.html?search=${encodeURIComponent(query)}`;}else{const url=new URL(window.location.href);url.searchParams.set("search",query);history.replaceState({},"",url);}}
  document.addEventListener("click",event=>{
    const trigger=event.target.closest('.nav-icons a');
    if(trigger&&trigger.querySelector('.fa-magnifying-glass')){event.preventDefault();open();return;}
    if(event.target.closest(".search-close")){close();return;}
    if(event.target===overlay){close();return;}
    if(event.target.closest("#search-view-all")){event.preventDefault();submit();return;}
    if(event.target.closest("#clear-shop-search")){const cards=[...document.querySelectorAll(".shop-product-card")];cards.forEach(card=>{card.hidden=false;card.style.display="";});document.getElementById("shop-search-status")?.remove();const url=new URL(location.href);url.searchParams.delete("search");history.replaceState({},"",url);return;}
  });
  input.addEventListener("input",()=>render(input.value));
  input.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();submit();}if(event.key==="Escape")close();});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&overlay.classList.contains("is-open"))close();});
  render("");
  const params=new URLSearchParams(location.search),query=params.get("search");
  if(query&&document.querySelector(".shop-product-card"))applyShopSearch(query,location.hash.slice(1));
})();
