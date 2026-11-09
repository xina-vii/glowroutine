/* Картки товарів: однакова розмітка в каталозі та на інших сторінках,
   «серце» (обране) та кнопка швидкого додавання в кошик */
(function () {
  "use strict";

  function stars(r) {
    return '<span class="stars" role="img" aria-label="' + r.toFixed(1) + ' з 5"><span aria-hidden="true">★★★★★</span><small>' + r.toFixed(1) + '</small></span>';
  }

  function wishAttrs(id) {
    var on = GR.store.isWished(id);
    return { on: on, label: on ? "Прибрати з обраного" : "Додати в обране" };
  }

  /* Розмітка картки — копія структури .product-card з верстки ЛР № 3 + кнопка «у кошик» */
  GR.cardHTML = function (p) {
    var w = wishAttrs(p.id);
    var href = "product.html?id=" + p.id;
    return '<article class="product-card" data-id="' + p.id + '">' +
      '<div class="product-media">' +
        '<a class="product-image" href="' + href + '"><img src="' + GR.photo(p.photo, 900) + '" alt="' + GR.escape(p.name) + '" loading="lazy" width="900" height="1100">' +
          '<span class="badge">' + GR.escape(p.badge) + '</span></a>' +
        '<button class="wish' + (w.on ? " active" : "") + '" type="button" aria-label="' + w.label + '" aria-pressed="' + w.on + '">' + GR.icon("heart") + '</button>' +
        '<button class="quick-add" type="button" aria-label="Додати в кошик: ' + GR.escape(p.short) + '">' + GR.icon("bag") + '</button>' +
      '</div>' +
      '<a class="product-info" href="' + href + '"><small>' + GR.escape(p.brand) + '</small><b>' + GR.escape(p.name) + '</b>' +
        stars(p.rating) + '<strong>' + GR.money(p.price) + '</strong></a>' +
    '</article>';
  };

  /* Підключаємо поведінку до карток, що вже є у верстці (головна, сторінка товару) */
  function enhance(root) {
    GR.$$(".product-card", root).forEach(function (card) {
      if (card.dataset.enhanced) return;
      var p = GR.findByName((GR.$(".product-info b", card) || {}).textContent);
      if (!p) return;
      card.dataset.id = p.id;
      card.dataset.enhanced = "1";
      GR.$$("a.product-image, a.product-info", card).forEach(function (a) { a.setAttribute("href", "product.html?id=" + p.id); });
      if (!GR.$(".quick-add", card)) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quick-add";
        btn.setAttribute("aria-label", "Додати в кошик: " + p.short);
        btn.innerHTML = GR.icon("bag");
        GR.$(".product-media", card).appendChild(btn);
      }
    });
    syncHearts();
  }

  function syncHearts() {
    GR.$$(".product-card[data-id] .wish").forEach(function (b) {
      var w = wishAttrs(b.closest(".product-card").dataset.id);
      b.classList.toggle("active", w.on);
      b.setAttribute("aria-pressed", String(w.on));
      b.setAttribute("aria-label", w.label);
    });
  }

  /* Делегування: один обробник кліків на весь документ (працює й для карток, створених пізніше) */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".product-card .wish, .product-card .quick-add");
    if (!btn) return;
    e.preventDefault();
    var id = btn.closest(".product-card").dataset.id;
    if (!id) return;
    if (btn.classList.contains("wish")) GR.store.toggleWish(id);
    else {
      GR.store.addToCart(id);
      btn.classList.add("is-done");
      setTimeout(function () { btn.classList.remove("is-done"); }, 900);
    }
  });

  document.addEventListener("gr:wish", syncHearts);

  GR.cards = { enhance: enhance, syncHearts: syncHearts };
  enhance(document);
})();
