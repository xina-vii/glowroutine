/* Beauty Quiz (7 кроків) на сторінці quiz.html та персональна рутина на result.html.
   Розмітка кроку — та сама, що у верстці ЛР № 3 (.quiz-options > .option > .option-card). */
(function () {
  "use strict";

  var QUESTIONS = [
    { key: "skin", eyebrow: "Ваш профіль шкіри", title: "Який у вас тип шкіри?", hint: "Оберіть варіант, який найкраще описує відчуття шкіри протягом дня.",
      options: ["Суха", "Жирна", "Комбінована", "Нормальна", "Не знаю"] },
    { key: "sensitivity", eyebrow: "Чутливість", title: "Наскільки чутлива ваша шкіра?", hint: "Подумайте, як шкіра реагує на нові засоби та погоду.",
      options: ["Не чутлива", "Іноді червоніє", "Дуже чутлива"] },
    { key: "concern", eyebrow: "Головна проблема", title: "Що турбує найбільше?", hint: "Оберіть одну основну турботу — на ній ми зробимо акцент.",
      options: ["Зневоднення", "Акне", "Пігментація", "Купероз", "Нічого особливого"] },
    { key: "goal", eyebrow: "Ваша ціль", title: "Чого ви хочете досягти?", hint: "Це допоможе підібрати правильні активи.",
      options: ["Здорове сяйво", "Глибоке зволоження", "Відновлення бар’єра", "Матування"] },
    { key: "exclude", eyebrow: "Склад", title: "Що виключити зі складу?", hint: "Можна обрати кілька варіантів або пропустити крок.", multi: true,
      options: ["Без спирту", "Без віддушок", "Без силіконів"] },
    { key: "budget", eyebrow: "Бюджет", title: "Який бюджет на один засіб?", hint: "Підбираємо ціну однієї позиції, а не всієї рутини.",
      options: ["До 700 ₴", "До 900 ₴", "Без обмежень"] },
    { key: "experience", eyebrow: "Досвід", title: "Як давно ви доглядаєте за шкірою?", hint: "Новачкам радимо простіші формули.",
      options: ["Тільки починаю", "Користуюсь регулярно", "Досвідчений користувач"] }
  ];
  var LETTERS = "ABCDEF";
  var KEY = "gr_quiz";

  /* ============================== Сторінка квізу ============================== */
  var form = GR.$(".quiz-shell");
  if (form) {
    var content = GR.$(".quiz-content", form);
    var legend = GR.$("legend", content);
    var eyebrow = GR.$(".eyebrow", content);
    var heading = GR.$("h1", content);
    var hint = GR.$(".text", content);
    var optionsBox = GR.$(".quiz-options", content);
    var metaSpans = GR.$$(".progress-meta span", form);
    var bar = GR.$(".progress", form);
    var barFill = GR.$("i", bar);
    var back = GR.$(".quiz-actions .btn-ghost", form);
    var next = GR.$(".quiz-actions .btn-primary", form);
    var err = document.createElement("p");
    err.className = "field-error quiz-error";
    err.id = "quizError";
    err.setAttribute("role", "alert");
    err.hidden = true;
    optionsBox.insertAdjacentElement("afterend", err);
    form.noValidate = true;

    var saved = GR.storage.get(KEY, null);
    var answers = (saved && saved.answers && GR.param("restart") !== "1") ? saved.answers : {};
    var step = 0;
    var interacted = false;

    function optionHTML(q, o, i) {
      var type = q.multi ? "checkbox" : "radio";
      var on = q.multi ? (answers[q.key] || []).indexOf(o) !== -1 : answers[q.key] === o;
      return '<label class="option"><input class="visually-hidden" type="' + type + '" name="' + q.key + '" value="' + GR.escape(o) + '"' + (on ? " checked" : "") + '>' +
        '<span class="option-card"><span class="letter">' + LETTERS.charAt(i) + '</span><b>' + GR.escape(o) + '</b>' + GR.icon("check") + '</span></label>';
    }

    function render() {
      var q = QUESTIONS[step], n = QUESTIONS.length;
      var pct = Math.round((step + 1) / n * 100);
      legend.textContent = q.title;
      eyebrow.textContent = q.eyebrow;
      heading.textContent = q.title;
      heading.tabIndex = -1;
      hint.textContent = q.hint;
      optionsBox.innerHTML = q.options.map(function (o, i) { return optionHTML(q, o, i); }).join("");
      metaSpans[0].textContent = "Крок " + (step + 1) + " з " + n;
      metaSpans[1].textContent = pct + "%";
      bar.setAttribute("aria-valuenow", pct);
      barFill.style.width = pct + "%";
      back.disabled = step === 0;
      next.innerHTML = (step === n - 1 ? "Показати результат " : "Далі ") + GR.icon("arrow", "icon-md");
      err.hidden = true;
      document.title = "Beauty Quiz — крок " + (step + 1) + " — GlowRoutine";
      if (interacted) heading.focus({ preventScroll: true });
    }

    function hasAnswer(q) { var a = answers[q.key]; return q.multi ? true : !!a; }

    function persist() { GR.storage.set(KEY, { answers: answers, done: false }); }

    optionsBox.addEventListener("change", function (e) {
      var q = QUESTIONS[step], inp = e.target;
      interacted = true;
      if (q.multi) answers[q.key] = GR.$$("input:checked", optionsBox).map(function (i) { return i.value; });
      else answers[q.key] = inp.value;
      err.hidden = true;
      persist();
    });

    back.addEventListener("click", function () { if (step > 0) { step--; interacted = true; render(); } });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = QUESTIONS[step];
      if (!hasAnswer(q)) {
        err.textContent = "Оберіть варіант відповіді, щоб продовжити.";
        err.hidden = false;
        GR.$("input", optionsBox).focus();
        return;
      }
      interacted = true;
      if (step < QUESTIONS.length - 1) { step++; render(); return; }
      GR.storage.set(KEY, { answers: answers, done: true });
      window.location.href = "result.html";
    });

    render();
    GR.quiz = { questions: QUESTIONS };
  }

  /* ========================== Сторінка результату ============================ */
  var hero = GR.$(".result-hero");
  if (!hero) return;

  var data = GR.storage.get(KEY, null);
  if (!data || !data.done) return;            // немає пройденого тесту — лишаємо статичний приклад із верстки
  var a = data.answers;

  var SKIN = { "Суха": ["dry", "сухої"], "Жирна": ["oily", "жирної"], "Комбінована": ["combo", "комбінованої"], "Нормальна": ["normal", "нормальної"], "Не знаю": [null, "вашої"] };
  var GOAL_PHRASE = { "Здорове сяйво": "зі здоровим сяйвом", "Глибоке зволоження": "з глибоким зволоженням", "Відновлення бар’єра": "з відновленим бар’єром", "Матування": "без жирного блиску" };
  var skinKey = (SKIN[a.skin] || [null])[0];
  var budget = a.budget === "До 700 ₴" ? 700 : a.budget === "До 900 ₴" ? 900 : Infinity;

  function score(p) {
    var s = 0;
    if (skinKey && p.skin.indexOf(skinKey) !== -1) s += 3; else if (!skinKey) s += 1;
    if (a.concern && p.concerns.indexOf(a.concern) !== -1) s += 3;
    if (a.goal === "Глибоке зволоження" && p.concerns.indexOf("Зневоднення") !== -1) s += 1;
    if (a.goal === "Здорове сяйво" && p.concerns.indexOf("Пігментація") !== -1) s += 1;
    if (a.goal === "Відновлення бар’єра" && p.category === "moisturizer") s += 1;
    if (a.goal === "Матування" && p.skin.indexOf("oily") !== -1) s += 1;
    (a.exclude || []).forEach(function (t) { s += p.safe.indexOf(t) !== -1 ? 1 : -3; });
    if (a.sensitivity === "Дуже чутлива") s += p.safe.indexOf("Без віддушок") !== -1 ? 2 : -2;
    s += p.price <= budget ? 1 : -2;
    return s + p.rating / 10;
  }

  function best(cat) {
    return GR.products.filter(function (p) { return p.category === cat; })
      .map(function (p) { return { p: p, s: score(p) }; })
      .sort(function (x, y) { return y.s - x.s; })[0];
  }

  var AM = [["cleanser", "Очищення"], ["serum", "Сироватка"], ["moisturizer", "Зволоження"], ["spf", "SPF"]];
  var PM = [["cleanser", "Очищення"], ["toner", "Тонізація"], ["serum", "Активна сироватка"], ["moisturizer", "Відновлення"]];
  var picks = {};
  AM.concat(PM).forEach(function (st) { if (!picks[st[0]]) picks[st[0]] = best(st[0]); });

  function cardHTML(step, i) {
    var pick = picks[step[0]], p = pick.p;
    var pct = Math.max(80, Math.min(99, Math.round(76 + pick.s * 2)));
    return '<li class="routine-card" data-id="' + p.id + '"><span class="step-num">0' + (i + 1) + '</span>' +
      '<a href="product.html?id=' + p.id + '"><img src="' + GR.photo(p.photo, 600) + '" alt="' + GR.escape(p.short) + '" loading="lazy" width="600" height="440"></a>' +
      '<div><small>' + step[1] + '</small><b>' + GR.escape(p.name) + '</b><span>' + GR.escape(p.brand) + '</span></div>' +
      '<strong>' + GR.money(p.price) + '</strong>' +
      '<span class="fit">' + GR.icon("check", "icon-xs") + ' ' + pct + '% match</span></li>';
  }

  GR.$("#routine-am").innerHTML = AM.map(cardHTML).join("");
  GR.$("#routine-pm").innerHTML = PM.map(cardHTML).join("");

  var unique = Object.keys(picks).map(function (k) { return picks[k].p; });
  var total = unique.reduce(function (s, p) { return s + p.price; }, 0);

  GR.$("h1", hero).innerHTML = "Рутина для " + (SKIN[a.skin] || [0, "вашої"])[1] + " шкіри,<br> " + (GOAL_PHRASE[a.goal] || "створена для вас");
  GR.$(".text", hero).textContent = "Ми врахували тип шкіри, чутливість і вашу ціль" + (a.concern && a.concern !== "Нічого особливого" ? " — «" + a.concern.toLowerCase() + "»" : "") + ".";
  var chips = [a.skin, a.sensitivity !== "Не чутлива" ? a.sensitivity : null, a.concern !== "Нічого особливого" ? a.concern : null, a.experience]
    .concat(a.exclude || []).filter(Boolean);
  GR.$(".profile-chips", hero).innerHTML = chips.map(function (c) { return "<li>" + GR.escape(c) + "</li>"; }).join("");

  GR.$(".routine-total b").textContent = GR.money(total);
  GR.$(".routine-total p span").textContent = total >= GR.FREE_SHIPPING ? "Безкоштовна доставка від " + GR.money(GR.FREE_SHIPPING) : "До безкоштовної доставки ще " + GR.money(GR.FREE_SHIPPING - total);

  var addAll = GR.$('.routine-total a[href="cart.html"]');
  addAll.addEventListener("click", function (e) {
    e.preventDefault();
    unique.forEach(function (p) { GR.store.addToCart(p.id, { silent: true }); });
    GR.toast("Рутину додано в кошик: " + unique.length + " " + GR.pluralize(unique.length, "товар", "товари", "товарів"));
    setTimeout(function () { window.location.href = "cart.html"; }, 700);
  });

  var retake = document.createElement("p");
  retake.className = "retake";
  retake.innerHTML = '<a class="inline-link" href="quiz.html?restart=1">Пройти тест ще раз</a>';
  GR.$(".routine-total").insertAdjacentElement("afterend", retake);
})();
