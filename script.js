"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const products = [
    {id:1,title:"Wireless Noise-Cancelling Headphones",category:"Electronics",price:79.99,oldPrice:109.99,rating:4.7,reviewCount:1284,badge:"Best Seller",description:"Enjoy immersive sound, comfortable ear cushions, and wireless listening for work, travel, and everyday use.",image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85"},
    {id:2,title:"Classic Everyday Sneakers",category:"Fashion",price:54.99,oldPrice:69.99,rating:4.5,reviewCount:846,badge:"Popular",description:"Versatile everyday sneakers with a clean silhouette, cushioned comfort, and an easy-to-style design.",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85"},
    {id:3,title:"Minimal Ceramic Table Lamp",category:"Home",price:39.99,oldPrice:null,rating:4.6,reviewCount:532,badge:"",description:"Bring a warm, welcoming atmosphere to your bedroom, living room, or reading corner with this minimalist lamp.",image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85"},
    {id:4,title:"Stainless Steel Smart Water Bottle",category:"Lifestyle",price:24.99,oldPrice:32.99,rating:4.3,reviewCount:392,badge:"Great Value",description:"A reusable everyday bottle with a sleek stainless-steel finish, ideal for your desk, commute, or workout.",image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=85"},
    {id:5,title:"Mechanical Keyboard for Productivity",category:"Electronics",price:89.99,oldPrice:119.99,rating:4.8,reviewCount:1673,badge:"Top Rated",description:"Upgrade your desk with a tactile mechanical keyboard designed for comfortable typing, productivity, and gaming.",image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=85"},
    {id:6,title:"Premium Cotton Everyday T-Shirt",category:"Fashion",price:19.99,oldPrice:null,rating:4.4,reviewCount:627,badge:"",description:"A versatile cotton T-shirt with a comfortable fit that works just as well on its own as it does in layers.",image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85"},
    {id:7,title:"Modern Ceramic Coffee Mug Set",category:"Home",price:29.99,oldPrice:36.99,rating:4.6,reviewCount:418,badge:"New Arrival",description:"Give your coffee routine a refresh with a timeless ceramic mug design suited to everyday mornings and evenings.",image:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=85"},
    {id:8,title:"Lightweight Travel Backpack",category:"Lifestyle",price:44.99,oldPrice:59.99,rating:4.5,reviewCount:971,badge:"Deal",description:"Carry your daily essentials in a lightweight backpack with a practical shape for commuting, campus, and travel.",image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85"}
  ];

  const state = {searchTerm:"",category:"all",sortBy:"featured",cart:new Map(),wishlist:new Set()};
  const $ = (id) => document.getElementById(id);
  const productGrid=$("productGrid"), searchForm=$("searchForm"), searchInput=$("searchInput"), categorySelect=$("categorySelect"), sortSelect=$("sortSelect"), resultsCount=$("resultsCount"), activeFilters=$("activeFilters"), emptyState=$("emptyState");
  const cartButton=$("cartButton"), cartCount=$("cartCount"), cartDrawer=$("cartDrawer"), drawerOverlay=$("drawerOverlay"), cartItems=$("cartItems"), cartEmpty=$("cartEmpty"), cartSummary=$("cartSummary"), cartSubtotal=$("cartSubtotal"), cartSubtitle=$("cartSubtitle");
  const quickViewDialog=$("quickViewDialog"), quickViewContent=$("quickViewContent"), toast=$("toast");
  let toastTimeout, lastFocusedElement=null;

  function formatPrice(price){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(price);}
  function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function getProduct(id){return products.find(p=>p.id===Number(id));}
  function getStarMarkup(rating){const full=Math.floor(rating),half=rating-full>=.5,empty=5-full-(half?1:0);return "★".repeat(full)+(half?"½":"")+"☆".repeat(empty);}
  function showToast(message){clearTimeout(toastTimeout);toast.textContent=message;toast.classList.add("is-visible");toastTimeout=setTimeout(()=>toast.classList.remove("is-visible"),2600);}

  function getFilteredProducts(){
    const query=state.searchTerm.trim().toLowerCase();
    const list=products.filter(p=>(!query||p.title.toLowerCase().includes(query)||p.category.toLowerCase().includes(query)||p.description.toLowerCase().includes(query))&&(state.category==="all"||p.category===state.category));
    switch(state.sortBy){
      case "price-low": list.sort((a,b)=>a.price-b.price);break;
      case "price-high": list.sort((a,b)=>b.price-a.price);break;
      case "rating": list.sort((a,b)=>b.rating-a.rating);break;
      default: break;
    }
    return list;
  }

  function createProductCard(p){
    const badge=p.badge?`<span class="product-badge ${p.oldPrice?"sale":""}">${escapeHTML(p.badge)}</span>`:"";
    const old=p.oldPrice?`<span class="old-price">${formatPrice(p.oldPrice)}</span>`:"";
    const wished=state.wishlist.has(p.id);
    return `<article class="product-card" data-product-id="${p.id}"><div class="product-image-wrap">${badge}
      <button type="button" class="wishlist-button ${wished?"is-active":""}" data-action="wishlist" data-id="${p.id}" aria-label="${wished?"Remove from":"Add to"} wishlist: ${escapeHTML(p.title)}" aria-pressed="${wished}">${wished?"♥":"♡"}</button>
      <img class="product-image" src="${p.image}" alt="${escapeHTML(p.title)}" loading="lazy" decoding="async"></div>
      <div class="product-info"><span class="product-category">${escapeHTML(p.category)}</span><h3 class="product-title">${escapeHTML(p.title)}</h3>
      <div class="product-rating" aria-label="${p.rating} out of 5 stars"><span class="rating-stars" aria-hidden="true">${getStarMarkup(p.rating)}</span><span class="rating-value">${p.rating.toFixed(1)}</span><span class="rating-count">(${p.reviewCount.toLocaleString("en-US")})</span></div>
      <div class="product-price-row"><span class="product-price">${formatPrice(p.price)}</span>${old}</div><p class="product-delivery"><strong>Free delivery</strong> on eligible orders</p>
      <div class="product-actions"><button type="button" class="add-to-cart-button" data-action="add" data-id="${p.id}">Add to Cart</button><button type="button" class="quick-view-button" data-action="quick-view" data-id="${p.id}">Quick View</button></div></div></article>`;
  }

  function renderActiveFilters(){
    const chips=[];
    if(state.searchTerm.trim())chips.push(`<span class="filter-chip">Search: ${escapeHTML(state.searchTerm.trim())}<button type="button" data-action="clear-search" aria-label="Clear search">×</button></span>`);
    if(state.category!=="all")chips.push(`<span class="filter-chip">${escapeHTML(state.category)}<button type="button" data-action="clear-category" aria-label="Clear category">×</button></span>`);
    activeFilters.innerHTML=chips.join("");
  }
  function renderProducts(){
    const list=getFilteredProducts();
    productGrid.innerHTML=list.map(createProductCard).join("");
    resultsCount.textContent=`${list.length} product${list.length===1?"":"s"} found`;
    emptyState.hidden=list.length!==0;productGrid.hidden=list.length===0;renderActiveFilters();
  }
  function updateCategoryNavigation(){
    document.querySelectorAll("[data-category].nav-link").forEach(button=>{
      const active=button.dataset.category===state.category;button.classList.toggle("active",active);
      if(active)button.setAttribute("aria-current","true");else button.removeAttribute("aria-current");
    });
    categorySelect.value=state.category;
  }
  function clearFilters(){state.searchTerm="";state.category="all";searchInput.value="";categorySelect.value="all";updateCategoryNavigation();renderProducts();}

  searchInput.addEventListener("input",()=>{state.searchTerm=searchInput.value;renderProducts();});
  searchForm.addEventListener("submit",event=>{event.preventDefault();state.searchTerm=searchInput.value;renderProducts();$("productsSection").scrollIntoView({behavior:"smooth",block:"start"});});
  categorySelect.addEventListener("change",()=>{state.category=categorySelect.value;updateCategoryNavigation();renderProducts();});
  document.querySelectorAll(".nav-link[data-category]").forEach(button=>button.addEventListener("click",()=>{state.category=button.dataset.category;updateCategoryNavigation();renderProducts();$("productsSection").scrollIntoView({behavior:"smooth",block:"start"});}));
  $("clearFiltersButton").addEventListener("click",clearFilters);

  // Intentional sorting bug: the selected option is read but never stored in state.sortBy.
  sortSelect.addEventListener("change",()=>{const selectedSort=sortSelect.value;void selectedSort;renderProducts();});

  activeFilters.addEventListener("click",event=>{
    const button=event.target.closest("button[data-action]");if(!button)return;
    if(button.dataset.action==="clear-search"){state.searchTerm="";searchInput.value="";}
    if(button.dataset.action==="clear-category"){state.category="all";updateCategoryNavigation();}
    renderProducts();
  });
  document.querySelectorAll("[data-footer-category]").forEach(link=>link.addEventListener("click",()=>{state.category=link.dataset.footerCategory;updateCategoryNavigation();renderProducts();}));

  function toggleWishlist(id){
    const p=getProduct(id);if(!p)return;
    if(state.wishlist.has(p.id)){state.wishlist.delete(p.id);showToast("Removed from your wishlist.");}
    else{state.wishlist.add(p.id);showToast("Added to your wishlist.");}
    renderProducts();
  }
  function openQuickView(id){
    const p=getProduct(id);if(!p)return;lastFocusedElement=document.activeElement;
    quickViewContent.innerHTML=`<div class="quick-view-content"><div class="quick-view-image-wrap"><img class="quick-view-image" src="${p.image}" alt="${escapeHTML(p.title)}"></div><div class="quick-view-details">
      <span class="product-category">${escapeHTML(p.category)}</span><h2 id="quickViewTitle">${escapeHTML(p.title)}</h2>
      <div class="product-rating"><span class="rating-stars" aria-hidden="true">${getStarMarkup(p.rating)}</span><span class="rating-value">${p.rating.toFixed(1)} / 5</span><span class="rating-count">(${p.reviewCount.toLocaleString("en-US")} reviews)</span></div>
      <div class="product-price">${formatPrice(p.price)}</div><p>${escapeHTML(p.description)}</p><button type="button" class="add-to-cart-button" data-action="quick-add" data-id="${p.id}">Add to Cart</button></div></div>`;
    quickViewDialog.setAttribute("aria-labelledby","quickViewTitle");if(!quickViewDialog.open)quickViewDialog.showModal();
  }
  productGrid.addEventListener("click",event=>{
    const button=event.target.closest("button[data-action]");if(!button)return;
    const {action,id}=button.dataset;
    if(action==="add")addToCart(id);else if(action==="wishlist")toggleWishlist(id);else if(action==="quick-view")openQuickView(id);
  });
  quickViewContent.addEventListener("click",event=>{const button=event.target.closest('button[data-action="quick-add"]');if(!button)return;addToCart(button.dataset.id);quickViewDialog.close();});
  $("closeQuickViewButton").addEventListener("click",()=>quickViewDialog.close());
  quickViewDialog.addEventListener("click",event=>{if(event.target===quickViewDialog)quickViewDialog.close();});
  quickViewDialog.addEventListener("close",()=>{if(lastFocusedElement&&lastFocusedElement.isConnected)lastFocusedElement.focus();});

  function getCartQuantity(){let total=0;state.cart.forEach(item=>total+=item.quantity);return total;}
  function getCartTotal(){let total=0;state.cart.forEach(item=>total+=item.product.price*item.quantity);return total;}
  function addToCart(id){
    const p=getProduct(id);if(!p)return;const item=state.cart.get(p.id);
    if(item)item.quantity++;else state.cart.set(p.id,{product:p,quantity:1});
    renderCart();showToast(`${p.title} added to your cart.`);
  }
  function updateCartQuantity(id,change){const item=state.cart.get(Number(id));if(!item)return;item.quantity+=change;if(item.quantity<=0)state.cart.delete(Number(id));renderCart();}
  function removeFromCart(id){state.cart.delete(Number(id));renderCart();showToast("Item removed from your cart.");}
  function renderCart(){
    const quantity=getCartQuantity(),entries=Array.from(state.cart.values());
    cartCount.textContent=String(quantity);cartButton.setAttribute("aria-label",`View shopping cart, ${quantity} item${quantity===1?"":"s"}`);
    cartSubtitle.textContent=`${quantity} item${quantity===1?"":"s"} in your cart`;
    cartEmpty.hidden=entries.length!==0;cartItems.hidden=entries.length===0;cartSummary.hidden=entries.length===0;
    cartItems.innerHTML=entries.map(({product:p,quantity:q})=>`<article class="cart-item" data-product-id="${p.id}"><img class="cart-item-image" src="${p.image}" alt="${escapeHTML(p.title)}" loading="lazy">
      <div class="cart-item-info"><h3>${escapeHTML(p.title)}</h3><p>${formatPrice(p.price)}</p><div class="quantity-control" aria-label="Quantity controls">
      <button type="button" data-cart-action="decrease" data-id="${p.id}" aria-label="Decrease quantity of ${escapeHTML(p.title)}">−</button><span aria-label="Quantity">${q}</span>
      <button type="button" data-cart-action="increase" data-id="${p.id}" aria-label="Increase quantity of ${escapeHTML(p.title)}">+</button></div></div>
      <button type="button" class="remove-item" data-cart-action="remove" data-id="${p.id}" aria-label="Remove ${escapeHTML(p.title)} from cart">Remove</button></article>`).join("");
    cartSubtotal.textContent=formatPrice(getCartTotal());
  }
  function openCart(){cartDrawer.classList.add("is-open");cartDrawer.setAttribute("aria-hidden","false");cartDrawer.removeAttribute("inert");drawerOverlay.hidden=false;document.body.classList.add("drawer-open");$("closeCartButton").focus();}
  function closeCart(){cartDrawer.classList.remove("is-open");cartDrawer.setAttribute("aria-hidden","true");cartDrawer.setAttribute("inert","");drawerOverlay.hidden=true;document.body.classList.remove("drawer-open");cartButton.focus();}
  cartButton.addEventListener("click",openCart);$("closeCartButton").addEventListener("click",closeCart);$("continueShoppingButton").addEventListener("click",closeCart);drawerOverlay.addEventListener("click",closeCart);
  cartItems.addEventListener("click",event=>{
    const button=event.target.closest("button[data-cart-action]");if(!button)return;
    const {cartAction,id}=button.dataset;
    if(cartAction==="increase")updateCartQuantity(id,1);else if(cartAction==="decrease")updateCartQuantity(id,-1);else if(cartAction==="remove")removeFromCart(id);
  });
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&cartDrawer.classList.contains("is-open"))closeCart();});
  $("checkoutButton").addEventListener("click",()=>showToast("Demo store: checkout and payment are not available."));

  const newsletterForm=$("newsletterForm"),newsletterEmail=$("newsletterEmail"),newsletterMessage=$("newsletterMessage");
  newsletterForm.addEventListener("submit",event=>{
    event.preventDefault();if(!newsletterEmail.checkValidity()){newsletterEmail.reportValidity();return;}
    newsletterMessage.textContent="Thanks for your interest!";newsletterMessage.style.color="#86efac";newsletterForm.reset();
  });

  $("currentYear").textContent=String(new Date().getFullYear());
  renderProducts();renderCart();updateCategoryNavigation();

  // ---------------------------------------------
  // INTENTIONAL BUG SUMMARY — DEBUGGING CHECKLIST
  //
  // BUG 1 — Missing compliance links:
  // The footer intentionally omits Terms & Conditions and Privacy Policy links.
  //
  // BUG 2 — CSS color mismatch:
  // The second product card's Quick View button uses neon pink (#ff00cc),
  // conflicting with the storefront's blue/orange color palette.
  //
  // BUG 3 — Broken sort functionality:
  // The sortSelect change handler reads the selected value but never assigns
  // it to state.sortBy. renderProducts() therefore keeps the previous sorting
  // order instead of applying the selected sort option.
  // ---------------------------------------------
});
