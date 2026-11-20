(() => {
  const USERS_KEY = "trishineDemoAccounts";
  const SESSION_KEY = "trishineDemoSession";
  const $ = selector => document.querySelector(selector);
  const read = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const normalizeEmail = email => String(email || "").trim().toLowerCase();
  const escapeHTML = text => String(text || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

  async function hashPassword(password, salt) {
    const input = `${salt}:${password}`;
    if (window.crypto && window.crypto.subtle) {
      const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
      return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
    }
    // Local file previews may not expose Web Crypto. Keep the demo usable without saving a plain password.
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) { hash ^= input.charCodeAt(i); hash = Math.imul(hash, 16777619); }
    return `preview-${(hash >>> 0).toString(16)}`;
  }
  const getUser = () => {
    const email = normalizeEmail(localStorage.getItem(SESSION_KEY));
    if (!email) return null;
    const users = read(USERS_KEY, []);
    return users.find(user => user.email === email) || null;
  };
  const showModal = id => { const modal = document.getElementById(id); if (modal) { modal.hidden = false; document.body.classList.add("modal-open"); modal.querySelector("input,button")?.focus(); } };
  const hideModal = el => { const modal = typeof el === "string" ? document.getElementById(el) : el; if (modal) modal.hidden = true; if (!document.querySelector(".auth-backdrop:not([hidden]),.simple-modal-backdrop:not([hidden])")) document.body.classList.remove("modal-open"); };

  function setPanel(panel) {
    document.querySelectorAll(".account-panel").forEach(node => node.classList.toggle("active", node.id === `panel-${panel}`));
    document.querySelectorAll(".account-side-link[data-panel]").forEach(node => node.classList.toggle("active", node.dataset.panel === panel));
  }
  function updateNav(user) {
    document.querySelectorAll('.nav-icons a[href="login.html"]').forEach(link => {
      if (!user) { link.innerHTML = '<i class="fa-regular fa-user"></i>'; link.setAttribute("aria-label", "Log in or create an account"); return; }
      link.innerHTML = `<i class="fa-regular fa-user"></i><span class="nav-greeting">Hey, ${escapeHTML(user.name.split(/\s+/)[0])}</span>`;
      link.setAttribute("aria-label", `Hey ${user.name}, your account`);
    });
  }
  function updateAccount(user) {
    if (!$("#welcome-title")) { updateNav(user); return; }
    const dashboard = $("#account-dashboard"), backdrop = $("#auth-backdrop");
    if (!user) {
      if (dashboard) dashboard.hidden = true;
      if (backdrop) backdrop.hidden = false;
      $("#welcome-title").textContent = "Your account, your way.";
      $("#welcome-copy").textContent = "Sign in to see your orders, manage your profile and save your favourites.";
      updateNav(null);
      return;
    }
    if (backdrop) backdrop.hidden = true;
    if (dashboard) dashboard.hidden = false;
    $("#welcome-title").textContent = `Hey ${user.name.split(/\s+/)[0]}, welcome back.`;
    $("#welcome-copy").textContent = "Your TRISHINE account is ready whenever you are.";
    $("#identity-name").textContent = user.name;
    $("#identity-email").textContent = user.email;
    $("#identity-avatar").textContent = user.name.trim().charAt(0).toUpperCase() || "T";
    $("#profile-name").textContent = user.name;
    $("#profile-email").textContent = user.email;
    $("#profile-phone").textContent = user.phone || "Add a phone number";
    const address = user.address;
    $("#saved-address").textContent = address && address.line ? [address.line,address.city,address.state,address.pin].filter(Boolean).join(", ") : "Add an address for a smoother checkout.";
    const orders = read("trishineOrders", []);
    $("#order-summary-text").textContent = orders.length ? `${orders.length} order${orders.length === 1 ? "" : "s"} in your account.` : "Your placed orders will appear here.";
    const orderList = $("#orders-list");
    if (orderList && orders.length) orderList.innerHTML = orders.map(order => `<article class="account-card order-entry"><h3>Order ${escapeHTML(order.id || "TRISHINE")}</h3><p>${escapeHTML(order.date || "Recently placed")} · ${escapeHTML(order.status || "Processing")}</p><strong>${escapeHTML(order.total || "")}</strong></article>`).join("");
    const pref = localStorage.getItem("trishineLanguage");
    if (pref && $("#language-select")) $("#language-select").value = pref;
    updateNav(user);
  }
  function setAuthTab(tab) {
    document.querySelectorAll(".auth-tab").forEach(button => { const active = button.dataset.authTab === tab; button.classList.toggle("active", active); button.setAttribute("aria-selected", String(active)); });
    document.querySelectorAll(".auth-form").forEach(form => { const active = form.id === `${tab}-form`; form.classList.toggle("active", active); form.hidden = !active; });
    $("#auth-title").textContent = tab === "login" ? "A little more sparkle." : "Join the TRISHINE Club.";
  }
  function refresh() { updateAccount(getUser()); }

  document.querySelectorAll("[data-auth-tab]").forEach(button => button.addEventListener("click", () => setAuthTab(button.dataset.authTab)));
  $("#login-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, email = normalizeEmail(form.elements.email.value), password = form.elements.password.value;
    const user = read(USERS_KEY, []).find(entry => entry.email === email);
    const error = $("#login-error");
    if (!user || await hashPassword(password, user.salt) !== user.passwordHash) { error.textContent = "We could not match those details. Check them or create an account."; return; }
    localStorage.setItem(SESSION_KEY, email); form.reset(); error.textContent = ""; refresh();
  });
  $("#signup-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, name = form.elements.name.value.trim(), email = normalizeEmail(form.elements.email.value), password = form.elements.password.value;
    const users = read(USERS_KEY, []), error = $("#signup-error");
    if (users.some(user => user.email === email)) { error.textContent = "An account with this email already exists. Please log in."; return; }
    const salt = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    users.push({name,email,salt,passwordHash:await hashPassword(password,salt),phone:"",address:{}});
    write(USERS_KEY, users); localStorage.setItem(SESSION_KEY, email); form.reset(); error.textContent = ""; refresh();
  });

  document.querySelectorAll(".account-side-link[data-panel]").forEach(button => button.addEventListener("click", () => setPanel(button.dataset.panel)));
  document.querySelectorAll("[data-go-panel]").forEach(link => link.addEventListener("click", event => { event.preventDefault(); setPanel(link.dataset.goPanel); }));
  $("#logout-button")?.addEventListener("click", () => { localStorage.removeItem(SESSION_KEY); refresh(); setAuthTab("login"); });
  document.querySelectorAll("[data-open-modal]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.openModal, user = getUser();
    if (id === "profile-modal" && user) { const form = $("#profile-form"); form.elements.name.value=user.name; form.elements.email.value=user.email; form.elements.phone.value=user.phone || ""; }
    if (id === "address-modal" && user) { const form=$("#address-form"), a=user.address||{}; form.elements.line.value=a.line||""; form.elements.city.value=a.city||""; form.elements.pin.value=a.pin||""; form.elements.state.value=a.state||""; }
    showModal(id);
  }));
  $("#profile-form")?.addEventListener("submit", event => {
    event.preventDefault(); const form=event.currentTarget, users=read(USERS_KEY,[]), old=getUser(); if(!old)return;
    const email=normalizeEmail(form.elements.email.value), duplicate=users.some(user=>user.email===email && user.email!==old.email);
    if(duplicate){alert("That email address is already used by another account.");return;}
    const user=users.find(entry=>entry.email===old.email); user.name=form.elements.name.value.trim(); user.phone=form.elements.phone.value.trim(); user.email=email;
    write(USERS_KEY,users); localStorage.setItem(SESSION_KEY,email); hideModal("profile-modal"); refresh();
  });
  $("#address-form")?.addEventListener("submit", event => {
    event.preventDefault(); const form=event.currentTarget, users=read(USERS_KEY,[]), user=getUser(); if(!user)return;
    const stored=users.find(entry=>entry.email===user.email); stored.address={line:form.elements.line.value.trim(),city:form.elements.city.value.trim(),pin:form.elements.pin.value.trim(),state:form.elements.state.value.trim()};
    write(USERS_KEY,users); hideModal("address-modal"); refresh();
  });
  $("#language-select")?.addEventListener("change", event => localStorage.setItem("trishineLanguage", event.target.value));

  document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", () => hideModal(button.closest(".auth-backdrop,.simple-modal-backdrop"))));
  document.querySelectorAll(".auth-backdrop,.simple-modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", event => { if(event.target===backdrop && backdrop.id!=="auth-backdrop") hideModal(backdrop); }));
  document.addEventListener("keydown", event => { if(event.key==="Escape") document.querySelectorAll(".simple-modal-backdrop:not([hidden])").forEach(hideModal); });

  const infoTitle=$("#info-title"), infoContent=$("#info-content");
  document.querySelector('a[href="#faq"]')?.addEventListener("click", event => { event.preventDefault(); infoTitle.textContent="Frequently asked questions"; infoContent.innerHTML='<details open><summary>How can I track an order?</summary><p>Order updates appear in My Orders after checkout has been connected.</p></details><details><summary>How do returns work?</summary><p>TRISHINE advertises a 7 day return policy. Contact our team to begin a return.</p></details><details><summary>How do I update my details?</summary><p>Use Edit profile or Edit address in your account overview.</p></details>'; showModal("info-modal"); });
  document.querySelector('a[href="#terms"]')?.addEventListener("click", event => { event.preventDefault(); infoTitle.textContent="Terms & privacy"; infoContent.innerHTML='<p>This page is a front-end preview. Account details are stored in this browser and are not synced with a server.</p><p>Do not use a password you use for another service. A production store needs a secure authentication and payment service before collecting real customer data.</p><p>For store policies, contact TRISHINE through the Contact page.</p>'; showModal("info-modal"); });

  const chat=$("#support-chat");
  const openChat=()=>{if(chat)chat.hidden=false;$("#chat-input")?.focus();};
  $("#open-chat")?.addEventListener("click",openChat); document.querySelector('[data-panel="help"]')?.addEventListener("dblclick",openChat);
  $("#close-chat")?.addEventListener("click",()=>{chat.hidden=true;});
  $("#chat-form")?.addEventListener("submit",event=>{event.preventDefault();const input=$("#chat-input"),value=input.value.trim();if(!value)return;const message=document.createElement("div");message.className="customer-message";message.textContent=value;$("#chat-messages").append(message);input.value="";const note=document.createElement("div");note.className="support-message";note.textContent="Your message is visible in this chat on this device. For a team reply, please use the Contact page; live support is not connected yet.";$("#chat-messages").append(note);$("#chat-messages").scrollTop=$("#chat-messages").scrollHeight;});

  refresh();
  if (!getUser()) setAuthTab("login");
})();





