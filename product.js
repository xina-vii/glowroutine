/* Сторінка товару: вміст формується за параметром ?id=…, галерея, тип покупки,
   додавання в кошик та обране, модальне вікно «Купити в 1 клік» із перевіркою форми */
(function () {
  "use strict";

  var page = GR.$(".product-page");
  if (!page) return;

  var rule = GR.rules;
  var idParam = GR.param("id");
  var p = GR.getProduct(idParam || 1);

  /* Невідомий id — показуємо порожній стан замість зламаної сторінки */
  if (!p) {
    GR.$(".product-detail", page).innerHTML =
      '<div class="empty-state" style="grid-column:1/-1"><span class="empty-icon">' + GR.icon("search", "icon-lg") + '</span>' +
      '<h1 class="heading heading-3">Товар не знайдено</h1><p class="text">Можливо, посилання застаріло. Перегляньте весь каталог.</p>' +
      '<a class="btn btn-primary" href="catalog.html">До каталогу</a></div>';
    GR.$$(".product-copy, #quick-order", document).forEach(function (n) { n.hidden = true; });
    document.title = "Товар не знайдено — GlowRoutine";
    return;
  }

  var detail = GR.$(".detail-info", page);

  /* ---------- Заповнення сторінки даними товару ---------- */
  document.title = p.short + " — GlowRoutine";
  var crumbs = GR.$$(".breadcrumbs li", page);
  crumbs[1].innerHTML = '<a href="catalog.html">' + GR.escape(GR.categoryNames[p.category]) + '</a>';
  crumbs[2].textContent = p.short;

  var photos = [p.photo, p.photo === "essence" ? "serum" : "essence", p.photo === "set" ? "cream" : "set"];
  var thumbs = GR.$$(".thumb", page);
  var mainImg = GR.$(".main-image img", page);
  thumbs.forEach(function (a, i) {
    GR.$("img", a).src = GR.photo(photos[i], 300);
    a.dataset.full = GR.photo(photos[i], 1100);
  });
  mainImg.src = GR.photo(photos[0], 1100);
  mainImg.alt = p.brand + " " + p.short;
  GR.$(".main-image figcaption", page).textContent = p.badge;

  GR.$(".brand", detail).textContent = p.brand.toUpperCase();
  var rest = p.name.indexOf(p.short) === 0 ? p.name.slice(p.short.length).trim() : "";
  GR.$("h1", detail).innerHTML = rest ? GR.escape(p.short) + "<br>" + GR.escape(rest) : GR.escape(p.name);
  var stars = GR.$(".stars", detail);
  stars.setAttribute("aria-label", p.rating.toFixed(1) + " з 5");
  GR.$("small", stars).textContent = p.rating.toFixed(1);
  var reviewLink = GR.$(".review-line a", detail);
  reviewLink.textContent = p.reviews + " " + GR.pluralize(p.reviews, "відгук", "відгуки", "відгуків");
  reviewLink.href = "review.html?id=" + p.id;
  GR.$(":scope > .text", detail).textContent = p.desc;
  GR.$(".active-row", detail).innerHTML = p.actives.map(function (a) { return "<li><b>" + GR.escape(a[0]) + "</b> " + GR.escape(a[1]) + "</li>"; }).join("");

  var subPrice = Math.round(p.price * 0.85);
  var labelBs = GR.$$(".purchase-toggle label b", detail);
  labelBs[0].textContent = GR.money(p.price);
  labelBs[1].textContent = GR.money(subPrice);
  GR.$(".price-once", detail).textContent = GR.money(p.price);
  GR.$(".price-sub", detail).textContent = GR.money(subPrice);

  var copy = GR.$(".product-copy");
  GR.$(".product-copy p.text").textContent = p.inci;
  var dds = GR.$$(".usage dd", copy);
  dds[0].textContent = p.am;
  dds[1].textContent = p.pm;

  /* Рекомендації: найпопулярніші товари з інших категорій */
  var recs = GR.products.filter(function (x) { return x.category !== p.category; })
    .sort(function (a, b) { return b.popularity - a.popularity; });
  var seen = {}, picks = [];
  recs.forEach(function (x) { if (picks.length < 3 && !seen[x.category]) { seen[x.category] = 1; picks.push(x); } });
  GR.$(".product-grid-3").innerHTML = picks.map(GR.cardHTML).join("");
  if (GR.cards) GR.cards.enhance(document);

  /* ---------- Галерея: клік по мініатюрі змінює головне фото ---------- */
  GR.$(".thumbnails", page).addEventListener("click", function (e) {
    var a = e.target.closest(".thumb");
    if (!a) return;
    e.preventDefault();
    thumbs.forEach(function (t) { t.classList.toggle("selected", t === a); if (t === a) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current"); });
    mainImg.src = a.dataset.full;
  });

  /* ---------- Обране та додавання в кошик ---------- */
  var heart = GR.$(".icon-btn", detail);
  function syncHeart() {
    var on = GR.store.isWished(p.id);
    heart.classList.toggle("active", on);
    heart.setAttribute("aria-pressed", String(on));
    heart.setAttribute("aria-label", on ? "Прибрати з обраного" : "Додати в обране");
  }
  heart.addEventListener("click", function () { GR.store.toggleWish(p.id); });
  document.addEventListener("gr:wish", syncHeart);
  syncHeart();

  var buyForm = GR.$(".purchase", detail);
  buyForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var plan = GR.$('input[name="plan"]:checked', buyForm).value;
    var freq = Number(GR.$('input[name="freq"]:checked', buyForm).value);
    GR.store.addToCart(p.id, { plan: plan, freq: freq });
    var btn = GR.$(".btn", buyForm);
    btn.classList.add("is-done");
    setTimeout(function () { btn.classList.remove("is-done"); }, 1000);
  });

  /* ---------- Модальне вікно «Купити в 1 клік» ---------- */
  var modal = GR.$("#quick-order");
  var opener = null;

  function focusables() {
    return GR.$$("a[href], button, input", modal).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
  }
  function openModal() {
    opener = document.activeElement;
    modal.classList.remove("is-closed");
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    GR.$("input", modal).focus();
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.classList.add("is-closed");
    document.body.style.overflow = "";
    try { history.replaceState(null, "", window.location.pathname + window.location.search); } catch (e) { /* ignore */ }
    if (opener && opener.focus) opener.focus();
  }

  GR.$$('a[href="#quick-order"]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); openModal(); });
  });
  GR.$$(".modal-close, .modal-overlay", modal).forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); closeModal(); });
  });
  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key !== "Tab") return;                     // утримуємо фокус усередині діалогу
    var items = focusables(), first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  if (window.location.hash === "#quick-order") openModal();

  var qoForm = GR.$("form.modal", modal);
  GR.phoneMask(GR.$('input[name="phone"]', qoForm));
  GR.form(qoForm, {
    name: [rule.required("Вкажіть ім’я."), rule.minLength(2, "Ім’я має містити щонайменше 2 символи."), rule.name()],
    phone: [rule.required("Вкажіть телефон."), rule.phone()]
  }, function (v) {
    GR.storage.set("gr_order", {
      number: "GR-" + (20000 + Math.floor(Math.random() * 9000)), name: v.name.trim(), delivery: "Нова Пошта",
      payment: "Післяплата", total: p.price, count: 1, date: new Date().toISOString()
    });
    window.location.href = "confirmation.html";
  });
})();
