/* Особистий кабінет: вкладки з адресою (#wish, #subs …), Wishlist із даних сховища,
   профіль шкіри за результатом Beauty Quiz, керування підпискою */
(function () {
  "use strict";

  var page = GR.$(".account-page");
  if (!page) return;

  /* ---------- Вкладки на радіо-кнопках: синхронізуємо з адресою сторінки ---------- */
  var tabs = { profile: "#tab-profile", shelf: "#tab-shelf", subs: "#tab-subs", wish: "#tab-wish" };

  function openFromHash() {
    var name = window.location.hash.replace("#", "");
    var radio = tabs[name] && GR.$(tabs[name]);
    if (radio) radio.checked = true;
  }
  GR.$$(".tab-input", page).forEach(function (r) {
    r.addEventListener("change", function () {
      try { history.replaceState(null, "", "#" + r.id.replace("tab-", "")); } catch (e) { /* ignore */ }
    });
  });
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  /* ---------- Профіль шкіри за результатом квізу ---------- */
  var quiz = GR.storage.get("gr_quiz", null);
  if (quiz && quiz.done) {
    var a = quiz.answers;
    var parts = [a.skin, a.sensitivity && a.sensitivity !== "Не чутлива" ? a.sensitivity.toLowerCase() : null].filter(Boolean);
    GR.$(".skin-text b").textContent = parts.join(" · ");
    GR.$(".skin-text .text").textContent = "Основна ціль: " + (a.goal || "—").toLowerCase() + ".";
    GR.$(".skin-text .profile-chips").innerHTML = [a.concern, a.experience].concat(a.exclude || []).filter(Boolean)
      .map(function (c) { return "<li>" + GR.escape(c) + "</li>"; }).join("");
  }

  /* ---------- Wishlist ---------- */
  var wishPanel = GR.$("#panel-wish");
  var list = GR.$(".wishlist-grid", wishPanel);

  function itemHTML(p) {
    return '<li class="wishlist-item" data-id="' + p.id + '"><img src="' + GR.photo(p.photo, 300) + '" alt="" loading="lazy" width="300" height="360">' +
      '<div><small>' + GR.escape(p.brand) + '</small><b>' + GR.escape(p.name) + '</b><strong>' + GR.money(p.price) + '</strong>' +
      '<button type="button" class="text-btn" data-act="cart">' + GR.icon("bag", "icon-sm") + ' У кошик</button></div>' +
      '<button type="button" class="wish-remove" data-act="remove" aria-label="Видалити з обраного: ' + GR.escape(p.short) + '">' + GR.icon("close", "icon-sm") + '</button>' +
      '<a href="product.html?id=' + p.id + '">Переглянути</a></li>';
  }

  function renderWish() {
    var ids = GR.store.wish();
    if (!ids.length) {
      list.innerHTML = '<li class="wishlist-empty"><p class="text">У списку бажань поки порожньо. Натисніть ♡ на картці товару, щоб зберегти його тут.</p>' +
        '<a class="btn btn-secondary" href="catalog.html">До каталогу</a></li>';
      return;
    }
    list.innerHTML = ids.map(function (id) { return itemHTML(GR.getProduct(id)); }).join("");
  }

  list.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var id = btn.closest(".wishlist-item").dataset.id;
    if (btn.dataset.act === "remove") GR.store.toggleWish(id);
    if (btn.dataset.act === "cart") GR.store.addToCart(id);
  });
  document.addEventListener("gr:wish", renderWish);
  renderWish();

  var shareBtn = GR.$(".content-head .btn", wishPanel);
  shareBtn.addEventListener("click", function () {
    var url = window.location.href.split("#")[0] + "#wish";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { GR.toast("Посилання на Wishlist скопійовано"); },
        function () { GR.toast("Не вдалося скопіювати посилання", true); });
    } else GR.toast("Скопіюйте адресу сторінки з адресного рядка");
  });

  /* ---------- Підписка: призупинити / змінити дату / скасувати ---------- */
  var card = GR.$(".subscription-card");
  var statusEl = GR.$(".sub-status span", card);
  var nextEl = GR.$(".sub-status small", card);
  var actions = GR.$$(".sub-actions button", card);
  var pauseBtn = actions[0], dateBtn = actions[1], cancelBtn = actions[2];
  var sub = GR.storage.get("gr_sub", { status: "active", next: null });
  var cancelArmed = null;

  function fmt(iso) { return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long" }); }

  function renderSub() {
    var s = sub.status;
    statusEl.textContent = s === "active" ? "Активна" : s === "paused" ? "Призупинена" : "Скасована";
    statusEl.className = s === "active" ? "status-ok" : s === "paused" ? "status-ok status-paused" : "status-ok status-cancelled";
    if (sub.next) nextEl.textContent = "Наступна доставка: " + fmt(sub.next);
    if (s !== "active") nextEl.textContent = s === "paused" ? "Доставки призупинено" : "Підписку скасовано";
    pauseBtn.innerHTML = GR.icon(s === "paused" ? "arrow" : "pause", "icon-md") + (s === "paused" ? " Відновити" : " Призупинити");
    pauseBtn.hidden = dateBtn.hidden = cancelBtn.hidden = s === "cancelled";
    dateBtn.disabled = s !== "active";
    if (s === "cancelled") {
      if (!GR.$(".sub-restore", card)) {
        var r = document.createElement("button");
        r.type = "button"; r.className = "btn btn-secondary sub-restore"; r.textContent = "Оформити знову";
        r.addEventListener("click", function () { sub.status = "active"; save(); renderSub(); GR.toast("Підписку відновлено"); r.remove(); });
        GR.$(".sub-actions", card).appendChild(r);
      }
    }
  }
  function save() { GR.storage.set("gr_sub", sub); }

  pauseBtn.addEventListener("click", function () {
    sub.status = sub.status === "paused" ? "active" : "paused";
    save(); renderSub();
    GR.toast(sub.status === "paused" ? "Підписку призупинено" : "Підписку відновлено");
  });
  dateBtn.addEventListener("click", function () {
    var d = new Date(sub.next || Date.now()); d.setDate(d.getDate() + 7);
    sub.next = d.toISOString(); save(); renderSub();
    GR.toast("Наступну доставку перенесено на " + fmt(sub.next));
  });
  cancelBtn.addEventListener("click", function () {      // двоетапне підтвердження небезпечної дії
    if (!cancelArmed) {
      cancelBtn.lastChild.textContent = " Точно скасувати?";
      cancelArmed = setTimeout(function () { cancelArmed = null; cancelBtn.lastChild.textContent = " Скасувати"; }, 4000);
      return;
    }
    clearTimeout(cancelArmed); cancelArmed = null; cancelBtn.lastChild.textContent = " Скасувати";
    sub.status = "cancelled"; save(); renderSub();
    GR.toast("Підписку скасовано");
  });
  renderSub();
})();
