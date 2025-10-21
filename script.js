/* Flipkart Pro — animated edition (client-side) */
(() => {
  /* ---------- sample product data ---------- */
  const PRODUCTS = [
    { id:'p1', title:'Smartphone XL 6.8"', category:'Smartphones', price:15999, rating:4.6, img:'./phone.jpeg' , desc:'Large OLED screen, long battery.'},
    { id:'p2', title:'Wireless Headphones Pro', category:'Audio', price:6999, rating:4.4, img:'./headphone.jpeg', desc:'Noise cancellation & comfy fit.'},
    { id:'p3', title:'Wearable Smartwatch X', category:'Wearables', price:8999, rating:4.2, img:'./watch.jpeg', desc:'Health tracking & quick notifications.'},
    { id:'p4', title:'Gaming Laptop 15"', category:'Laptops', price:55999, rating:4.8, img:'./game lap.jpeg', desc:'High FPS for gaming & dev.'},
    { id:'p5', title:'Bluetooth Speaker Mini', category:'Audio', price:1299, rating:4.1, img:'./speaker.jpeg', desc:'Pocket-size with strong bass.'},
    { id:'p6', title:'4K Action Camera', category:'Cameras', price:12999, rating:4.3, img:'./camera.jpeg', desc:'Waterproof & rugged.'},
    { id:'p7', title:'Office Laptop 14"', category:'Laptops', price:35999, rating:4.4, img:'./off lap.jpeg', desc:'Lightweight, long battery.'},
    { id:'p8', title:'Wireless Earbuds', category:'Audio', price:1999, rating:3.9, img:'./buds.jpeg', desc:'True wireless with charging case.'},
  ];

  /* ---------- DOM elements ---------- */
  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');
  const sortSelect = document.getElementById('sortSelect');
  const priceRange = document.getElementById('priceRange');
  const priceMaxLabel = document.getElementById('priceMaxLabel');
  const resultsCount = document.getElementById('resultsCount');
  const cartBtn = document.getElementById('cartBtn');
  const cartCount = document.getElementById('cartCount');
  const cartPanel = document.getElementById('cartPanel');
  const cartItemsDiv = document.getElementById('cartItems');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const closeCart = document.getElementById('closeCart');
  const clearCart = document.getElementById('clearCart');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const productModal = document.getElementById('productModal');
  const closeModal = document.getElementById('closeModal') || document.getElementById('closeModal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalPrice = document.getElementById('modalPrice');
  const modalRating = document.getElementById('modalRating');
  const modalAddToCart = document.getElementById('modalAddToCart');

  const themeToggle = document.getElementById('themeToggle');
  const catTabs = document.getElementById('catTabs');
  const yearEl = document.getElementById('year');
  yearEl.textContent = new Date().getFullYear();

  /* ---------- state ---------- */
  let state = {
    products: PRODUCTS.slice(),
    query: '',
    category: 'all',
    sort: 'popular',
    priceMax: parseInt(priceRange.value, 10),
    cart: JSON.parse(localStorage.getItem('gadgetzone-cart')) || {}
  };

  /* ---------- helpers ---------- */
  function formatINR(n){ return Number(n).toLocaleString('en-IN'); }
  function saveCart(){ localStorage.setItem('gadgetzone-cart', JSON.stringify(state.cart)); updateCartUI(); }
  function updateCartUI(){
    const items = Object.values(state.cart);
    let subtotal = 0;
    cartItemsDiv.innerHTML = '';
    if(items.length === 0){
      cartItemsDiv.innerHTML = '<div class="muted small">Your cart is empty</div>';
      cartCount.textContent = '0';
      cartSubtotal.textContent = '0';
      return;
    }
    items.forEach(it => {
      subtotal += it.price * it.qty;
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <img src="${it.img}" alt="${it.title}">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${it.title}</strong>
            <div>₹ ${formatINR(it.price)}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
            <button class="btn small ghost" data-action="dec" data-id="${it.id}">-</button>
            <div>${it.qty}</div>
            <button class="btn small ghost" data-action="inc" data-id="${it.id}">+</button>
            <button class="btn small" data-action="remove" data-id="${it.id}">Remove</button>
          </div>
        </div>
      `;
      cartItemsDiv.appendChild(el);
    });
    cartCount.textContent = items.reduce((s,i)=>s+i.qty,0);
    cartSubtotal.textContent = formatINR(subtotal);
  }

  /* ---------- render products ---------- */
  function getFilteredProducts(){
    const q = state.query.trim().toLowerCase();
    let list = state.products.filter(p => p.price <= state.priceMax);
    if(state.category !== 'all') list = list.filter(p => p.category === state.category);
    if(q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    if(state.sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
    if(state.sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
    if(state.sort === 'popular') list.sort((a,b)=>b.rating - a.rating);
    return list;
  }

  function createProductCard(p){
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('role','listitem');
    card.innerHTML = `
      <div class="imgwrap"><img src="${p.img}" alt="${p.title}" loading="lazy"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="product-title">${p.title}</div>
        <div class="tag">${p.category}</div>
      </div>
      <div class="product-meta">
        <div class="muted small">⭐ ${p.rating}</div>
        <div class="price">₹ ${formatINR(p.price)}</div>
      </div>
      <div style="display:flex;gap:10px;margin-top:8px;align-items:center">
        <button class="btn primary" data-action="add" data-id="${p.id}">Add to cart</button>
        <button class="btn ghost" data-action="view" data-id="${p.id}">Quick view</button>
      </div>
    `;
    return card;
  }

  function renderProducts(){
    const list = getFilteredProducts();
    productsGrid.innerHTML = '';
    resultsCount.textContent = `Showing ${list.length} items`;
    list.forEach((p, i) => {
      const card = createProductCard(p);
      card.style.opacity = 0;
      card.style.transform = 'translateY(12px)';
      productsGrid.appendChild(card);
      // staggered reveal
      setTimeout(()=> {
        card.style.transition = 'transform .45s cubic-bezier(.2,.9,.2,1), opacity .45s ease, box-shadow .45s';
        card.style.opacity = 1;
        card.style.transform = 'none';
      }, 80 * i);
    });
  }

  /* ---------- categories / UI populate ---------- */
  function populateCategories(){
    const cats = ['all', ...new Set(state.products.map(p=>p.category))];
    categorySelect.innerHTML = cats.map(c=>`<option value="${c}">${c}</option>`).join('');
    // tabs
    catTabs.innerHTML = cats.slice(0,6).map(c => `<button class="nav-tab ${c==='all'?'active':''}" data-cat="${c}">${c}</button>`).join('');
  }

  /* ---------- events ---------- */
  searchInput.addEventListener('input', e => { state.query = e.target.value; renderProducts(); });
  document.getElementById('clearSearch').addEventListener('click', ()=>{ searchInput.value=''; state.query=''; renderProducts(); });

  categorySelect.addEventListener('change', e=>{ state.category = e.target.value; setActiveTab(state.category); renderProducts(); });
  sortSelect.addEventListener('change', e=>{ state.sort = e.target.value; renderProducts(); });
  priceRange.addEventListener('input', e=>{ state.priceMax = parseInt(e.target.value,10); priceMaxLabel.textContent = state.priceMax; renderProducts(); });

  document.getElementById('resetFilters').addEventListener('click', ()=>{ state.category='all'; state.query=''; state.sort='popular'; state.priceMax = parseInt(priceRange.max,10); categorySelect.value='all'; searchInput.value=''; priceRange.value=priceRange.max; priceMaxLabel.textContent = priceRange.value; renderProducts(); setActiveTab('all'); });

  // delegate product actions
  productsGrid.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if(!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const product = PRODUCTS.find(p=>p.id===id);
    if(action==='add'){ addToCart(product); animateAdd(btn); }
    if(action==='view'){ openModal(product); }
  });

  // cart open/close
  cartBtn.addEventListener('click', ()=>{ cartPanel.setAttribute('aria-hidden','false'); cartPanel.style.transform='translateX(0)'; });
  closeCart.addEventListener('click', ()=>{ cartPanel.setAttribute('aria-hidden','true'); cartPanel.style.transform='translateX(120%)'; });

  cartItemsDiv.addEventListener('click', (ev)=> {
    const btn = ev.target.closest('button');
    if(!btn) return;
    const action = btn.dataset.action; const id = btn.dataset.id;
    if(action==='inc'){ state.cart[id].qty +=1; saveCart(); }
    if(action==='dec'){ state.cart[id].qty = Math.max(1, state.cart[id].qty-1); saveCart(); }
    if(action==='remove'){ delete state.cart[id]; saveCart(); }
  });

  clearCart.addEventListener('click', ()=>{ state.cart = {}; saveCart(); });

  checkoutBtn.addEventListener('click', ()=>{ alert('Checkout demo — integrate payments/backend to enable real checkout.'); });

  // modal
  function openModal(product){
    modalImage.src = product.img; modalTitle.textContent = product.title; modalDesc.textContent = product.desc;
    modalPrice.textContent = formatINR(product.price); modalRating.textContent = `Rating: ${product.rating}`;
    modalAddToCart.dataset.id = product.id;
    productModal.setAttribute('aria-hidden','false');
  }
  document.getElementById('closeModal').addEventListener('click', ()=> productModal.setAttribute('aria-hidden','true'));
  productModal.addEventListener('click', (e)=> { if(e.target === productModal) productModal.setAttribute('aria-hidden','true'); });
  document.getElementById('modalAddToCart').addEventListener('click', (e)=> { const id = e.target.dataset.id; const product = PRODUCTS.find(p=>p.id===id); addToCart(product); productModal.setAttribute('aria-hidden','true'); });

  // cart logic
  function addToCart(product){
    if(!state.cart[product.id]) state.cart[product.id] = {...product, qty:0};
    state.cart[product.id].qty += 1; saveCart();
    pulseCart();
  }

  function animateAdd(button){
    const img = button.closest('.product-card').querySelector('img');
    if(!img) return;
    const clone = img.cloneNode(true);
    const rect = img.getBoundingClientRect();
    clone.style.position='fixed'; clone.style.left=rect.left+'px'; clone.style.top=rect.top+'px';
    clone.style.width=rect.width+'px'; clone.style.height=rect.height+'px'; clone.style.zIndex=9999; clone.style.borderRadius='10px';
    clone.style.transition='all 700ms cubic-bezier(.2,.9,.2,1)'; document.body.appendChild(clone);
    const cartRect = cartBtn.getBoundingClientRect();
    requestAnimationFrame(()=> {
      clone.style.left = (cartRect.left + 6) + 'px';
      clone.style.top = (cartRect.top + 6) + 'px';
      clone.style.width = '36px'; clone.style.height='36px'; clone.style.opacity = '0.4'; clone.style.transform='rotate(15deg)';
    });
    setTimeout(()=> clone.remove(), 800);
  }

  function pulseCart(){
    cartBtn.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:420, easing:'ease-out'});
  }

  /* theme toggle */
  themeToggle.addEventListener('click', ()=> {
    if(document.documentElement.classList.contains('light')) {
      document.documentElement.classList.remove('light');
      localStorage.removeItem('gadgetzone-theme');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('gadgetzone-theme','light');
    }
  });
  if(localStorage.getItem('gadgetzone-theme')==='light') document.documentElement.classList.add('light');

  /* category tabs click */
  catTabs.addEventListener('click', (e)=> {
    const btn = e.target.closest('.nav-tab'); if(!btn) return;
    const cat = btn.dataset.cat; state.category = cat; categorySelect.value = cat; setActiveTab(cat); renderProducts();
  });

  function setActiveTab(cat){
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
  }

  /* init */
  function init(){
    populateCategories();
    renderProducts();
    updateCartUI();
    // priceRange label
    priceMaxLabel.textContent = priceRange.value;
    // small keyboard accessibility
    document.addEventListener('keydown', (e)=> { if(e.key==='Escape'){ productModal.setAttribute('aria-hidden','true'); cartPanel.setAttribute('aria-hidden','true'); cartPanel.style.transform='translateX(120%)'; }});
  }
  init();

  /* ---------- particle background (simple) ---------- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth; let h = canvas.height = innerHeight;
  window.addEventListener('resize', ()=> { w = canvas.width = innerWidth; h = canvas.height = innerHeight; });
  const particles = Array.from({length: 60}, () => ({
    x: Math.random()*w, y: Math.random()*h, r: Math.random()*2.8+0.6,
    vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3,
    hue: Math.random()*360
  }));
  function drawParticles(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x<0) p.x = w; if(p.x>w) p.x = 0;
      if(p.y<0) p.y = h; if(p.y>h) p.y = 0;
      const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*12);
      grad.addColorStop(0, `hsla(${p.hue},90%,65%,0.18)`);
      grad.addColorStop(1, `hsla(${p.hue},90%,65%,0)`);
      ctx.beginPath(); ctx.fillStyle = grad; ctx.arc(p.x,p.y,p.r*6,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

})();
