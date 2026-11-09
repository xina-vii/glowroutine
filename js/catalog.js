/* Каталог: пошук, фільтри (склад, проблема, бренд, ціна), сортування,
   чипи активних фільтрів, порожній стан. Картки створюються з масиву GR.products. */
(function () {
  "use strict";

  var layout = GR.$(".catalog-layout");
  var grid = GR.$(".catalog-grid");
  if (!layout || !grid) return;

  var searchInput = GR.$("#catalogSearch");
  var sortSelect = GR.$('select[name="sort"]', layout);
  var chipsBox = GR.$(".chips", layout);
  var countEl = GR.$("#resultCount");
  var minInput = GR.$('input[name="min"]', layout);
  var maxInput = GR.$('input[name="max"]', layout);
  var mobileCount = GR.$(".mobile-filter span");
  var priceGroup = minInput.closest(".filter-group");
  var knobs = GR.$$(".range i", priceGroup);
  var PRICE_MAX = 2500;

  var heading = GR.$(".filter-heading", layout);
  var resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "reset-link";
  resetBtn.textContent = "Скинути все";
  resetBtn.hidden = true;
  heading.appendChild(resetBtn);

  var priceError = document.createElement("p");
  priceError.className = "field-error";
  priceError.id = "priceError";
  priceError.setAttribute("role", "alert");
  priceError.hidden = true;
  GR.$(".price-row", priceGroup).insertAdjacentElement("afterend", priceError);

  var state = { q: "", sort: "popular", min: 0, max: PRICE_MAX, tags: [] };

  function checks() { return GR.$$('input[name="f"]', layout); }

  /* Групи фільтрів: «Склад і безпека» — товар має мати ВСІ позначки; «Проблема шкіри» і «Бренд» — будь-який із вибраних;
     між групами діє «І». */
  function groupOf(input) { return input.closest(".filter-group").querySelector("legend").textContent.trim(); }

  function matches(p) {
    var q = state.q.trim().toLowerCase();
    if (q && (p.name + " " + p.brand + " " + GR.categoryNames[p.category]).toLowerCase().indexOf(q) === -1) return false;
    if (p.price < state.min || p.price > state.max) return false;
    var by = { safe: [], concern: [], brand: [] };
    checks().forEach(function (c) {
      if (!c.checked) return;
      var g = groupOf(c);
      (g.indexOf("Склад") === 0 ? by.safe : g.indexOf("Проблема") === 0 ? by.concern : by.brand).push(c.value);
    });
    if (by.safe.some(function (t) { return p.safe.indexOf(t) === -1; })) return false;
    if (by.concern.length && !by.concern.some(function (t) { return p.concerns.indexOf(t) !== -1; })) return false;
    if (by.brand.length && by.brand.indexOf(p.brand) === -1) return false;
    return true;
  }

  function sorted(list) {
    var s = state.sort;
    list = list.slice();
    if (s === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    else if (s === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    else if (s === "new") list.sort(function (a, b) { return (b.isNew - a.isNew) || (b.id - a.id); });
    else list.sort(function (a, b) { return b.popularity - a.popularity; });
    return list;
  }

  function emptyHTML() {
    return '<div class="empty-state" id="emptyState">' +
      '<span class="empty-icon">' + GR.icon("search", "icon-lg") + '</span>' +
      '<h3 class="heading heading-3">За вашим запитом нічого не знайдено</h3>' +
      '<p class="text">Спробуйте змінити або скинути частину фільтрів.</p>' +
      '<button class="btn btn-primary" type="button" data-reset>Скинути фільтри</button></div>';
  }

  function activeFilters() {
    var items = [];
    checks().forEach(function (c) { if (c.checked) items.push({ label: c.value, kind: "check", ref: c }); });
    if (state.min > 0 || state.max < PRICE_MAX) items.push({ label: "Ціна: " + state.min + "–" + state.max + " ₴", kind: "price" });
    if (state.q.trim()) items.push({ label: "«" + state.q.trim() + "»", kind: "q" });
    return items;
  }

  function render() {
    var list = sorted(GR.products.filter(matches));
    if (list.length) {
      grid.hidden = false;
      grid.innerHTML = list.map(GR.cardHTML).join("");
    } else {
      grid.hidden = false;
      grid.innerHTML = emptyHTML();
    }
    grid.classList.toggle("is-empty", !list.length);
    countEl.textContent = list.length ? "Знайдено товарів: " + list.length : "Нічого не знайдено";

    var act = activeFilters();
    chipsBox.innerHTML = act.map(function (a, i) {
      return '<button type="button" class="chip" data-i="' + i + '" aria-label="Прибрати фільтр: ' + GR.escape(a.label) + '">' + GR.escape(a.label) + GR.icon("close", "icon-xs") + '</button>';
    }).join("");
    chipsBox._items = act;
    resetBtn.hidden = !act.length;
    if (mobileCount) mobileCount.textContent = act.filter(function (a) { return a.kind !== "q"; }).length;
    syncKnobs();
    syncUrl();
  }

  function syncKnobs() {
    if (knobs.length < 2) return;
    knobs[0].style.left = (Math.min(state.min, PRICE_MAX) / PRICE_MAX * 100) + "%";
    knobs[1].style.right = (100 - Math.min(state.max, PRICE_MAX) / PRICE_MAX * 100) + "%";
  }

  function syncUrl() {
    try {
      var p = new URLSearchParams();
      if (state.q.trim()) p.set("q", state.q.trim());
      checks().forEach(function (c) { if (c.checked) p.append("f", c.value); });
      if (state.min > 0) p.set("min", state.min);
      if (state.max < PRICE_MAX) p.set("max", state.max);
      if (state.sort !== "popular") p.set("sort", state.sort);
      var qs = p.toString();
      history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
    } catch (e) { /* file:// або заборонена history API — не критично */ }
  }

  /* Ціна: перевіряємо введені значення й показуємо повідомлення про помилку */
  function readPrice() {
    var lo = minInput.value.trim(), hi = maxInput.value.trim();
    var msg = "";
    if ((lo && !/^\d+$/.test(lo)) || (hi && !/^\d+$/.test(hi))) msg = "Ціна має бути цілим невід’ємним числом.";
    else if (lo && hi && Number(lo) > Number(hi)) msg = "Мінімальна ціна не може бути більшою за максимальну.";
    priceError.textContent = msg;
    priceError.hidden = !msg;
    [minInput, maxInput].forEach(function (i) {
      i.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) i.setAttribute("aria-describedby", "priceError"); else i.removeAttribute("aria-describedby");
      i.classList.toggle("has-error", !!msg);
    });
    if (msg) return false;
    state.min = lo ? Number(lo) : 0;
    state.max = hi ? Number(hi) : PRICE_MAX;
    return true;
  }

  function resetAll() {
    checks().forEach(function (c) { c.checked = false; });
    minInput.value = 0; maxInput.value = PRICE_MAX;
    state.min = 0; state.max = PRICE_MAX; state.q = ""; state.sort = "popular";
    searchInput.value = ""; sortSelect.value = "popular";
    readPrice();
    render();
  }

  /* ---------- Обробники подій ---------- */
  layout.addEventListener("change", function (e) {
    if (e.target.name === "f") render();
  });
  [minInput, maxInput].forEach(function (i) {
    i.addEventListener("input", GR.debounce(function () { if (readPrice()) render(); }, 250));
  });
  layout.addEventListener("submit", function (e) {                 // кнопка «Застосувати»
    e.preventDefault();
    if (readPrice()) { render(); var t = GR.$("#filters-toggle"); if (t) t.checked = false; }
    else minInput.focus();
  });
  sortSelect.addEventListener("change", function () { state.sort = sortSelect.value; render(); });
  searchInput.addEventListener("input", GR.debounce(function () { state.q = searchInput.value; render(); }, 200));
  searchInput.addEventListener("keydown", function (e) { if (e.key === "Enter") e.preventDefault(); });
  GR.$("#searchClear").addEventListener("click", function () { searchInput.value = ""; state.q = ""; render(); searchInput.focus(); });

  chipsBox.addEventListener("click", function (e) {                // делегування: чипи створюються динамічно
    var chip = e.target.closest(".chip");
    if (!chip) return;
    var a = chipsBox._items[Number(chip.dataset.i)];
    if (a.kind === "check") a.ref.checked = false;
    if (a.kind === "price") { minInput.value = 0; maxInput.value = PRICE_MAX; state.min = 0; state.max = PRICE_MAX; readPrice(); }
    if (a.kind === "q") { searchInput.value = ""; state.q = ""; }
    render();
  });
  resetBtn.addEventListener("click", resetAll);
  grid.addEventListener("click", function (e) { if (e.target.closest("[data-reset]")) resetAll(); });

  /* ---------- Початковий стан з адресного рядка (?f=…&min=…&q=…) ---------- */
  (function init() {
    var p;
    try { p = new URLSearchParams(window.location.search); } catch (e) { p = new URLSearchParams(""); }
    var fs = p.getAll("f");
    checks().forEach(function (c) { c.checked = fs.indexOf(c.value) !== -1; });
    minInput.value = p.get("min") || 0;
    maxInput.value = p.get("max") || PRICE_MAX;
    state.q = p.get("q") || "";
    searchInput.value = state.q;
    state.sort = p.get("sort") || "popular";
    if (!GR.$('option[value="' + state.sort + '"]', sortSelect)) state.sort = "popular";
    sortSelect.value = state.sort;
    readPrice();
    render();
    if (window.location.hash === "#search") searchInput.focus();
  })();

  GR.catalog = { render: render, reset: resetAll, state: state };
})();
