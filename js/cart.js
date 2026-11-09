/* Сторінка кошика: рядки з товарами, кількість, видалення, прогрес безкоштовної доставки,
   бонуси, промокод та підсумок. Розмітка рядків — та сама, що у верстці ЛР № 3 (.cart-item). */
(function () {
  "use strict";

  var main = GR.$(".cart-page");
  if (!main) return;

  var cartMain = GR.$(".cart-main", main);
  var title = GR.$("h1 sup", main);
  var summary = GR.$(".summary", main);
  var progress = GR.$(".delivery-progress", main);
  var bonusBox = GR.$(".bonus-box", main);
  var bonusInput = GR.$("input", bonusBox);
  var promoForm = GR.$(".promo", main);
  var promoInput = GR.$('input[name="promo"]', promoForm);
  var checkoutLink = GR.$('a[href="checkout.html"]', main);
  var rows = document.createElement("div");
  rows.className = "cart-rows";
  progress.insertAdjacentElement("afterend", rows);
  GR.$$(".cart-item", cartMain).forEach(function (n) { n.remove(); });     // статичний рядок замінюємо динамічним

  var promoMsg = document.createElement("p");
  promoMsg.className = "promo-msg";
  promoMsg.setAttribute("role", "status");
  promoMsg.hidden = true;
  promoForm.insertAdjacentElement("afterend", promoMsg);

  function rowHTML(item) {
    var p = GR.getProduct(item.id);
    var unit = GR.store.unitPrice(item);
    var plan = item.plan === "sub" ? "Підписка · кожні " + item.freq + " міс. · −15%" : "Разова покупка";
    var wished = GR.store.isWished(p.id);
    return '<article class="cart-item" data-id="' + p.id + '">' +
      '<a href="product.html?id=' + p.id + '"><img src="' + GR.photo(p.photo, 400) + '" alt="' + GR.escape(p.short) + '" width="400" height="480"></a>' +
      '<div class="cart-copy"><small>' + GR.escape(p.brand.toUpperCase()) + '</small><b>' + GR.escape(p.name) + '</b><span>30 мл · ' + plan + '</span>' +
        '<div class="cart-links"><button type="button" class="text-btn" data-act="wish" aria-pressed="' + wished + '">' + GR.icon("heart", "icon-sm") + (wished ? " В обраному" : " В обране") + '</button>' +
        '<button type="button" class="text-btn" data-act="remove">' + GR.icon("trash", "icon-sm") + ' Видалити</button></div></div>' +
      '<div class="qty"><button type="button" data-act="minus" aria-label="Зменшити кількість: ' + GR.escape(p.short) + '">' + GR.icon("minus", "icon-sm") + '</button>' +
        '<output aria-label="Кількість">' + item.qty + '</output>' +
        '<button type="button" data-act="plus" aria-label="Збільшити кількість: ' + GR.escape(p.short) + '">' + GR.icon("plus", "icon-sm") + '</button></div>' +
      '<strong class="cart-price">' + GR.money(unit * item.qty) + '</strong></article>';
  }

  function emptyHTML() {
    return '<div class="empty-state">' +
      '<span class="empty-icon">' + GR.icon("bag", "icon-lg") + '</span>' +
      '<h2 class="heading heading-3">Ваш кошик порожній</h2>' +
      '<p class="text">Додайте засоби з каталогу або пройдіть Beauty Quiz — ми підберемо рутину.</p>' +
      '<div class="button-row"><a class="btn btn-primary" href="catalog.html">До каталогу</a><a class="btn btn-secondary" href="quiz.html">Пройти Beauty Quiz</a></div></div>';
  }

  function row(label, value) { return '<span>' + label + '</span><b>' + value + '</b>'; }

  function render() {
    var items = GR.store.cart();
    var t = GR.store.totals(null);
    var empty = !items.length;

    title.textContent = GR.store.count();
    rows.innerHTML = empty ? emptyHTML() : items.map(rowHTML).join("");
    progress.hidden = bonusBox.hidden = empty;
    bonusInput.checked = GR.store.bonusUsed();

    /* прогрес безкоштовної доставки */
    GR.$("span", GR.$("p", progress)).innerHTML = t.freeShipping
      ? "Доставка для вас <b>безкоштовна</b>"
      : "До безкоштовної доставки ще <b>" + GR.money(t.left) + "</b>";
    var bar = GR.$(".bar", progress);
    bar.setAttribute("aria-valuenow", t.progress);
    GR.$("i", bar).style.width = t.progress + "%";

    /* підсумок */
    var html = '<p class="sum-row">' + row("Товари", GR.money(t.subtotal)) + '</p>';
    if (t.promoDiscount) html += '<p class="sum-row is-discount">' + row("Промокод " + GR.store.promo().code, "−" + GR.money(t.promoDiscount)) + '</p>';
    if (t.bonusDiscount) html += '<p class="sum-row is-discount">' + row("Бонуси", "−" + GR.money(t.bonusDiscount)) + '</p>';
    html += '<p class="sum-row">' + row("Доставка", empty ? "—" : (t.freeShipping ? "безкоштовно" : "за тарифом")) + '</p>';
    GR.$$(".sum-row:not(.grand)", summary).forEach(function (n) { n.remove(); });
    GR.$("h2", summary).insertAdjacentHTML("afterend", html);
    GR.$(".grand b", summary).textContent = GR.money(t.total);

    /* кнопка оформлення неактивна для порожнього кошика */
    checkoutLink.setAttribute("aria-disabled", String(empty));
    checkoutLink.classList.toggle("is-disabled", empty);
    checkoutLink.tabIndex = empty ? -1 : 0;

    /* повідомлення про промокод */
    var promo = GR.store.promo();
    if (promo && promoMsg.dataset.kind !== "error") {
      promoMsg.textContent = "Промокод " + promo.code + " застосовано: −" + Math.round(promo.rate * 100) + "%.";
      promoMsg.className = "promo-msg is-ok";
      promoMsg.hidden = false;
    }
    if (!promo && promoMsg.dataset.kind !== "error") promoMsg.hidden = true;
  }

  /* Делегування: один обробник на контейнері рядків */
  rows.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var id = btn.closest(".cart-item").dataset.id;
    var act = btn.dataset.act;
    if (act === "plus") GR.store.changeQty(id, 1);
    if (act === "minus") GR.store.changeQty(id, -1);
    if (act === "remove") { GR.store.remove(id); GR.toast("Товар видалено з кошика"); }
    if (act === "wish") GR.store.toggleWish(id);
  });

  bonusInput.addEventListener("change", function () {
    GR.store.useBonus(bonusInput.checked);
    GR.toast(bonusInput.checked ? "Бонуси використано: −" + GR.money(GR.BONUS) : "Бонуси не використовуються");
  });

  promoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var res = GR.store.applyPromo(promoInput.value);
    promoMsg.dataset.kind = res.ok ? "" : "error";
    promoMsg.textContent = res.message;
    promoMsg.className = "promo-msg " + (res.ok ? "is-ok" : "is-error");
    promoMsg.hidden = false;
    promoInput.setAttribute("aria-invalid", String(!res.ok));
    if (res.ok) promoInput.value = "";
  });
  promoInput.addEventListener("input", function () {
    if (promoMsg.dataset.kind === "error") { promoMsg.dataset.kind = ""; promoMsg.hidden = true; promoInput.removeAttribute("aria-invalid"); }
  });

  checkoutLink.addEventListener("click", function (e) {
    if (!GR.store.count()) { e.preventDefault(); GR.toast("Кошик порожній — додайте товар", true); }
  });

  document.addEventListener("gr:cart", render);
  document.addEventListener("gr:wish", render);
  render();
})();
