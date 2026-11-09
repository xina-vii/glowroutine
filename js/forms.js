/* Клієнтська перевірка форм: правила, повідомлення про помилки, маска телефону.
   GR.form(form, rules, onSubmit) використовують оформлення замовлення, відгук,
   швидке замовлення, промокод, а також форма підписки у підвалі кожної сторінки. */
(function () {
  "use strict";

  /* ---------- Бібліотека правил: кожне правило повертає текст помилки або "" ---------- */
  var rule = GR.rules = {
    required: function (msg) {
      return function (v, el) {
        if (el && el.type === "checkbox") return el.checked ? "" : msg;
        return String(v).trim() ? "" : msg;
      };
    },
    minLength: function (n, msg) {
      return function (v) { v = String(v).trim(); return v && v.length < n ? msg : ""; };
    },
    maxLength: function (n, msg) {
      return function (v) { return String(v).trim().length > n ? msg : ""; };
    },
    pattern: function (re, msg) {
      return function (v) { v = String(v).trim(); return v && !re.test(v) ? msg : ""; };
    },
    name: function () {
      return rule.pattern(/^[\p{L}][\p{L}\s'’\-]*$/u, "Ім’я може містити лише літери, пробіли, апостроф і дефіс.");
    },
    email: function () {
      return rule.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Невірний формат email. Приклад: name@example.com");
    },
    phone: function () {
      return function (v) {
        v = String(v).replace(/[\s\-()]/g, "");
        return v && !/^\+380\d{9}$/.test(v) ? "Телефон має бути у форматі +380XXXXXXXXX." : "";
      };
    },
    files: function (max, maxMb) {
      return function (v, el) {
        var list = el.files ? Array.prototype.slice.call(el.files) : [];
        if (list.length > max) return "Можна додати не більше " + max + " фото.";
        for (var i = 0; i < list.length; i++) {
          if (!/^image\/(jpeg|png)$/.test(list[i].type)) return "Файл «" + list[i].name + "» має бути у форматі JPG або PNG.";
          if (list[i].size > maxMb * 1024 * 1024) return "Файл «" + list[i].name + "» більший за " + maxMb + " МБ.";
        }
        return "";
      };
    }
  };

  /* ---------- Маска телефону +380 XX XXX XX XX ---------- */
  GR.phoneMask = function (input) {
    function format() {
      var d = input.value.replace(/\D/g, "");
      if (!d) { input.value = ""; return; }
      if (d.indexOf("380") === 0) d = d.slice(3);
      else if (d.charAt(0) === "0") d = d.slice(1);
      d = d.slice(0, 9);
      var out = "+380";
      var parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)];
      parts.forEach(function (p) { if (p) out += " " + p; });
      input.value = out;
    }
    input.addEventListener("input", format);
    input.addEventListener("focus", function () { if (!input.value) input.value = "+380 "; });
    input.addEventListener("blur", function () { if (input.value.trim() === "+380") input.value = ""; });
  };

  /* ---------- Контролер форми ---------- */
  var uid = 0;

  GR.form = function (form, rules, onSubmit, opts) {
    opts = opts || {};
    form.noValidate = true;                       // замість вбудованих «бульбашок» браузера — власні повідомлення
    var touched = {};
    var names = Object.keys(rules);
    uid += 1;

    function controls(name) {
      var c = form.elements[name];
      if (!c) return [];
      return (c.length !== undefined && !c.tagName) ? Array.prototype.slice.call(c) : [c];
    }
    function valueOf(name) {
      var list = controls(name);
      if (!list.length) return "";
      if (list[0].type === "radio") { var on = list.filter(function (r) { return r.checked; })[0]; return on ? on.value : ""; }
      if (list[0].type === "checkbox") return list[0].checked ? list[0].value : "";
      return list[0].value;
    }

    /* Елемент для тексту помилки: усередині label.field / fieldset, або після самого елемента */
    var hosts = {};
    function errorEl(name) {
      if (hosts[name]) return hosts[name];
      var el = controls(name)[0];
      var p = document.createElement("span");
      p.className = "field-error" + (opts.onDark ? " on-dark" : "");
      p.id = "err-" + uid + "-" + name;
      p.setAttribute("role", "alert");
      p.hidden = true;
      var label = el.closest("label.field");
      var group = el.type === "radio" ? el.closest("fieldset") : null;
      if (label) {
        label.appendChild(p);
        if (!el.hasAttribute("aria-label") && label.firstChild && label.firstChild.nodeType === 3)
          el.setAttribute("aria-label", label.firstChild.textContent.trim());   // щоб текст помилки не потрапляв у назву поля
      } else if (group) group.appendChild(p);
      else if (opts.errorAfter) opts.errorAfter.insertAdjacentElement("afterend", p);
      else el.insertAdjacentElement("afterend", p);
      hosts[name] = p;
      return p;
    }

    function check(name) {
      var list = controls(name);
      if (!list.length) return true;
      var v = valueOf(name), msg = "";
      var fns = [].concat(rules[name]);
      for (var i = 0; i < fns.length && !msg; i++) msg = fns[i](v, list[0], form);
      var out = errorEl(name);
      out.textContent = msg;
      out.hidden = !msg;
      var wrap = list[0].closest("label.field, fieldset") || list[0].parentNode;
      wrap.classList.toggle("has-error", !!msg);
      wrap.classList.toggle("is-valid", !msg && String(v).trim() !== "" && !opts.noValid);
      list.forEach(function (c) {
        c.setAttribute("aria-invalid", msg ? "true" : "false");
        if (msg) c.setAttribute("aria-describedby", out.id); else c.removeAttribute("aria-describedby");
      });
      return !msg;
    }

    names.forEach(function (name) {
      controls(name).forEach(function (el) {
        var evt = (el.type === "checkbox" || el.type === "radio" || el.type === "file" || el.tagName === "SELECT") ? "change" : "input";
        el.addEventListener("blur", function () { touched[name] = true; check(name); });
        el.addEventListener(evt, function () { if (touched[name]) check(name); });
      });
    });

    function validate() {
      var first = null;
      names.forEach(function (name) {
        touched[name] = true;
        if (!check(name) && !first) first = controls(name)[0];
      });
      return first;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = validate();
      if (bad) {
        bad.focus();
        GR.toast(opts.errorToast || "Перевірте виділені поля форми", true);
        return;
      }
      var values = {};
      names.forEach(function (n) { values[n] = valueOf(n); });
      onSubmit(values, form);
    });

    return {
      check: check,
      validate: validate,
      reset: function () {
        form.reset(); touched = {};
        names.forEach(function (n) {
          var out = hosts[n]; if (out) { out.textContent = ""; out.hidden = true; }
          controls(n).forEach(function (c) { c.removeAttribute("aria-describedby"); c.removeAttribute("aria-invalid"); });
          var wrap = controls(n)[0] && (controls(n)[0].closest("label.field, fieldset") || controls(n)[0].parentNode);
          if (wrap) wrap.classList.remove("has-error", "is-valid");
        });
      }
    };
  };

  /* ---------- Форма підписки у підвалі (є на кожній сторінці) ---------- */
  var footerForm = GR.$(".footer-input");
  if (footerForm) {
    GR.form(footerForm, { email: [rule.required("Вкажіть email."), rule.email()] }, function (v, f) {
      GR.storage.set("gr_subscriber", { email: v.email.trim(), date: new Date().toISOString() });
      GR.toast("Дякуємо! Підписку на " + v.email.trim() + " оформлено.");
      f.reset();
    }, { onDark: true, noValid: true, errorAfter: footerForm, errorToast: "Перевірте email" });
  }
})();
