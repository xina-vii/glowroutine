/* Інтерактивна навігація: мобільне меню, закриття по Esc/кліку поза меню,
   тінь шапки при прокручуванні, кнопка «Нагору», scrollspy, пошук і серце в шапці */
(function () {
  "use strict";

  var toggle = GR.$("#nav-toggle");          // прихований чекбокс (CSS-перемикач меню з верстки)
  var nav = GR.$(".nav-links");
  var header = GR.$(".navbar");
  var burger = GR.$(".mobile-icon");

  /* ---------- Мобільне меню ---------- */
  function syncMenu() {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", String(toggle.checked));
    toggle.setAttribute("aria-label", toggle.checked ? "Закрити меню" : "Відкрити меню");
  }
  function closeMenu() { if (toggle && toggle.checked) { toggle.checked = false; syncMenu(); } }

  if (toggle && nav) {
    nav.id = nav.id || "main-nav";
    toggle.setAttribute("aria-controls", nav.id);
    toggle.addEventListener("change", syncMenu);
    syncMenu();

    /* Делегування: один обробник на весь список посилань */
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.checked) { closeMenu(); toggle.focus(); }
    });
    document.addEventListener("click", function (e) {      // клік поза меню
      if (toggle.checked && !nav.contains(e.target) && !toggle.contains(e.target) && !(burger && burger.contains(e.target))) closeMenu();
    });
    window.addEventListener("resize", GR.debounce(function () { if (window.innerWidth > 760) closeMenu(); }, 150));
  }

  /* ---------- Шапка: тінь при прокручуванні + кнопка «Нагору» ---------- */
  var topBtn = document.createElement("button");
  topBtn.type = "button";
  topBtn.className = "scroll-top";
  topBtn.hidden = true;
  topBtn.setAttribute("aria-label", "Нагору");
  topBtn.innerHTML = GR.icon("arrow");
  document.body.appendChild(topBtn);
  topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    topBtn.hidden = y < 500;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scrollspy: підсвітка пункту меню, що відповідає видимому розділу сторінки ---------- */
  var spyLinks = GR.$$(".nav-links a").map(function (a) {
    var url;
    try { url = new URL(a.getAttribute("href"), window.location.href); } catch (e) { return null; }
    if (!url.hash || url.pathname !== window.location.pathname) return null;
    var target = document.getElementById(url.hash.slice(1));
    return target ? { a: a, target: target } : null;
  }).filter(Boolean);

  if (spyLinks.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        spyLinks.forEach(function (l) {
          if (l.target !== en.target) return;
          l.a.classList.toggle("active", en.isIntersecting);
          if (en.isIntersecting) l.a.setAttribute("aria-current", "location");
          else l.a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-35% 0px -35% 0px" });
    spyLinks.forEach(function (l) { io.observe(l.target); });
  }

  /* ---------- Пошук у шапці: на сторінці каталогу — фокус у поле пошуку ---------- */
  var searchLink = GR.$(".nav-search");
  if (searchLink) {
    searchLink.setAttribute("href", "catalog.html#search");
    searchLink.addEventListener("click", function (e) {
      var input = GR.$("#catalogSearch");
      if (input) { e.preventDefault(); input.focus(); input.scrollIntoView({ block: "center", behavior: "smooth" }); }
    });
  }
})();
