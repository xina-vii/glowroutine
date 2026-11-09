/* Оформлення замовлення: підсумок із кошика, вартість доставки, валідація форми,
   створення замовлення. На сторінці підтвердження показуємо дані збереженого замовлення. */
(function () {
  "use strict";

  var rule = GR.rules;

  /* ---------- Сторінка оформлення ---------- */
  var page = GR.$(".checkout-page");
  if (page) {
    var form = GR.$(".checkout-layout", page);
    var summary = GR.$(".order-summary", page);
    var phone = GR.$('input[name="phone"]', form);
    GR.phoneMask(phone);

    function currentDelivery() {
      var r = GR.$('input[name="delivery"]:checked', form);
      return r ? r.value : "Нова Пошта";
    }

    function renderSummary() {
      var items = GR.store.cart();
      var t = GR.store.totals(currentDelivery());
      GR.$$(".mini-product, .sum-row:not(.grand), hr", summary).forEach(function (n) { n.remove(); });
      var list = items.map(function (c) {
        var p = GR.getProduct(c.id);
        return '<div class="mini-product"><img src="' + GR.photo(p.photo, 200) + '" alt="" width="200" height="240"><span><b>' + GR.escape(p.short) +
          '</b><small>' + c.qty + ' × ' + GR.money(GR.store.unitPrice(c)) + '</small></span></div>';
      }).join("") || '<p class="text">Кошик порожній. <a class="inline-link" href="catalog.html">Перейти до каталогу</a></p>';
      var rows = '<hr><p class="sum-row"><span>Товари</span><b>' + GR.money(t.subtotal) + '</b></p>';
      if (t.promoDiscount) rows += '<p class="sum-row is-discount"><span>Промокод</span><b>−' + GR.money(t.promoDiscount) + '</b></p>';
      if (t.bonusDiscount) rows += '<p class="sum-row is-discount"><span>Бонуси</span><b>−' + GR.money(t.bonusDiscount) + '</b></p>';
      rows += '<p class="sum-row"><span>Доставка (' + GR.escape(currentDelivery()) + ')</span><b>' +
        (items.length ? (t.freeShipping ? "безкоштовно" : GR.money(t.delivery)) : "—") + '</b></p>';
      var head = GR.$("h2", summary);
      head.insertAdjacentHTML("afterend", list + rows);
      GR.$(".grand b", summary).textContent = GR.money(t.total);
    }

    var ctl = GR.form(form, {
      name: [rule.required("Вкажіть ім’я."), rule.minLength(2, "Ім’я має містити щонайменше 2 символи."), rule.name()],
      phone: [rule.required("Вкажіть телефон."), rule.phone()],
      email: [rule.required("Вкажіть email."), rule.email()],
      city: [rule.required("Вкажіть місто та відділення доставки."), rule.minLength(3, "Опишіть місто та відділення детальніше (від 3 символів).")]
    }, function (v) {
      if (!GR.store.count()) { GR.toast("Кошик порожній — додайте товар перед оформленням", true); return; }
      var t = GR.store.totals(currentDelivery());
      var order = {
        number: "GR-" + (20000 + Math.floor(Math.random() * 9000)),
        name: v.name.trim(), delivery: currentDelivery(), payment: (GR.$('input[name="payment"]:checked', form) || {}).value,
        total: t.total, count: GR.store.count(), date: new Date().toISOString()
      };
      GR.storage.set("gr_order", order);
      GR.store.clear();
      window.location.href = "confirmation.html";
    });

    form.addEventListener("change", function (e) { if (e.target.name === "delivery") renderSummary(); });
    document.addEventListener("gr:cart", renderSummary);
    renderSummary();
    return;
  }

  /* ---------- Сторінка підтвердження ---------- */
  var confirm = GR.$(".confirmation .confirm-card");
  if (confirm) {
    var order = GR.storage.get("gr_order", null);
    if (!order) return;                         // немає замовлення — лишаємо статичний макет
    GR.$(".confirmation > .text").innerHTML = "Номер замовлення <b>#" + GR.escape(order.number) + "</b>. Підтвердження вже на вашій пошті.";
    GR.$(".confirmation h1").textContent = "Дякуємо, " + order.name.split(/\s+/)[0] + "! Замовлення створено";
    var days = order.delivery === "Нова Пошта" ? "1–2 дні" : "2–4 дні";
    var dds = GR.$$("dd", confirm);
    dds[0].textContent = "Готуємо до відправлення";
    dds[1].textContent = order.delivery + " · " + days;
    dds[2].textContent = GR.money(order.total);
  }
})();
