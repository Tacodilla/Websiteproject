/* ====== Data (Celtic Moon Studios) ====== */
const PRODUCTS = [
  {
    id: "knot-bracelet",
    name: "Knotwork Cuff Bracelet",
    price: 64,
    img: "https://images.unsplash.com/photo-1603565816278-c5b6b9960f23?q=80&w=1200",
    href: "payment.html",
  },
  {
    id: "moon-pendant",
    name: "Lunar Pendant Necklace",
    price: 74,
    img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200",
  },
  {
    id: "braid-ring",
    name: "Braided Band Ring",
    price: 52,
    img: "https://images.unsplash.com/photo-1520962918287-7448c2878f65?q=80&w=1200",
  },
  {
    id: "emerald-drops",
    name: "Emerald Drop Earrings",
    price: 58,
    img: "https://images.unsplash.com/photo-1520962722030-7f2a1b88b4f2?q=80&w=1200",
  },
];

/* ====== Helpers ====== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const money = (n) => `$${n.toFixed(2)}`;

/* ====== Render Products ====== */
function renderProducts(list) {
  const grid = $("#grid");
  if (!grid) return;
  grid.innerHTML = "";
  list.forEach((p) => {
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <img class="card-img" src="${p.img}" alt="${p.name}">
      <div class="card-body">
        <div class="card-title">${p.name}</div>
        <div class="card-price">${money(p.price)}</div>
      </div>
      <div class="card-actions">
        <div class="qty-pill" data-id="${p.id}">
          <button class="qty-minus" aria-label="Decrease quantity">−</button>
          <span class="qty" aria-live="polite">1</span>
          <button class="qty-plus" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn-primary add-btn" data-id="${p.id}">Add to Cart</button>
      </div>
    `;
    grid.appendChild(el);
  });
}

/* ====== Sorting & Search ====== */
function sortProducts(mode) {
  const arr = [...PRODUCTS];
  switch (mode) {
    case "price-asc": arr.sort((a,b)=>a.price-b.price); break;
    case "price-desc": arr.sort((a,b)=>b.price-a.price); break;
    case "name-asc": arr.sort((a,b)=>a.name.localeCompare(b.name)); break;
    default: /* featured */ break;
  }
  renderProducts(arr);
}
function filterBySearch() {
  const q = $("#search-input")?.value.trim().toLowerCase() || "";
  const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
  renderProducts(filtered);
}

/* ====== Cart State (persisted) ====== */
const CART_KEY = "cms_cart_v1";
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch(e){ cart = []; }

function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function cartCount(){ return cart.reduce((n,it)=>n+it.qty,0); }
function subtotal(){ return cart.reduce((s,it)=>s + it.qty*it.price, 0); }
function updateBadge(){ const el=$("#cart-count"); if(el) el.textContent = cartCount(); }

/* ====== Cart Drawer ====== */
const drawer = $("#cart-drawer");
const backdrop = $("#cart-backdrop");
const cartBtn = $("#cart-btn");
const cartClose = $("#cart-close");
const cartItemsEl = $("#cart-items");
const subtotalEl = $("#cart-subtotal");

function openCart(){
  drawer?.classList.add("open");
  cartBtn?.setAttribute("aria-expanded","true");
  if (backdrop) backdrop.hidden = false;
}
function closeCart(){
  drawer?.classList.remove("open");
  cartBtn?.setAttribute("aria-expanded","false");
  if (backdrop) backdrop.hidden = true;
}
cartBtn?.addEventListener("click", openCart);
cartClose?.addEventListener("click", closeCart);
backdrop?.addEventListener("click", closeCart);
window.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeCart(); });

function renderCart(){
  if(!cartItemsEl) return;
  cartItemsEl.innerHTML = "";
  if(cart.length === 0){
    cartItemsEl.innerHTML = `<p>Your cart is empty.</p>`;
  } else {
    cart.forEach(item=>{
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div>
          <div class="title">${item.name}</div>
          <div class="price">${money(item.price)}</div>
          <div class="counter" data-id="${item.id}">
            <button class="dec" aria-label="Decrease">−</button>
            <span aria-live="polite">${item.qty}</span>
            <button class="inc" aria-label="Increase">+</button>
            <button class="remove" aria-label="Remove item" style="margin-left:.5rem">Remove</button>
          </div>
        </div>
        <div><strong>${money(item.qty*item.price)}</strong></div>
      `;
      cartItemsEl.appendChild(row);
    });
  }
  if(subtotalEl) subtotalEl.textContent = money(subtotal());
  updateBadge();
}

/* ====== Quantity & Add to Cart ====== */
document.addEventListener("click", (e)=>{
  // change qty on product card
  if(e.target.matches(".qty-plus,.qty-minus")){
    const pill = e.target.closest(".qty-pill");
    const qtyEl = pill.querySelector(".qty");
    let q = parseInt(qtyEl.textContent,10);
    q = e.target.matches(".qty-plus") ? q+1 : Math.max(1, q-1);
    qtyEl.textContent = q;
  }

  // add to cart
  if(e.target.matches(".add-btn")){
    const id = e.target.dataset.id;
    const card = e.target.closest(".card");
    const qty = parseInt(card.querySelector(".qty").textContent,10);
    const p = PRODUCTS.find(x=>x.id===id);
    const existing = cart.find(x=>x.id===id);
    if(existing){ existing.qty += qty; }
    else { cart.push({ id:p.id, name:p.name, price:p.price, img:p.img, qty }); }
    saveCart(); renderCart(); openCart();
  }

  // cart controls
  if(e.target.matches(".counter .inc,.counter .dec,.counter .remove")){
    const id = e.target.closest(".counter").dataset.id;
    const it = cart.find(x=>x.id===id);
    if(!it) return;

    if(e.target.matches(".inc")) it.qty += 1;
    if(e.target.matches(".dec")) it.qty = Math.max(1, it.qty-1);
    if(e.target.matches(".remove")) cart = cart.filter(x=>x.id!==id);

    saveCart(); renderCart();
  }
});

/* ====== Sorting & Search events ====== */
$("#sort")?.addEventListener("change", (e)=>sortProducts(e.target.value));
$(".search")?.addEventListener("submit",(e)=>{ e.preventDefault(); filterBySearch(); });
$("#search-input")?.addEventListener("input", filterBySearch);

/* ====== Nav interactions ====== */
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#nav-primary");
navToggle?.addEventListener("click", ()=>{
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
});
const megaToggle = document.querySelector(".has-mega > .nav-link");
if(megaToggle){
  megaToggle.addEventListener("click", ()=>{
    const li = megaToggle.parentElement;
    const expanded = li.getAttribute("aria-expanded")==="true";
    li.setAttribute("aria-expanded", expanded ? "false" : "true");
  });
}

/* ====== Init ====== */
renderProducts(PRODUCTS);
renderCart();
sortProducts("featured");
updateBadge();
