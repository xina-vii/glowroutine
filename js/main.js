/* Точка входу: глобальна обробка помилок і перевірка ініціалізації (підключається останнім) */
(function () {
  "use strict";

  window.addEventListener("error", function (e) {
    console.error("[GlowRoutine] Помилка:", e.message, "(" + e.filename + ":" + e.lineno + ")");
  });
  window.addEventListener("unhandledrejection", function (e) {
    console.error("[GlowRoutine] Необроблений Promise:", e.reason);
  });

  document.documentElement.classList.add("js");
  console.info("[GlowRoutine] Скрипти підключено на сторінці " + GR.page() + ". Товарів у даних: " + GR.products.length + ", у кошику: " + GR.store.count());
})();
