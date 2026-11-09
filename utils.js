/* Допоміжні функції: вибірка елементів, форматування, localStorage, toast-повідомлення */
(function () {
  "use strict";

  GR.$  = function (sel, root) { return (root || document).querySelector(sel); };
  GR.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* 1190 → «1 190 ₴» (як у верстці: пробіл-роздільник тисяч) */
  GR.money = function (n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + "\u00a0₴";
  };

  GR.escape = function (str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  };

  GR.debounce = function (fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  };

  /* SVG-іконка зі спрайта, який уже є на кожній сторінці верстки (#i-heart, #i-bag …) */
  GR.icon = function (name, cls) {
    return '<svg class="icon ' + (cls || "") + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>';
  };

  /* Безпечна робота з localStorage (може бути недоступний у приватному режимі) */
  GR.storage = {
    get: function (key, fallback) {
      try { var v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ігноруємо */ }
    },
    remove: function (key) {
      try { localStorage.removeItem(key); } catch (e) { /* ігноруємо */ }
    }
  };

  /* Спливаючі повідомлення (створюємо контейнер, якщо його ще немає) */
  GR.toast = function (text, isError) {
    var zone = GR.$("#toastZone");
    if (!zone) {
      zone = document.createElement("div");
      zone.id = "toastZone";
      zone.className = "toast-zone";
      zone.setAttribute("role", "status");
      zone.setAttribute("aria-live", "polite");
      document.body.appendChild(zone);
    }
    var el = document.createElement("div");
    el.className = "toast" + (isError ? " is-error" : "");
    el.textContent = text;
    zone.appendChild(el);
    setTimeout(function () { el.classList.add("is-leaving"); }, 2600);
    setTimeout(function () { el.remove(); }, 3000);
  };

  GR.getProduct = function (id) {
    id = Number(id);
    return GR.products.filter(function (p) { return p.id === id; })[0] || null;
  };

  /* Пошук товару за назвою (для карток, що вже є у верстці) */
  GR.findByName = function (name) {
    name = String(name || "").trim().toLowerCase();
    return GR.products.filter(function (p) { return p.name.toLowerCase() === name; })[0] || null;
  };

  GR.param = function (name) {
    try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; }
  };

  GR.page = function () {
    var f = window.location.pathname.split("/").pop();
    return f || "index.html";
  };

  /* Оголошення для екранних читачів/тестів */
  GR.pluralize = function (n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  };
})();
