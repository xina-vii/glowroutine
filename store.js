/* Стан сайту: кошик, обране, промокод, бонуси, замовлення.
   Усе зберігається в localStorage, тому дані спільні для всіх сторінок. */
(function () {
  "use strict";

  var KEY = { cart: "gr_cart", wish: "gr_wish", promo: "gr_promo", bonus: "gr_bonus", init: "gr_init" };

  /* Початковий стан збігається зі стартовим станом верстки ЛР № 3:
     у кошику один Glow Serum, в обраному — Kombucha Essence (серце було «увімкнене» в каталозі). */
  if (!GR.storage.get(KEY.init, false)) {
    GR.storage.set(KEY.cart, [{ id: 1, qty: 1, plan: "once", freq: 1 }]);
    GR.storage.set(KEY.wish, [3]);
    GR.storage.set(KEY.init, true);
  }

  var cart = GR.storage.get(KEY.cart, []).filter(function (c) { return GR.getProduct(c.id); });
  var wish = GR.storage.get(KEY.wish, []).filter(function (id) { return GR.getProduct(id); });
  var promo = GR.storage.get(KEY.promo, null);       // { code, rate }
  var bonus = !!GR.storage.get(KEY.bonus, false);

  function emit(name) { document.dispatchEvent(new CustomEvent(name)); }
  function save() {
    GR.storage.set(KEY.cart, cart);
    GR.storage.set(KEY.wish, wish);
    GR.storage.set(KEY.promo, promo);
    GR.storage.set(KEY.bonus, bonus);
  }
  function find(id) { return cart.filter(function (c) { return c.id === Number(id); })[0]; }

  /* Ціна одиниці з урахуванням підписки (−15 %) */
  function unitPrice(item) {
    var p = GR.getProduct(item.id);
    return item.plan === "sub" ? Math.round(p.price * 0.85) : p.price;
  }

  GR.store = {
    cart: function () { return cart.map(function (c) { return { id: c.id, qty: c.qty, plan: c.plan, freq: c.freq }; }); },
    wish: function () { return wish.slice(); },
    isWished: function (id) { return wish.indexOf(Number(id)) !== -1; },
    unitPrice: unitPrice,

    toggleWish: function (id) {
      id = Number(id);
      var i = wish.indexOf(id);
      if (i === -1) { wish.push(id); GR.toast("Додано в обране"); }
      else { wish.splice(i, 1); GR.toast("Видалено з обраного"); }
      save(); emit("gr:wish");
      return i === -1;
    },

    addToCart: function (id, opts) {
      id = Number(id);
      opts = opts || {};
      var item = find(id);
      if (item) { item.qty += opts.qty || 1; if (opts.plan) { item.plan = opts.plan; item.freq = opts.freq || 1; } }
      else cart.push({ id: id, qty: opts.qty || 1, plan: opts.plan || "once", freq: opts.freq || 1 });
      save(); emit("gr:cart");
      if (!opts.silent) GR.toast("«" + GR.getProduct(id).short + "» додано в кошик");
    },

    changeQty: function (id, delta) {
      var item = find(id);
      if (!item) return;
      item.qty = Math.min(10, item.qty + delta);
      if (item.qty <= 0) cart = cart.filter(function (c) { return c.id !== Number(id); });
      save(); emit("gr:cart");
    },

    remove: function (id) {
      cart = cart.filter(function (c) { return c.id !== Number(id); });
      save(); emit("gr:cart");
    },

    clear: function () { cart = []; promo = null; bonus = false; save(); emit("gr:cart"); },

    count: function () { return cart.reduce(function (s, c) { return s + c.qty; }, 0); },
    subtotal: function () { return cart.reduce(function (s, c) { return s + unitPrice(c) * c.qty; }, 0); },

    /* Промокод: перевіряємо за словником GR.PROMOS, повертаємо {ok, message} */
    applyPromo: function (code) {
      code = String(code || "").trim().toUpperCase();
      if (!code) return { ok: false, message: "Введіть промокод." };
      if (!Object.prototype.hasOwnProperty.call(GR.PROMOS, code)) return { ok: false, message: "Промокод «" + code + "» не знайдено або він недійсний." };
      promo = { code: code, rate: GR.PROMOS[code] };
      save(); emit("gr:cart");
      return { ok: true, message: "Промокод " + code + " застосовано: −" + Math.round(promo.rate * 100) + "%." };
    },
    promo: function () { return promo ? { code: promo.code, rate: promo.rate } : null; },
    clearPromo: function () { promo = null; save(); emit("gr:cart"); },

    useBonus: function (on) { bonus = !!on; save(); emit("gr:cart"); },
    bonusUsed: function () { return bonus; },

    /* Підсумок замовлення: товари, знижки, доставка, до сплати */
    totals: function (deliveryName) {
      var sub = GR.store.subtotal();
      var promoDiscount = promo ? Math.round(sub * promo.rate) : 0;
      var bonusDiscount = bonus && sub > 0 ? Math.min(GR.BONUS, sub - promoDiscount) : 0;
      var goods = sub - promoDiscount - bonusDiscount;
      var free = goods >= GR.FREE_SHIPPING || sub === 0;
      var tariff = deliveryName ? GR.DELIVERY[deliveryName] : null;
      var delivery = free ? 0 : (tariff == null ? null : tariff);      // null = «за тарифом»
      return {
        subtotal: sub, promoDiscount: promoDiscount, bonusDiscount: bonusDiscount, goods: goods,
        freeShipping: free, delivery: delivery,
        left: Math.max(0, GR.FREE_SHIPPING - goods),
        progress: Math.min(100, Math.round(goods / GR.FREE_SHIPPING * 100)),
        total: goods + (delivery || 0)
      };
    },

    /* Службове: повернути стартовий стан (для налагодження в консолі) */
    reset: function () {
      Object.keys(KEY).forEach(function (k) { GR.storage.remove(KEY[k]); });
      ["gr_quiz", "gr_order", "gr_subscriber", "gr_reviews", "gr_sub"].forEach(function (k) { GR.storage.remove(k); });
      window.location.reload();
    }
  };

  /* Лічильники в шапці: кошик (є у верстці) і обране (створюємо такий самий бейдж) */
  function badge(link, count, label, animate) {
    if (!link) return;
    var span = link.querySelector("span.count") || link.querySelector("span");
    if (!span) { span = document.createElement("span"); span.className = "count"; link.appendChild(span); }
    span.textContent = count;
    span.hidden = count === 0;
    link.setAttribute("aria-label", label);
    if (animate) { span.classList.remove("bump"); void span.offsetWidth; span.classList.add("bump"); }
  }

  function renderBadges(animate) {
    var n = GR.store.count();
    badge(GR.$(".cart-icon"), n, "Кошик, " + n + " " + GR.pluralize(n, "товар", "товари", "товарів"), animate === true);
    var heart = GR.$('.nav-actions a[aria-label^="Обране"]');
    if (heart) {
      heart.classList.add("wish-link");
      heart.setAttribute("href", "account.html#wish");
      badge(heart, wish.length, "Обране, " + wish.length + " " + GR.pluralize(wish.length, "товар", "товари", "товарів"), animate === true);
    }
  }

  document.addEventListener("gr:cart", function () { renderBadges(true); });
  document.addEventListener("gr:wish", function () { renderBadges(true); });
  renderBadges(false);

  /* Синхронізація між вкладками браузера */
  window.addEventListener("storage", function (e) {
    if (e.key === KEY.cart || e.key === KEY.wish) window.location.reload();
  });
})();
