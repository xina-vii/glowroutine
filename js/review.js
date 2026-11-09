/* Форма відгуку: товар за ?id=…, перевірка оцінки, тексту та фото, збереження відгуку.
   На сторінці review-sent.html — повернення до потрібного товару. */
(function () {
  "use strict";

  var rule = GR.rules;

  var form = GR.$(".review-shell");
  if (form) {
    var p = GR.getProduct(GR.param("id") || 1) || GR.getProduct(1);
    var box = GR.$(".review-product", form);
    GR.$("img", box).src = GR.photo(p.photo, 200);
    GR.$("small", box).textContent = p.brand.toUpperCase();
    GR.$("b", box).textContent = p.name;
    GR.$(".breadcrumbs a").href = "product.html?id=" + p.id;

    var textarea = GR.$("textarea", form);
    textarea.maxLength = 600;
    var counter = document.createElement("small");
    counter.className = "counter";
    counter.textContent = "0 / 600";
    textarea.closest("label").insertAdjacentElement("afterend", counter);
    textarea.addEventListener("input", function () { counter.textContent = textarea.value.length + " / 600"; });

    var fileInput = GR.$('input[type="file"]', form);
    var fileInfo = document.createElement("p");
    fileInfo.className = "file-info";
    GR.$(".photo-upload", form).appendChild(fileInfo);
    fileInput.addEventListener("change", function () {
      var n = fileInput.files.length;
      fileInfo.textContent = n ? "Обрано файлів: " + n + " — " + Array.prototype.map.call(fileInput.files, function (f) { return f.name; }).join(", ") : "";
    });

    GR.form(form, {
      rating: [rule.required("Оберіть оцінку від 1 до 5 зірок.")],
      text: [rule.required("Напишіть кілька слів про товар."), rule.minLength(10, "Відгук має містити щонайменше 10 символів.")],
      photos: [rule.files(3, 5)]
    }, function (v) {
      var all = GR.storage.get("gr_reviews", []);
      all.push({ id: p.id, rating: Number(v.rating), text: v.text.trim(), date: new Date().toISOString() });
      GR.storage.set("gr_reviews", all);
      window.location.href = "review-sent.html?id=" + p.id;
    }, { errorToast: "Перевірте оцінку та текст відгуку" });
  }

  var back = GR.$('.confirmation a[href="product.html"]');
  if (back && GR.param("id")) back.href = "product.html?id=" + encodeURIComponent(GR.param("id"));
})();
