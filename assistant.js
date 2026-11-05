(function (root, factory) {
  var isN = typeof module === "object" && module.exports;
  var api = factory(isN ? require("./knowledge.js") : root.ZunexKB, isN ? require("./knowledge-ml.js") : root.ZunexKBX, isN ? require("./lang.js") : root.ZunexLang);
  if (isN) module.exports = api; else root.ZunexAssistant = api;
})(typeof self !== "undefined" ? self : this, function (KB, X, LG) {
  "use strict";
  var T = LG.T, M = LG.M;

  function norm(s) {
    return String(s).replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase()
      .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o")
      .replace(/ç/g, "c").replace(/ə/g, "e").replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u").replace(/ё/g, "е");
  }
  function toks(s) { var n = norm(s).replace(/[^a-z0-9а-я]+/g, " ").trim(); return n ? n.split(" ") : []; }
  function joined(s) { return toks(s).join(" "); }
  function cap(w) { return w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1).toLocaleLowerCase("tr-TR"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function num(s) { return parseFloat(String(s).replace(",", ".")); }
  function fmt(n) {
    var s = String(+n.toPrecision(12));
    if (/e/.test(s)) return s.replace(".", ",");
    var p = s.split("."), i = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return p[1] ? i + "," + p[1] : i;
  }
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 1) return 2;
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) d[i] = [i];
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function W(words) { return new RegExp("(^|\\s)(?:" + words + ")(?=\\s|$)", "g"); }

  /* ---------- Matematik ---------- */
  var FN = {
    sqrt: function (x) { if (x < 0) throw { math: "sqrt" }; return Math.sqrt(x); }, abs: Math.abs,
    sin: function (x) { return Math.round(Math.sin(x * Math.PI / 180) * 1e12) / 1e12; },
    cos: function (x) { return Math.round(Math.cos(x * Math.PI / 180) * 1e12) / 1e12; },
    tan: function (x) { return Math.round(Math.tan(x * Math.PI / 180) * 1e12) / 1e12; },
    log: function (x) { if (x <= 0) throw { math: "log" }; return Math.log10(x); },
    ln: function (x) { if (x <= 0) throw { math: "log" }; return Math.log(x); }
  };
  var MERR = {
    tr: { div: "Sıfıra bölünemez.", sqrt: "Negatif bir sayının karekökü gerçek sayı değildir.", log: "Logaritma yalnızca pozitif sayılar için tanımlıdır.", fact: "Faktöriyel için 0–170 arası bir tam sayı gerekir.", big: "Sonuç çok büyük ya da tanımsız." },
    az: { div: "Sıfıra bölmək olmaz.", sqrt: "Mənfi ədədin kvadrat kökü həqiqi ədəd deyil.", log: "Loqarifm yalnız müsbət ədədlər üçün təyin olunub.", fact: "Faktorial üçün 0–170 arası tam ədəd lazımdır.", big: "Nəticə çox böyükdür və ya təyin olunmayıb." },
    en: { div: "Division by zero is undefined.", sqrt: "The square root of a negative number is not a real number.", log: "Logarithms are only defined for positive numbers.", fact: "Factorial needs a whole number from 0 to 170.", big: "The result is too large or undefined." },
    ru: { div: "На ноль делить нельзя.", sqrt: "Корень из отрицательного числа не является вещественным.", log: "Логарифм определён только для положительных чисел.", fact: "Для факториала нужно целое число от 0 до 170.", big: "Результат слишком велик или не определён." }
  };
  function fact(n) { if (n < 0 || n !== Math.floor(n) || n > 170) throw { math: "fact" }; var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function mathText(t) {
    var s = norm(t).replace(/(\d),(\d)/g, "$1.$2").replace(/[=?]/g, " ").replace(/(\d)\s*[xх]\s*(\d)/g, "$1*$2");
    s = s.replace(W("arti|plus|ustegel|плюс"), "$1+").replace(W("eksi|minus|cix|минус"), "$1-")
      .replace(W("carpi|kere|times|multiplied by|vurulsun|vur|умножить на|умножить"), "$1*")
      .replace(W("bolu|divided by|over|bol|разделить на|делить на"), "$1/")
      .replace(W("uzeri|to the power of|в степени"), "$1^").replace(W("squared|в квадрате|kvadrat"), "$1^2")
      .replace(W("mod"), "$1%").replace(W("karekok|kok|square root of|square root|корень из|корень"), "$1sqrt");
    return s.replace(W("kac eder|kac yapar|kactir|kac|eder|yapar|hesapla|hesaplar misin|hesap|sonucu|sonuc|nedir|ne kadar|bul|islem|lutfen|bana|what is|what s|whats|calculate|equals|how much is|how much|compute|solve|сколько будет|сколько|вычисли|посчитай|реши|hesabla|nece edir|nece|netice|ne qeder"), "$1 ").trim();
  }
  // null: matematik değil; {text}: sonuç ya da hata metni
  function evalMath(src, lang) {
    var s = mathText(src), tk = [], pos = 0, m, re = /\s*(\d+(?:\.\d+)?|[a-z]+|[-+*\/^%()!])/y, E = MERR[lang || "tr"];
    if (!s) return null;
    while (pos < s.length) {
      re.lastIndex = pos; m = re.exec(s);
      if (!m) { if (/^\s*$/.test(s.slice(pos))) break; return null; }
      tk.push(m[1]); pos = re.lastIndex;
    }
    var okId = { pi: 1, e: 1, sqrt: 1, abs: 1, sin: 1, cos: 1, tan: 1, log: 1, ln: 1 };
    for (var i = 0; i < tk.length; i++) if (/^[a-z]+$/.test(tk[i]) && !okId[tk[i]]) return null;
    if (!tk.some(function (x) { return /^\d/.test(x) || x === "pi" || x === "e"; }) || !tk.some(function (x) { return /^[-+*\/^%!]$/.test(x) || FN[x]; })) return null;
    var p = 0, SYN = { syn: 1 };
    function peek() { return tk[p]; } function next() { return tk[p++]; }
    function expr() { var v = term(); while (peek() === "+" || peek() === "-") { var o = next(), r = term(); v = o === "+" ? v + r : v - r; } return v; }
    function term() { var v = unary(); while (peek() === "*" || peek() === "/" || peek() === "%") { var o = next(), r = unary(); if (o === "*") v *= r; else { if (r === 0) throw { math: "div" }; v = o === "/" ? v / r : v % r; } } return v; }
    function unary() { if (peek() === "-") { next(); return -unary(); } if (peek() === "+") { next(); return unary(); } return pw(); }
    function pw() { var b = post(); if (peek() === "^") { next(); return Math.pow(b, unary()); } return b; }
    function post() { var v = atom(); while (peek() === "!") { next(); v = fact(v); } return v; }
    function atom() {
      var t = next();
      if (t === undefined) throw SYN;
      if (/^\d/.test(t)) return parseFloat(t);
      if (t === "(") { var v = expr(); if (next() !== ")") throw SYN; return v; }
      if (t === "pi") return Math.PI; if (t === "e") return Math.E;
      if (FN[t]) { var a; if (peek() === "(") { next(); a = expr(); if (next() !== ")") throw SYN; } else a = unary(); return FN[t](a); }
      throw SYN;
    }
    try {
      var v = expr();
      if (p < tk.length) return null;
      if (!isFinite(v)) return { text: E.big };
      return { text: fmt(v) + (/\b(sin|cos|tan)\b/.test(s) ? "  (°)" : "") };
    } catch (e) {
      if (e && e.math) return { text: E[e.math] || E.big };
      return null;
    }
  }

  var UNITS = { celsius: "c", santigrat: "c", selsi: "c", цельсия: "c", цельсий: "c", fahrenheit: "f", farenheyt: "f", фаренгейт: "f", km: "km", kilometre: "km", kilometr: "km", км: "km", километр: "km", километров: "km", mil: "mi", mile: "mi", miles: "mi", kilometers: "km", kilometres: "km", pounds: "lb", kilograms: "kg", meters: "m", metres: "m", миля: "mi", миль: "mi", мили: "mi", kg: "kg", kilo: "kg", kilogram: "kg", кг: "kg", килограмм: "kg", lb: "lb", pound: "lb", libre: "lb", funt: "lb", фунт: "lb", фунтов: "lb", metre: "m", metr: "m", m: "m", метр: "m", метров: "m", ft: "ft", feet: "ft", ayak: "ft", фут: "ft", футов: "ft" };
  var CONV = { "c>f": function (v) { return v * 9 / 5 + 32; }, "f>c": function (v) { return (v - 32) * 5 / 9; }, "km>mi": function (v) { return v * 0.621371; }, "mi>km": function (v) { return v * 1.609344; }, "kg>lb": function (v) { return v * 2.2046226; }, "lb>kg": function (v) { return v * 0.45359237; }, "m>ft": function (v) { return v * 3.280839895; }, "ft>m": function (v) { return v * 0.3048; } };
  var UNAME = { c: "°C", f: "°F", km: "km", mi: "mi", kg: "kg", lb: "lb", m: "m", ft: "ft" };
  function unitOf(x) { if (UNITS[x]) return UNITS[x]; for (var k in UNITS) if (k.length >= 5 && x.indexOf(k) === 0) return UNITS[k]; return null; }
  function unitConvert(t) {
    var nm = norm(t).match(/-?\d+(?:[.,]\d+)?/); if (!nm) return null;
    var u = toks(t).map(unitOf).filter(Boolean);
    if (u.length < 2 || u[0] === u[1] || !CONV[u[0] + ">" + u[1]]) return null;
    var v = num(nm[0]);
    return fmt(v) + " " + UNAME[u[0]] + " = " + fmt(CONV[u[0] + ">" + u[1]](v)) + " " + UNAME[u[1]];
  }
  function calcP(a, b) { return fmt(a) + " × " + fmt(b) + "% = " + fmt(a * b / 100); }
  function percent(t) {
    var n = norm(t), m = n.match(/(\d+(?:[.,]\d+)?)\W*[a-z]{0,4}\s+(?:yuzde|faiz)\s+(\d+(?:[.,]\d+)?)/);
    if (m) return calcP(num(m[1]), num(m[2]));
    m = n.match(/(\d+(?:[.,]\d+)?)\s*(?:%|percent|процент\w*|faiz\w*|yuzde)\s*(?:of|от|-?[a-z]{0,3})?\s*(\d+(?:[.,]\d+)?)/);
    if (m) return calcP(num(m[2]), num(m[1]));
    m = n.match(/(\d+(?:[.,]\d+)?)\W*[a-z]{0,4}\s+(\d+(?:[.,]\d+)?)\s*(?:faiz|%)/);
    return m ? calcP(num(m[1]), num(m[2])) : null;
  }
  function primeCheck(n, L) {
    var m = n.match(/(\d+)\D{0,14}(?:asal|sad[ae]|prime|простое|простой)/) || n.match(/(?:asal|sad[ae]|prime|простое|простой)\D{0,14}(\d+)/);
    if (!m) return null;
    var v = parseInt(m[1], 10);
    if (v > 1e12) return "≤ 10¹²";
    if (v < 2) return L.prime(v, false);
    for (var d = 2; d * d <= v; d++) if (v % d === 0) return L.prime(v, false, d);
    return L.prime(v, true);
  }

  /* ---------- Bilgi bankası ---------- */
  var FACTS = KB.facts.concat(X.more).map(function (f) { var tx = X.tx[f.t] || {}; return { t: f.t, c: X.cat[f.t] || "", k: f.k.concat(tx.k || []), a: f.a, tx: tx }; });
  var CATN = {
    tr: { sci: "Bilim ve teknoloji", hist: "Tarih", geo: "Coğrafya", math: "Matematik", phys: "Fizik", chem: "Kimya", bio: "Biyoloji", comp: "Bilgisayar ve yazılım", sport: "Spor", art: "Müzik ve sanat", edu: "Eğitim", life: "Günlük yaşam", job: "Meslekler" },
    az: { sci: "Elm və texnologiya", hist: "Tarix", geo: "Coğrafiya", math: "Riyaziyyat", phys: "Fizika", chem: "Kimya", bio: "Biologiya", comp: "Kompüter və proqram", sport: "İdman", art: "Musiqi və incəsənət", edu: "Təhsil", life: "Gündəlik həyat", job: "Peşələr" },
    en: { sci: "Science & technology", hist: "History", geo: "Geography", math: "Mathematics", phys: "Physics", chem: "Chemistry", bio: "Biology", comp: "Computers & software", sport: "Sports", art: "Music & art", edu: "Education", life: "Daily life", job: "Professions" },
    ru: { sci: "Наука и технологии", hist: "История", geo: "География", math: "Математика", phys: "Физика", chem: "Химия", bio: "Биология", comp: "Компьютеры и ПО", sport: "Спорт", art: "Музыка и искусство", edu: "Образование", life: "Повседневная жизнь", job: "Профессии" }
  };
  var CATW = { sport: /(spor|sport|futbol|football|basket|спорт|idman)/, art: /(muzik|music|sanat|\bart\b|resim|искусств|музык|incesenet|musiqi)/, chem: /(kimya|chem|хим|ximiya)/, bio: /(biyoloji|biolog|биолог)/, phys: /(fizik|physic|физик|fizika)/, math: /(matematik|math|математик|riyaziyyat)/, comp: /(bilgisayar|computer|yazilim|software|компьютер|komputer|proqram|programming)/, hist: /(tarih|history|истори|tarix)/, geo: /(cografya|geograph|географ|cografiya)/, edu: /(egitim|education|образован|tehsil|universite|university|университет)/, life: /(gunluk|daily life|быт|hayat|gundelik)/, job: /(meslek|profession|career|професси|pese)/, sci: /(bilim|science|наук|\belm\b)/ };
  function ftitle(f, l) { return l !== "tr" && f.tx[l] ? f.tx[l][0] : f.t; }
  function fans(f, l) { if (l === "tr") return f.a; if (f.tx[l]) return f.tx[l][1]; return T[l].onlyTr + "\n" + f.a; }
  function matchFacts(t) {
    var tk = toks(t), n = " " + tk.join(" ") + " ", out = [];
    FACTS.forEach(function (f) {
      var s = 0;
      f.k.forEach(function (k) {
        var w = 1; if (k.charAt(0) === "!") { w = 2; k = k.slice(1); }
        var hit = k.indexOf(" ") >= 0 ? n.indexOf(" " + k) >= 0 : tk.some(function (x) {
          if (k.length <= 3) return x === k;
          if (x.indexOf(k) === 0) return true;
          return k.length >= 5 && x.length >= 5 && lev(x.slice(0, k.length), k) <= 1;
        });
        if (hit) s += w;
      });
      if (s) out.push({ f: f, s: s });
    });
    return out.sort(function (a, b) { return b.s - a.s; });
  }
  var ALIAS = [];
  Object.keys(X.names).forEach(function (k) { ALIAS.push([k, k]); X.names[k].forEach(function (nm, i) { var a = norm(nm).replace(/[^a-zа-я0-9 ]+/g, " ").trim(); ALIAS.push([i === 1 && a.length >= 6 ? a.slice(0, -1) : a, k]); }); });
  Object.keys(KB.capitals).forEach(function (k) { ALIAS.push([k, k]); });
  Object.keys(X.extra).forEach(function (k) { ALIAS.push([k, X.extra[k]]); });
  ALIAS.sort(function (a, b) { return b[0].length - a[0].length; });
  function findCountry(t) {
    var tn = " " + joined(t) + " ";
    for (var i = 0; i < ALIAS.length; i++) { var a = ALIAS[i][0]; if (a.length <= 3 ? tn.indexOf(" " + a + " ") >= 0 : tn.indexOf(" " + a) >= 0) return ALIAS[i][1]; }
    return null;
  }
  function capAnswer(key, l) {
    var c = KB.capitals[key] || [cap(key), "?"], i = { en: 0, ru: 1, az: 2 }[l], city = c[1], cn = c[0];
    if (i !== undefined) { if (X.cities[city]) city = X.cities[city][i]; if (X.names[key]) cn = X.names[key][i]; }
    return T[l].cap(cn, city);
  }

  /* ---------- Metin, kod, hata araçları ---------- */
  var STOP = "bir bu ve ile icin gibi daha cok olan olarak kadar sonra ancak fakat ama the and for that with this from have are что как это для или при его ее они были ucun".split(" ");
  function sentences(t) { return (t.replace(/\s+/g, " ").trim().match(/[^.!?…]+[.!?…]*\s*/g) || []).map(function (s) { return s.trim(); }).filter(Boolean); }
  function summarize(t, L) {
    var ss = sentences(t);
    if (ss.length < 3) return L.sumShort;
    var f = {}; toks(t).forEach(function (w) { if (w.length >= 4 && STOP.indexOf(w) < 0) f[w] = (f[w] || 0) + 1; });
    var sc = ss.map(function (s, i) { var tk = toks(s), v = 0; tk.forEach(function (w) { v += f[w] || 0; }); return { i: i, v: v / Math.max(tk.length, 6) }; });
    var k = Math.min(3, Math.ceil(ss.length / 3));
    var pick = sc.slice().sort(function (a, b) { return b.v - a.v || a.i - b.i; }).slice(0, k).sort(function (a, b) { return a.i - b.i; });
    return L.sumHead + "\n" + pick.map(function (p) { return "• " + ss[p.i]; }).join("\n") + "\n" + L.sumNote(ss.length, k);
  }
  function fixText(t, l, L) {
    var o = t.replace(/\s+/g, " ").trim()
      .replace(/\s+([,.;:!?])/g, "$1").replace(/([,;:!?])(?=[^\s\d])/g, "$1 ").replace(/([.!?]){2,}/g, "$1")
      .replace(/(^|[.!?]\s+)(\S)/g, function (m, a, b) { return a + b.toLocaleUpperCase(l); });
    return L.fixHead + "\n" + o + "\n" + L.fixNote;
  }
  var CODE_SIG = /(```|\bdef\s+\w+\s*\(|\bfunction\b|=>|console\.log|\bprint\(|<\/?[a-z][a-z0-9]*[^>]*>|\bimport\s+\w+|#include|\bclass\s+\w+|\bfor\s*\(|\bwhile\s*\(|\bif\s*\(|\b(?:const|let|var)\s+\w+\s*=)/;
  var CODE = [
    [/\bdef\s+\w+|\bfunction\b|=>/, ["Fonksiyon tanımı", "Function definition", "Funksiya təyini", "Определение функции"]],
    [/\bfor\b|\bwhile\b/, ["Döngü", "Loop", "Dövr", "Цикл"]],
    [/\bif\b|\belse\b|\belif\b/, ["Koşul (if/else)", "Condition (if/else)", "Şərt (if/else)", "Условие (if/else)"]],
    [/console\.log|\bprint\(/, ["Ekrana yazdırma", "Prints output", "Ekrana çıxarış", "Вывод на экран"]],
    [/\bimport\b|require\(|#include/, ["Modül/kütüphane içe aktarma", "Imports a module/library", "Modul/kitabxana idxalı", "Импорт модуля/библиотеки"]],
    [/\bclass\s+\w+/, ["Sınıf tanımı", "Class definition", "Sinif təyini", "Определение класса"]],
    [/<\/?[a-z][a-z0-9]*[^>]*>/, ["HTML etiketleri", "HTML tags", "HTML teqləri", "HTML-теги"]],
    [/\b(?:const|let|var)\s+\w+\s*=|^\s*\w+\s*=\s*[^=]/m, ["Değişken atama", "Variable assignment", "Dəyişən təyini", "Присвоение переменной"]],
    [/\breturn\b/, ["Değer döndürme (return)", "Returns a value", "Dəyər qaytarma (return)", "Возврат значения"]]
  ];
  var LI = { tr: 0, en: 1, az: 2, ru: 3 };
  function codeLang(t) { return /#include/.test(t) ? "C/C++" : /<\/?[a-z]/i.test(t) ? "HTML" : /\bdef\s|\bprint\(|\belif\b/.test(t) && !/[{};]\s*$/m.test(t) ? "Python" : /function|=>|const |let |var |console\./.test(t) ? "JavaScript" : "?"; }
  function codeExplain(t, l, L) {
    var items = CODE.filter(function (c) { return c[0].test(t); }).map(function (c) { return "• " + c[1][LI[l]]; });
    return L.codeHead(codeLang(t)) + "\n" + (items.length ? items.join("\n") : "• —") + "\n" + L.codeNote;
  }
  var ERR = [
    [/cannot read propert(?:y|ies) of (?:undefined|null)|undefined is not an object/i, "Bir değişken undefined/null iken özelliğine erişiyorsun. Değişkenin atandığını ve nesnenin dolu olduğunu kontrol et.", "You’re accessing a property of a variable that is undefined/null. Check that it was assigned and the object exists.", "undefined/null olan dəyişənin xassəsinə müraciət edirsən. Dəyişənin təyin olunduğunu yoxla.", "Вы обращаетесь к свойству переменной, которая undefined/null. Проверьте, что она задана."],
    [/NameError|ReferenceError|is not defined/i, "Tanımlanmamış bir değişken ya da fonksiyon kullanıyorsun. Yazımı ve tanımlandığı yeri kontrol et.", "You’re using a variable or function that isn’t defined. Check the spelling and where it’s declared.", "Təyin olunmamış dəyişən və ya funksiyadan istifadə edirsən. Yazılışı və təyin yerini yoxla.", "Используется необъявленная переменная или функция. Проверьте написание и место объявления."],
    [/IndentationError|unexpected indent/i, "Girinti hatası: Python’da girintiler tutarlı olmalı (boşluk ve tab’ı karıştırma).", "Indentation error: Python needs consistent indentation (don’t mix spaces and tabs).", "Girinti xətası: Python-da girintilər ardıcıl olmalıdır (boşluq və tab qarışdırma).", "Ошибка отступа: в Python отступы должны быть единообразными (не смешивайте пробелы и табы)."],
    [/SyntaxError|unexpected token|invalid syntax/i, "Söz dizimi hatası: eksik ya da fazla parantez, tırnak, iki nokta veya virgül olabilir.", "Syntax error: a missing or extra bracket, quote, colon or comma is likely.", "Sintaksis xətası: çatışmayan və ya artıq mötərizə, dırnaq, iki nöqtə və ya vergül ola bilər.", "Синтаксическая ошибка: возможно, не хватает или лишняя скобка, кавычка, двоеточие или запятая."],
    [/ModuleNotFoundError|No module named|Cannot find module/i, "Modül kurulu değil ya da yolu yanlış: pip/npm ile kur veya import yolunu kontrol et.", "The module isn’t installed or the path is wrong: install it with pip/npm or check the import path.", "Modul quraşdırılmayıb və ya yol səhvdir: pip/npm ilə quraşdır, idxal yolunu yoxla.", "Модуль не установлен или путь неверен: установите через pip/npm или проверьте путь импорта."],
    [/IndexError|out of range|out of bounds/i, "Listede olmayan bir indekse erişiyorsun. İndeksin 0 ile uzunluk-1 arasında olduğundan emin ol.", "You’re accessing an index that doesn’t exist. Make sure it’s between 0 and length-1.", "Siyahıda olmayan indeksə müraciət edirsən. İndeksin 0 ilə uzunluq-1 arasında olduğundan əmin ol.", "Обращение к несуществующему индексу. Индекс должен быть от 0 до длина-1."],
    [/ZeroDivisionError|division by zero/i, "Sıfıra bölme: bölenin 0 olmadığını bölmeden önce kontrol et.", "Division by zero: check that the divisor isn’t 0 before dividing.", "Sıfıra bölmə: bölmədən əvvəl bölənin 0 olmadığını yoxla.", "Деление на ноль: проверьте, что делитель не равен 0."]
  ];
  function errExplain(t, l, L) { for (var i = 0; i < ERR.length; i++) if (ERR[i][0].test(t)) return L.errHead + "\n" + ERR[i][1 + LI[l]]; return null; }

  /* ---------- Dosyalar ---------- */
  function summarizeFile(f, L) {
    var kb = (f.size / 1024).toFixed(1).replace(".", ",") + " KB";
    if (f.kind === "image") return L.fImg(f.name, f.width ? f.width + "×" + f.height : "", kb);
    if (f.kind !== "text") return L.fBin(f.name, kb);
    var t = f.text || "", lines = t.split(/\r?\n/), ne = lines.filter(function (x) { return x.trim(); }), w = (t.match(/\S+/g) || []).length;
    var out = L.fTxt(f.name, lines.length, ne.length, w, t.length, kb);
    if (f.truncated) out += L.fTrunc;
    if (/\.json$/i.test(f.name)) { try { var j = JSON.parse(t); out += L.fJson(Array.isArray(j) ? L.fArr(j.length) : j && typeof j === "object" ? L.fObj(Object.keys(j).length) : String(typeof j)); } catch (e) { out += L.fJsonBad; } }
    if (/\.csv$/i.test(f.name)) out += L.fCsv(ne.length, (ne[0] || "").split(/[;,\t]/).length);
    var fr = {}; toks(t).forEach(function (x) { if (x.length >= 4 && STOP.indexOf(x) < 0) fr[x] = (fr[x] || 0) + 1; });
    var top = Object.keys(fr).sort(function (a, b) { return fr[b] - fr[a] || (a < b ? -1 : 1); }).slice(0, 5);
    if (top.length) out += "\n" + L.fTop + top.map(function (x) { return x + " (" + fr[x] + ")"; }).join(", ") + ".";
    if (ne.length) out += "\n" + L.fFirst + "\n" + ne.slice(0, 2).map(function (x) { return "› " + (x.length > 80 ? x.slice(0, 80) + "…" : x); }).join("\n");
    return out;
  }

  /* ---------- Yönlendirme ---------- */
  var YES = /^(evet|olur|tamam|aynen|dogru|he|beli|yes|yeah|yep|ok|okay|sure|да|ага|конечно)$/;
  var BADNAME = /^(ne|neydi|nedir|nə|nəydi)$/i;
  function nameSet(t) {
    var m = t.match(/(?:benim\s+|mənim\s+)?(?:adım|adim|ismim)\s+([^\s.,!?;:]+)/i) || t.match(/(?:my name is|call me)\s+([^\s.,!?;:]+)/i) || t.match(/(?:меня зовут|моё имя|мое имя)\s+([^\s.,!?;:]+)/i);
    return m && !BADNAME.test(m[1]) ? cap(m[1]) : null;
  }

  function route(t, st, now, lang) {
    var L = T[lang], n = joined(t), r;
    function ok(x, last) { st.last = last || ""; st.pending = null; return { text: x, known: true }; }

    if (st.pending && YES.test(n)) { st.lastFact = st.pending; return ok(fans(st.pending, lang)); }
    st.pending = null;

    if (/(adim ne\b|adim nedir|adimi biliyor|ben kimim|what s my name|what is my name|do you know my name|who am i|как меня зовут|меня как зовут)/.test(n)) return ok(L.nameQ(st.name));
    var nm = nameSet(t); if (nm) { st.name = nm; return ok(L.nameOk(nm)); }

    var sm = t.match(/^\s*(özetle|ozetle|summarize|summary|резюмируй|суммируй|кратко|xülasə et|xulase et)\s*[:\-–]?\s*([\s\S]+)/i);
    if (sm) return ok(summarize(sm[2], L));
    var fx = t.match(/^\s*(düzelt|duzelt|düzəlt|fix|edit|correct|исправь|отредактируй)\s*[:\-–]?\s*([\s\S]+)/i);
    if (fx) return ok(fixText(fx[2], lang, L));

    if (/(sen kimsin|^kimsin|sen kimsen|^kimsen|adin ne\b|ismin ne|kendini tanit|ozunu teqdim|ozunu tanit|who are you|what are you|introduce yourself|are you (an )?(ai|real|human|robot)|кто ты|ты кто|представься|ты человек|ты робот|sen insan|sen robot|yapay zeka mi)/.test(n)) return ok(L.who);
    if (/(internet|интернет|offline|oflayn|офлайн)/.test(n) && /(bagli|baglan|var mi|online|connect|подключ|работаешь|calis|isle|works|need|lazim)/.test(n)) return ok(L.net);
    if (/(neler yapabilirsin|ne yapabilirsin|neler biliyorsun|ne biliyorsun|^yardim$|nasil kullan|what can you do|what do you know|^help$|что ты умеешь|что умеешь|^помощь$|neler bilirsen|ne bilirsen|neler ede bilersen)/.test(n)) {
      var cs = {}; FACTS.forEach(function (f) { if (f.c) cs[f.c] = 1; }); cs.geo = 1;
      return ok(L.help(Object.keys(cs).map(function (c) { return CATN[lang][c]; }).join(", ")));
    }
    if (/(hatirliyor musun|hafiza|unutur musun|konustuklarimizi|do you remember|do you store|ты помнишь|помнишь|запоминаешь|yadda saxla|yadinda|xatirlayirsan)/.test(n)) return ok(L.mem);
    if (/^(tesekkur|sag ol|saol|eyvallah|thanks|thank you|thx|спасибо|благодарю|cox sag ol|minnetdaram|sagolun)/.test(n)) return ok(L.thanks);
    if (/^(gorusuruz|hosca kal|bye|goodbye|see you|до свидания|пока|gorusenedek)/.test(n)) return ok(L.bye);
    if (/(nasilsin|naber|ne haber|necesen|necesiz|how are you|how s it going|как дела|как ты|как поживаешь)/.test(n)) return ok(L.how(st.name));
    if (/^(merhaba|selam|selamlar|salam|hello|hi|hey|alo|gunaydin|sabahiniz|iyi gunler|iyi aksamlar|iyi geceler|good (morning|evening|afternoon)|привет|здравствуй|здравствуйте|добрый (день|вечер)|доброе утро|sabahin xeyir|axsamin xeyir|gunun xeyir)/.test(n)) return ok(L.hi(st.name));

    if (/(saat kac|saat neced|saat nece|what time|time is it|current time|который час|сколько времени)/.test(n)) return ok(L.time(pad(now.getHours()) + ":" + pad(now.getMinutes())));
    if (/(bugun.*(gun|tarih|tarix)|tarih ne|gunlerden|ayin kaci|hangi yil|neci gundur|ne gundur|what.*(date|day).*(today|is it)|today s date|what s the date|what day|какое сегодня|какое число|какой сегодня день|какой день)/.test(n))
      return ok(L.date(now.getDate(), M[lang].mo[now.getMonth()], now.getFullYear(), M[lang].dy[now.getDay()]));
    if (/(zar at|zer at|roll (a )?dic?e|^dice|бросить кубик|брось кубик|кубик)/.test(n)) return ok("🎲 " + (Math.floor(Math.random() * 6) + 1));
    if (/(yazi tura|yazi xett|flip (a )?coin|coin flip|heads or tails|подбрось монет|монетк|орел и решка)/.test(n)) return ok(L.coin[Math.random() < 0.5 ? 0 : 1]);
    if (/(rastgele sayi|random number|случайное число|tesadufi eded)/.test(n)) {
      var ns = (n.match(/\d+/g) || []).map(Number), lo = 1, hi = 100;
      if (ns.length >= 2) { lo = Math.min(ns[0], ns[1]); hi = Math.max(ns[0], ns[1]); }
      return ok(String(lo + Math.floor(Math.random() * (hi - lo + 1))));
    }

    if (/^(daha fazla|daha cok|daha etrafli|devam|biraz daha|more|tell me more|continue|go on|еще|подробнее|продолж|дальше|davam)/.test(n) && st.lastFact) {
      var cur = st.lastFact, cand = FACTS.filter(function (f) { return f.c && f.c === cur.c && f !== cur; }), tr = cand.filter(function (f) { return lang === "tr" || f.tx[lang]; });
      var rel = (tr.length ? tr : cand).slice(0, 4).map(function (f) { return ftitle(f, lang); });
      return ok(rel.length ? L.more(ftitle(cur, lang), rel.join(", ")) : L.nomore);
    }

    if ((r = primeCheck(n, L))) return ok(r);
    if ((r = percent(t))) return ok(r);
    if ((r = unitConvert(t))) return ok(r);
    var mr = evalMath(t, lang); if (mr) return ok(mr.text);

    var follow = st.last === "capital" && /^(peki|ya|bes|and|what about|а|а как|а если|bir de)\b/.test(n);
    if (/(baskent|paytaxt|capital|столиц)/.test(n) || follow) {
      var ck = findCountry(t);
      return ok(ck ? capAnswer(ck, lang) : L.capNo, "capital");
    }

    var er = errExplain(t, lang, L); if (er) return ok(er);
    if (t.length >= 12 && CODE_SIG.test(t)) return ok(codeExplain(t, lang, L));

    var ms = matchFacts(t);
    var yrs = t.match(/\b(1\d{3}|20\d{2})\b/g);
    if (ms.length && ms[0].s >= 2 && yrs && yrs.some(function (y) { return fans(ms[0].f, lang).indexOf(y) < 0 && ms[0].f.a.indexOf(y) < 0; }))
      return { text: L.unk(ftitle(ms[0].f, lang)), known: false };
    if (ms.length && ms[0].s >= 2) { st.lastFact = ms[0].f; return ok(fans(ms[0].f, lang)); }
    if (ms.length) { st.pending = ms[0].f; st.last = ""; return { text: L.sure(ftitle(ms[0].f, lang)), known: true }; }
    for (var c in CATW) if (CATW[c].test(n)) {
      var lst = FACTS.filter(function (f) { return f.c === c; }).slice(0, 6).map(function (f) { return ftitle(f, lang); });
      if (lst.length) return { text: L.unk(CATN[lang][c] + ": " + lst.join(", ")), known: false };
    }
    st.last = "";
    return { text: L.unk(""), known: false };
  }

  function reply(text, opts) {
    opts = opts || {};
    var st = opts.state || (opts.state = {}), files = opts.files || [], t = String(text || "").trim(), parts = [];
    if (st.name === undefined) st.name = "";
    var lang = opts.lang && T[opts.lang] ? opts.lang : (t ? LG.detect(t, st.lang || opts.uiLang) : (st.lang || opts.uiLang || "tr"));
    st.lang = lang;
    var L = T[lang];
    if (files.length) parts.push(files.map(function (f) { return summarizeFile(f, L); }).join("\n\n"));
    if (t) { var r = route(t, st, opts.now || new Date(), lang); if (r.known || !files.length) parts.push(r.text); }
    else if (!files.length) parts.push(L.empty);
    return parts.join("\n\n");
  }
  return { reply: reply, evalMath: evalMath, norm: norm, detect: LG.detect };
});
