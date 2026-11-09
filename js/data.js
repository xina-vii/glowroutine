/* Дані каталогу GlowRoutine (навчальний набір).
   Перші чотири товари — ті самі, що показані у верстці ЛР № 3; решта додана,
   щоб фільтри та підбір рутини мали з чого вибирати. */
window.GR = window.GR || {};

(function () {
  "use strict";

  var IMG = "https://images.unsplash.com/photo-";
  function img(code, w) { return IMG + code + "?auto=format&fit=crop&w=" + w + "&q=85"; }

  var PHOTOS = {
    serum: "1667266543254-505cf5b16ec4",
    cleanser: "1585652757141-8837d676fac8",
    essence: "1631730486572-226d1f595b68",
    cream: "1638609927252-9982beed7af8",
    set: "1598528738936-c50861cc75a9"
  };

  GR.photo = function (key, w) { return img(PHOTOS[key], w || 900); };

  /* category: cleanser | toner | serum | moisturizer | spf
     safe — позначки «Склад і безпека»; concerns — «Проблема шкіри»;
     skin — типи шкіри, яким підходить (dry, oily, combo, normal) */
  GR.products = [
    { id: 1, brand: "Beauty of Joseon", name: "Glow Serum Propolis + Niacinamide", short: "Glow Serum", price: 720, rating: 4.9, reviews: 128, popularity: 98, isNew: false,
      badge: "Top TikTok", category: "serum", photo: "serum",
      safe: ["Без спирту", "Без силіконів"], concerns: ["Акне", "Пігментація"], skin: ["combo", "oily", "normal"],
      desc: "Сяюча сироватка з 60% прополісу та 2% ніацинаміду заспокоює запалення, вирівнює тон і повертає природне сяйво.",
      actives: [["60%", "прополіс"], ["2%", "ніацинамід"], ["0.5%", "BHA"]],
      inci: "Propolis Extract, Dipropylene Glycol, Glycerin, Niacinamide, Melaleuca Alternifolia Leaf Extract, Sodium Hyaluronate, Salicylic Acid.",
      am: "2–3 краплі після тонера, перед кремом та SPF.", pm: "Нанесіть на чисту шкіру, уникаючи зони навколо очей." },
    { id: 2, brand: "Round Lab", name: "1025 Dokdo Cleanser", short: "Dokdo Cleanser", price: 590, rating: 4.8, reviews: 96, popularity: 94, isNew: false,
      badge: "Vegan", category: "cleanser", photo: "cleanser",
      safe: ["Без спирту", "Без віддушок"], concerns: ["Акне", "Зневоднення"], skin: ["oily", "combo", "normal", "dry"],
      desc: "М'який гель-пінка з морською водою Докдо очищає пори без відчуття стягнутості.",
      actives: [["pH 5.5", "баланс"], ["0%", "спирт"], ["3", "екстракти"]],
      inci: "Water, Glycerin, Cocamidopropyl Betaine, Sea Water, Sodium Lauroyl Glutamate, Panthenol.",
      am: "Вспініть на вологих руках і помасажуйте обличчя 30 секунд.", pm: "Використовуйте як другий етап після олії для зняття макіяжу." },
    { id: 3, brand: "Dr. Ceuracle", name: "Vegan Kombucha Tea Essence", short: "Kombucha Essence", price: 1190, rating: 4.7, reviews: 64, popularity: 81, isNew: false,
      badge: "Cruelty-Free", category: "toner", photo: "essence",
      safe: ["Без спирту", "Без віддушок", "Без силіконів"], concerns: ["Зневоднення", "Пігментація"], skin: ["dry", "combo", "normal"],
      desc: "Есенція з ферментованого чаю комбуча: зволожує, вирівнює тон і готує шкіру до наступних кроків.",
      actives: [["80%", "комбуча"], ["4%", "бетаїн"], ["0%", "спирт"]],
      inci: "Kombucha Ferment, Betaine, Glycerin, Sodium Hyaluronate, Allantoin, Panthenol.",
      am: "Нанесіть на очищену шкіру долонями, злегка поплескуючи.", pm: "Наносьте у 2 шари для максимального зволоження." },
    { id: 4, brand: "Purito", name: "Oat-in Calming Gel Cream", short: "Oat-in Gel Cream", price: 760, rating: 4.9, reviews: 142, popularity: 97, isNew: false,
      badge: "Vegan", category: "moisturizer", photo: "cream",
      safe: ["Без спирту", "Без віддушок"], concerns: ["Купероз", "Зневоднення"], skin: ["dry", "combo", "normal", "oily"],
      desc: "Легкий гель-крем з вівсом заспокоює почервоніння та відновлює бар'єр шкіри.",
      actives: [["5%", "овес"], ["2%", "пантенол"], ["1%", "церамід"]],
      inci: "Water, Avena Sativa Kernel Extract, Panthenol, Ceramide NP, Glycerin, Allantoin.",
      am: "Нанесіть тонким шаром перед SPF.", pm: "Нанесіть вечірнім останнім кроком, масажуючи до повного вбирання." },
    { id: 5, brand: "Round Lab", name: "Birch Juice Moisturizing Toner", short: "Birch Juice Toner", price: 560, rating: 4.7, reviews: 77, popularity: 85, isNew: true,
      badge: "Новинка", category: "toner", photo: "cleanser",
      safe: ["Без спирту", "Без силіконів"], concerns: ["Зневоднення"], skin: ["dry", "normal", "combo"],
      desc: "Тонер із березовим соком: легка текстура, миттєве відчуття свіжості та комфорту.",
      actives: [["80%", "березовий сік"], ["3%", "гліцерин"], ["0%", "спирт"]],
      inci: "Betula Platyphylla Japonica Juice, Glycerin, Butylene Glycol, Panthenol, Sodium Hyaluronate.",
      am: "Нанесіть на ватний диск або долоні одразу після вмивання.", pm: "Ввечері можна використовувати як зволожувальну маску-компрес." },
    { id: 6, brand: "Beauty of Joseon", name: "Relief Sun: Rice + Probiotics SPF50+", short: "Relief Sun SPF50+", price: 640, rating: 4.9, reviews: 211, popularity: 99, isNew: false,
      badge: "Хіт", category: "spf", photo: "set",
      safe: ["Без спирту", "Без віддушок"], concerns: ["Пігментація", "Купероз"], skin: ["dry", "oily", "combo", "normal"],
      desc: "Легкий сонцезахисний крем без білого нальоту, з рисовим екстрактом та пробіотиками.",
      actives: [["SPF50+", "PA++++"], ["30%", "рисовий екстракт"], ["0%", "спирт"]],
      inci: "Oryza Sativa Extract, Glycerin, Niacinamide, Lactobacillus Ferment, Tocopherol.",
      am: "Нанесіть за 15 хвилин до виходу на сонце; оновлюйте кожні 2–3 години.", pm: "Ввечері змийте гідрофільною олією та очищувальним гелем." },
    { id: 7, brand: "Purito", name: "Centella Unscented Serum", short: "Centella Serum", price: 680, rating: 4.6, reviews: 58, popularity: 79, isNew: false,
      badge: "Vegan", category: "serum", photo: "serum",
      safe: ["Без спирту", "Без віддушок", "Без силіконів"], concerns: ["Акне", "Купероз"], skin: ["oily", "combo", "normal", "dry"],
      desc: "Заспокійлива сироватка з центелою без віддушок — для чутливої та схильної до висипань шкіри.",
      actives: [["49%", "центела"], ["1%", "мадекасосид"], ["0%", "віддушки"]],
      inci: "Centella Asiatica Extract, Glycerin, Madecassoside, Panthenol, Allantoin.",
      am: "2–3 краплі на очищену шкіру, далі — крем та SPF.", pm: "Наносіть після тонера; уникайте зони навколо очей." },
    { id: 8, brand: "Dr. Ceuracle", name: "Panthenol Barrier Repair Cream", short: "Panthenol Cream", price: 850, rating: 4.5, reviews: 39, popularity: 70, isNew: true,
      badge: "Новинка", category: "moisturizer", photo: "cream",
      safe: ["Без спирту"], concerns: ["Купероз", "Зневоднення"], skin: ["dry", "normal"],
      desc: "Насичений крем із пантенолом для відновлення бар'єра та зменшення сухості й подразнень.",
      actives: [["5%", "пантенол"], ["3%", "шиа-олія"], ["2%", "церамід"]],
      inci: "Water, Panthenol, Butyrospermum Parkii Butter, Ceramide NP, Dimethicone, Glycerin.",
      am: "Невелика кількість перед SPF, якщо шкіра дуже суха.", pm: "Щедрий шар на ніч як останній крок рутини." }
  ];

  GR.categoryNames = { cleanser: "Очищення", toner: "Тонізація", serum: "Сироватки", moisturizer: "Зволоження", spf: "SPF-захист" };

  /* Безкоштовна доставка та тарифи (як у верстці: «від 1 500 ₴», «від 70 ₴», «від 50 ₴») */
  GR.FREE_SHIPPING = 1500;
  GR.DELIVERY = { "Нова Пошта": 70, "Укрпошта": 50, "Meest": 50 };
  GR.BONUS = 120;
  GR.PROMOS = { GLOW10: 0.10, WELCOME: 0.15 };
})();
