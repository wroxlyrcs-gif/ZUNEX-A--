(function (root, factory) {
  var x = factory();
  if (typeof module === "object" && module.exports) module.exports = x; else root.ZunexLang = x;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var NAMES = { tr: "Türkçe", az: "Azərbaycan dili", en: "English", ru: "Русский" };
  var M = {
    tr: { mo: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"], dy: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"] },
    az: { mo: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"], dy: ["bazar", "bazar ertəsi", "çərşənbə axşamı", "çərşənbə", "cümə axşamı", "cümə", "şənbə"] },
    en: { mo: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], dy: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
    ru: { mo: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"], dy: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"] }
  };
  var AZW = "necə nədir nə haradır paytaxtı mənim zəhmət neçə hesabla xülasə düzəlt kimsən bilirsən nələr salam üçün və bugün sağ olun bəs".split(" ");
  var TRW = "nedir nerede neresi başkenti benim kaç hesapla özetle düzelt kimsin biliyorsun neler merhaba için ve bugün nasılsın teşekkürler evet peki".split(" ");
  var ENW = "the what is how who hello hi capital of are you my name calculate summarize fix thanks please tell me more and why does".split(" ");
  function detect(t, prev) {
    if (/[а-яё]/i.test(t)) return "ru";
    var s = t.toLowerCase(), w = s.split(/[^a-zəğıöşüç]+/), a = /ə/.test(s) ? 3 : 0, r = 0, e = 0;
    w.forEach(function (x) { if (AZW.indexOf(x) >= 0) a++; if (TRW.indexOf(x) >= 0) r++; if (ENW.indexOf(x) >= 0) e++; });
    if (!a && !r && !e) return prev || "tr";
    return a > r && a >= e ? "az" : r >= e ? "tr" : "en";
  }

  var UI = {
    tr: { sub: "Yerel asistan · internetsiz çalışır", ph: "Zunex AI’a bir şey yaz…", newc: "Yeni sohbet", set: "Ayarlar", hist: "Sohbetler", none: "Henüz sohbet yok", lang: "Dil", auto: "Otomatik algıla", theme: "Tema", sys: "Sistem", light: "Aydınlık", dark: "Karanlık", name: "Adın", save: "Kaydet", clearAll: "Tüm sohbetleri sil", confirm: "Tüm sohbetler ve ad silinsin mi?", close: "Kapat", note: "Enter ile gönder, Shift+Enter ile yeni satır", h2: "Merhaba, ben Zunex AI", intro: "Tarayıcında yerel çalışan bir asistanım: hesap, bilgi soruları, metin özetleme, kod açıklama ve dosya analizi. Bilmediğimi açıkça söylerim.", chips: ["Bana kendini tanıt", "(12+8)*3 kaç eder?", "Fransa’nın başkenti neresi?", "Neler biliyorsun?"], big: "çok büyük (en fazla 8 MB)", file: "(dosya gönderildi)", del: "Sil" },
    az: { sub: "Lokal köməkçi · internetsiz işləyir", ph: "Zunex AI-a nəsə yaz…", newc: "Yeni söhbət", set: "Ayarlar", hist: "Söhbətlər", none: "Hələ söhbət yoxdur", lang: "Dil", auto: "Avtomatik aşkarla", theme: "Tema", sys: "Sistem", light: "İşıqlı", dark: "Qaranlıq", name: "Adın", save: "Yadda saxla", clearAll: "Bütün söhbətləri sil", confirm: "Bütün söhbətlər və ad silinsin?", close: "Bağla", note: "Enter ilə göndər, Shift+Enter ilə yeni sətir", h2: "Salam, mən Zunex AI-yam", intro: "Brauzerində lokal işləyən köməkçiyəm: hesablama, məlumat sualları, mətn xülasəsi, kod izahı və fayl təhlili. Bilmədiyimi açıq deyirəm.", chips: ["Özünü təqdim et", "(12+8)*3 neçə edir?", "Fransanın paytaxtı haradır?", "Nələr bilirsən?"], big: "çox böyükdür (maks. 8 MB)", file: "(fayl göndərildi)", del: "Sil" },
    en: { sub: "Local assistant · works offline", ph: "Write something to Zunex AI…", newc: "New chat", set: "Settings", hist: "Chats", none: "No chats yet", lang: "Language", auto: "Auto-detect", theme: "Theme", sys: "System", light: "Light", dark: "Dark", name: "Your name", save: "Save", clearAll: "Delete all chats", confirm: "Delete all chats and your name?", close: "Close", note: "Enter to send, Shift+Enter for a new line", h2: "Hi, I’m Zunex AI", intro: "A local assistant running in your browser: math, general knowledge, text summaries, code explanation and file analysis. I’ll tell you plainly when I don’t know something.", chips: ["Introduce yourself", "What is (12+8)*3?", "What is the capital of France?", "What do you know?"], big: "is too large (max 8 MB)", file: "(file sent)", del: "Delete" },
    ru: { sub: "Локальный помощник · работает офлайн", ph: "Напишите Zunex AI…", newc: "Новый чат", set: "Настройки", hist: "Чаты", none: "Чатов пока нет", lang: "Язык", auto: "Определять автоматически", theme: "Тема", sys: "Системная", light: "Светлая", dark: "Тёмная", name: "Ваше имя", save: "Сохранить", clearAll: "Удалить все чаты", confirm: "Удалить все чаты и имя?", close: "Закрыть", note: "Enter — отправить, Shift+Enter — новая строка", h2: "Привет, я Zunex AI", intro: "Локальный помощник в вашем браузере: вычисления, общие знания, краткое изложение текста, объяснение кода и анализ файлов. Если чего-то не знаю — скажу честно.", chips: ["Представься", "Сколько будет (12+8)*3?", "Какая столица Франции?", "Что ты умеешь?"], big: "слишком большой (макс. 8 МБ)", file: "(файл отправлен)", del: "Удалить" }
  };

  function nm(n) { return n ? " " + n : ""; }
  var T = {
    tr: {
      hi: function (n) { return "Merhaba" + nm(n) + "! Ben Zunex AI. Hesap, bilgi soruları, metin araçları, kod açıklama ve dosya analizi konusunda yardımcı olabilirim."; },
      how: function (n) { return "İyiyim" + nm(n) + ", teşekkürler! (Bir programım, ama sorduğun için sağ ol.) Nasıl yardımcı olabilirim?"; },
      who: "Ben Zunex AI’ım: tarayıcında yerel çalışan bir asistanım. Büyük bir yapay zekâ modeli değilim; bilgi bankası, hesap motoru ve kurallarla cevap veririm. Bilmediğimi bilmediğimi söylerim.",
      help: function (l) { return "Yapabildiklerim:\n• Hesap: “(12+8)*3”, “karekök 144”, “200’ün yüzde 15’i”\n• Birim: “100 celsius kaç fahrenheit”\n• Metin: “özetle: …”, “düzelt: …”\n• Kod ya da hata mesajı yapıştır, açıklayayım\n• Başkentler, saat, tarih, zar\n• Dosya: .txt/.csv/.json gönder\n\nBilgi konuları: " + l + "."; },
      thanks: "Rica ederim! Başka bir şey lazım olursa buradayım.", bye: "Görüşmek üzere!",
      net: "Hayır, internete bağlı değilim. Her şey tarayıcında yerel çalışır; yazdıkların hiçbir sunucuya gönderilmez.",
      mem: "Evet, sohbet geçmişin ve adın bu cihazda saklanır. Ayarlardan ya da “Tüm sohbetleri sil” ile silebilirsin.",
      unk: function (r) { return "Bunu bilmiyorum. İnternete bağlı değilim ve bilgi bankam sınırlı; tahmin yürütüp yanlış bilgi vermek istemem." + (r ? "\n\nBelki şunlardan biri işine yarar: " + r + "." : "\n\n“Neler biliyorsun?” yazarak konuları görebilirsin."); },
      sure: function (t) { return "Tam emin olamadım. Şunu mu kastettin: “" + t + "”? “Evet” dersen cevaplarım."; },
      cap: function (c, k) { return c + " için başkent: " + k + "."; }, capNo: "Hangi ülkeyi sorduğunu anlayamadım ya da o ülke bilgi bankamda yok.",
      time: function (h) { return "Şu an saat " + h + " (cihazının saatine göre)."; },
      date: function (d, m, y, w) { return "Bugün " + d + " " + m + " " + y + ", " + w + " (cihazının tarihine göre)."; },
      nameOk: function (n) { return "Memnun oldum " + n + "! Adını bu cihazda hatırlayacağım."; },
      nameQ: function (n) { return n ? "Adın " + n + "." : "Henüz adını bilmiyorum. “Adım …” yazarsan hatırlarım."; },
      empty: "Bir şey yazar mısın?", more: function (t, l) { return "“" + t + "” konusunda elimdeki bilgi bu kadar. Aynı alandaki diğer konular: " + l + "."; }, nomore: "Bunun üzerine devam edebileceğim bir konu yok; yeni bir soru sorabilirsin.",
      onlyTr: "(Bu bilgi bankası maddesi henüz yalnızca Türkçe.)", sumShort: "Metin özetlemek için çok kısa (en az 3 cümle gerekir).", sumHead: "Özet:", sumNote: function (a, b) { return "(" + a + " cümleden en önemli " + b + " tanesi seçildi; anlamı yorumlamadan çıkarımsal özet.)"; },
      fixHead: "Düzeltilmiş metin:", fixNote: "(Yalnızca boşluk, noktalama ve büyük harf düzeltildi; dil bilgisi denetlenmedi.)", codeHead: function (l) { return "Kod analizi (tahmini dil: " + l + "):"; }, codeNote: "Kodu çalıştırmadan yalnızca yapısını okuyabilirim; davranışı kesin söyleyemem.", errHead: "Hata açıklaması:",
      prime: function (n, y, d) { return y ? n + " asal bir sayıdır." : n + " asal değildir" + (d ? "; " + d + " ile bölünür." : "."); }, coin: ["Yazı", "Tura"],
      fImg: function (n, wh, kb) { return "📷 " + n + ": görüntü dosyası" + (wh ? ", " + wh + " piksel" : "") + ", " + kb + ". İçeriğini yorumlayamam (görüntü tanıma yok), yalnızca boyut bilgisini verebilirim."; },
      fBin: function (n, kb) { return "📦 " + n + ": " + kb + ". Bu dosya türünü okuyamıyorum."; },
      fTxt: function (n, l, e, w, c, kb) { return "📄 " + n + ": " + l + " satır (" + e + " dolu), " + w + " kelime, " + c + " karakter, " + kb + "."; },
      fTrunc: " (İlk 30.000 karakter okundu.)", fJson: function (k) { return " Geçerli JSON (" + k + ")."; }, fJsonBad: " JSON olarak okunamadı.", fArr: function (n) { return "dizi, " + n + " öğe"; }, fObj: function (n) { return "nesne, " + n + " anahtar"; },
      fCsv: function (r, c) { return " Tahmini tablo: " + r + " satır × " + c + " sütun."; }, fTop: "En sık geçen kelimeler: ", fFirst: "İlk satırlar:"
    },
    az: {
      hi: function (n) { return "Salam" + nm(n) + "! Mən Zunex AI-yam. Hesablama, məlumat sualları, mətn alətləri, kod izahı və fayl təhlilində kömək edə bilərəm."; },
      how: function (n) { return "Yaxşıyam" + nm(n) + ", sağ ol! (Mən proqramam, amma soruşduğun üçün təşəkkür.) Sənə necə kömək edim?"; },
      who: "Mən Zunex AI-yam: brauzerində lokal işləyən köməkçiyəm. Böyük süni intellekt modeli deyiləm; biliklər bazası, hesablama mühərriki və qaydalarla cavab verirəm. Bilmədiyimi bilmədiyimi deyirəm.",
      help: function (l) { return "Bacardıqlarım:\n• Hesab: “(12+8)*3”, “kök 144”, “200-ün 15 faizi”\n• Ölçü: “100 selsi neçə farenheyt”\n• Mətn: “xülasə et: …”, “düzəlt: …”\n• Kod və ya xəta mesajı yapışdır, izah edim\n• Paytaxtlar, saat, tarix, zər\n• Fayl: .txt/.csv/.json göndər\n\nBilik mövzuları: " + l + "."; },
      thanks: "Buyur! Başqa nəsə lazım olsa, buradayam.", bye: "Görüşənədək!",
      net: "Xeyr, internetə qoşulu deyiləm. Hər şey brauzerində lokal işləyir; yazdıqların heç bir serverə göndərilmir.",
      mem: "Bəli, söhbət tarixçən və adın bu cihazda saxlanır. Ayarlardan və ya “Bütün söhbətləri sil” ilə silə bilərsən.",
      unk: function (r) { return "Bunu bilmirəm. İnternetə qoşulu deyiləm və biliklər bazam məhduddur; təxmin edib yanlış məlumat vermək istəmirəm." + (r ? "\n\nBəlkə bunlar faydalı olar: " + r + "." : "\n\n“Nələr bilirsən?” yazıb mövzulara baxa bilərsən."); },
      sure: function (t) { return "Tam əmin deyiləm. Bunu nəzərdə tuturdun: “" + t + "”? “Bəli” desən, cavab verərəm."; },
      cap: function (c, k) { return c + " üçün paytaxt: " + k + "."; }, capNo: "Hansı ölkəni soruşduğunu anlamadım və ya o ölkə bazamda yoxdur.",
      time: function (h) { return "İndi saat " + h + " (cihazının saatına görə)."; },
      date: function (d, m, y, w) { return "Bu gün " + d + " " + m + " " + y + ", " + w + " (cihazının tarixinə görə)."; },
      nameOk: function (n) { return "Tanış olmağıma şadam, " + n + "! Adını bu cihazda yadda saxlayacağam."; },
      nameQ: function (n) { return n ? "Adın " + n + "." : "Hələ adını bilmirəm. “Adım …” yazsan, yadda saxlayaram."; },
      empty: "Nəsə yazarsan?", more: function (t, l) { return "“" + t + "” mövzusunda əlimdə olan bu qədərdir. Eyni sahədəki digər mövzular: " + l + "."; }, nomore: "Bunun üzərində davam edə biləcəyim mövzu yoxdur; yeni sual verə bilərsən.",
      onlyTr: "(Bu bilik maddəsi hələlik yalnız türkcədir.)", sumShort: "Xülasə üçün mətn çox qısadır (ən azı 3 cümlə lazımdır).", sumHead: "Xülasə:", sumNote: function (a, b) { return "(" + a + " cümlədən ən vacib " + b + " cümlə seçildi; məna şərh edilmədən çıxarış xülasəsi.)"; },
      fixHead: "Düzəldilmiş mətn:", fixNote: "(Yalnız boşluq, durğu işarəsi və böyük hərf düzəldildi; qrammatika yoxlanmadı.)", codeHead: function (l) { return "Kod təhlili (təxmini dil: " + l + "):"; }, codeNote: "Kodu işə salmadan yalnız strukturunu oxuya bilirəm; davranışı dəqiq deyə bilmərəm.", errHead: "Xətanın izahı:",
      prime: function (n, y, d) { return y ? n + " sadə ədəddir." : n + " sadə ədəd deyil" + (d ? "; " + d + " ilə bölünür." : "."); }, coin: ["Yazı", "Xətt"],
      fImg: function (n, wh, kb) { return "📷 " + n + ": şəkil faylı" + (wh ? ", " + wh + " piksel" : "") + ", " + kb + ". Məzmununu şərh edə bilmirəm (təsvir tanıma yoxdur), yalnız ölçü məlumatı verirəm."; },
      fBin: function (n, kb) { return "📦 " + n + ": " + kb + ". Bu fayl növünü oxuya bilmirəm."; },
      fTxt: function (n, l, e, w, c, kb) { return "📄 " + n + ": " + l + " sətir (" + e + " dolu), " + w + " söz, " + c + " simvol, " + kb + "."; },
      fTrunc: " (İlk 30.000 simvol oxundu.)", fJson: function (k) { return " Düzgün JSON (" + k + ")."; }, fJsonBad: " JSON kimi oxunmadı.", fArr: function (n) { return "massiv, " + n + " element"; }, fObj: function (n) { return "obyekt, " + n + " açar"; },
      fCsv: function (r, c) { return " Təxmini cədvəl: " + r + " sətir × " + c + " sütun."; }, fTop: "Ən çox işlənən sözlər: ", fFirst: "İlk sətirlər:"
    },
    en: {
      hi: function (n) { return "Hello" + nm(n) + "! I’m Zunex AI. I can help with math, general knowledge, text tools, code explanation and file analysis."; },
      how: function (n) { return "I’m fine" + nm(n) + ", thanks! (I’m just a program, but thanks for asking.) How can I help?"; },
      who: "I’m Zunex AI, an assistant that runs locally in your browser. I’m not a large AI model; I answer with a knowledge base, a calculator engine and rules. If I don’t know something, I say so.",
      help: function (l) { return "What I can do:\n• Math: “(12+8)*3”, “sqrt 144”, “15% of 200”\n• Units: “100 celsius to fahrenheit”\n• Text: “summarize: …”, “fix: …”\n• Paste code or an error message and I’ll explain it\n• Capitals, time, date, dice\n• Files: send .txt/.csv/.json\n\nKnowledge topics: " + l + "."; },
      thanks: "You’re welcome! I’m here if you need anything else.", bye: "See you!",
      net: "No, I’m not connected to the internet. Everything runs locally in your browser; nothing you type is sent to a server.",
      mem: "Yes, your chat history and name are stored on this device. You can remove them in Settings or with “Delete all chats”.",
      unk: function (r) { return "I don’t know that. I’m offline and my knowledge base is limited; I’d rather not guess and give you wrong information." + (r ? "\n\nThese might help: " + r + "." : "\n\nType “What do you know?” to see my topics."); },
      sure: function (t) { return "I’m not sure. Did you mean “" + t + "”? Say “yes” and I’ll answer."; },
      cap: function (c, k) { return "The capital of " + c + " is " + k + "."; }, capNo: "I couldn’t tell which country you mean, or it isn’t in my knowledge base.",
      time: function (h) { return "It’s " + h + " (by your device clock)."; },
      date: function (d, m, y, w) { return "Today is " + w + ", " + m + " " + d + ", " + y + " (by your device date)."; },
      nameOk: function (n) { return "Nice to meet you, " + n + "! I’ll remember your name on this device."; },
      nameQ: function (n) { return n ? "Your name is " + n + "." : "I don’t know your name yet. Say “My name is …” and I’ll remember it."; },
      empty: "Could you type something?", more: function (t, l) { return "That’s all I have on “" + t + "”. Other topics in the same area: " + l + "."; }, nomore: "I have nothing further to continue with; feel free to ask something new.",
      onlyTr: "(This knowledge entry is only available in Turkish for now.)", sumShort: "The text is too short to summarize (at least 3 sentences needed).", sumHead: "Summary:", sumNote: function (a, b) { return "(Picked the " + b + " most important of " + a + " sentences; extractive, not an interpretation.)"; },
      fixHead: "Cleaned-up text:", fixNote: "(Only spacing, punctuation and capitalization were fixed; grammar was not checked.)", codeHead: function (l) { return "Code analysis (guessed language: " + l + "):"; }, codeNote: "I can only read the structure without running the code, so I can’t state its exact behavior.", errHead: "Error explanation:",
      prime: function (n, y, d) { return y ? n + " is a prime number." : n + " is not prime" + (d ? "; it’s divisible by " + d + "." : "."); }, coin: ["Heads", "Tails"],
      fImg: function (n, wh, kb) { return "📷 " + n + ": image file" + (wh ? ", " + wh + " px" : "") + ", " + kb + ". I can’t interpret its content (no image recognition), only report its size."; },
      fBin: function (n, kb) { return "📦 " + n + ": " + kb + ". I can’t read this file type."; },
      fTxt: function (n, l, e, w, c, kb) { return "📄 " + n + ": " + l + " lines (" + e + " non-empty), " + w + " words, " + c + " characters, " + kb + "."; },
      fTrunc: " (Only the first 30,000 characters were read.)", fJson: function (k) { return " Valid JSON (" + k + ")."; }, fJsonBad: " Could not be parsed as JSON.", fArr: function (n) { return "array, " + n + " items"; }, fObj: function (n) { return "object, " + n + " keys"; },
      fCsv: function (r, c) { return " Estimated table: " + r + " rows × " + c + " columns."; }, fTop: "Most frequent words: ", fFirst: "First lines:"
    },
    ru: {
      hi: function (n) { return "Здравствуйте" + nm(n) + "! Я Zunex AI. Помогу с вычислениями, общими знаниями, текстом, объяснением кода и анализом файлов."; },
      how: function (n) { return "Всё хорошо" + nm(n) + ", спасибо! (Я всего лишь программа, но спасибо, что спросили.) Чем помочь?"; },
      who: "Я Zunex AI — помощник, который работает локально в вашем браузере. Я не большая языковая модель: отвечаю с помощью базы знаний, калькулятора и правил. Если чего-то не знаю, так и скажу.",
      help: function (l) { return "Что я умею:\n• Вычисления: «(12+8)*3», «корень 144», «15% от 200»\n• Единицы: «100 цельсия в фаренгейт»\n• Текст: «резюмируй: …», «исправь: …»\n• Вставьте код или текст ошибки — объясню\n• Столицы, время, дата, кубик\n• Файлы: .txt/.csv/.json\n\nТемы базы знаний: " + l + "."; },
      thanks: "Пожалуйста! Если что-то ещё нужно — я здесь.", bye: "До встречи!",
      net: "Нет, я не подключён к интернету. Всё работает локально в вашем браузере; ничего из написанного не отправляется на сервер.",
      mem: "Да, история чатов и ваше имя хранятся на этом устройстве. Их можно удалить в настройках или кнопкой «Удалить все чаты».",
      unk: function (r) { return "Этого я не знаю. Я работаю офлайн, а моя база знаний ограничена; не хочу гадать и давать неверную информацию." + (r ? "\n\nВозможно, пригодится: " + r + "." : "\n\nНапишите «Что ты умеешь?», чтобы увидеть темы."); },
      sure: function (t) { return "Не уверен. Вы имели в виду «" + t + "»? Скажите «да», и я отвечу."; },
      cap: function (c, k) { return "Столица: " + c + " — " + k + "."; }, capNo: "Не понял, о какой стране речь, или её нет в моей базе знаний.",
      time: function (h) { return "Сейчас " + h + " (по часам вашего устройства)."; },
      date: function (d, m, y, w) { return "Сегодня " + d + " " + m + " " + y + ", " + w + " (по дате вашего устройства)."; },
      nameOk: function (n) { return "Приятно познакомиться, " + n + "! Запомню ваше имя на этом устройстве."; },
      nameQ: function (n) { return n ? "Вас зовут " + n + "." : "Я пока не знаю вашего имени. Напишите «Меня зовут …», и я запомню."; },
      empty: "Напишите что-нибудь?", more: function (t, l) { return "Это всё, что я знаю по теме «" + t + "». Другие темы из этой области: " + l + "."; }, nomore: "Продолжать пока нечего; задайте новый вопрос.",
      onlyTr: "(Эта статья базы знаний пока доступна только на турецком.)", sumShort: "Текст слишком короткий для краткого изложения (нужно минимум 3 предложения).", sumHead: "Кратко:", sumNote: function (a, b) { return "(Выбрано " + b + " самых важных предложений из " + a + "; выборочное изложение без интерпретации.)"; },
      fixHead: "Исправленный текст:", fixNote: "(Исправлены только пробелы, пунктуация и заглавные буквы; грамматика не проверялась.)", codeHead: function (l) { return "Анализ кода (предположительный язык: " + l + "):"; }, codeNote: "Я читаю только структуру, не запуская код, поэтому не могу точно сказать, как он себя поведёт.", errHead: "Объяснение ошибки:",
      prime: function (n, y, d) { return y ? n + " — простое число." : n + " — не простое число" + (d ? "; делится на " + d + "." : "."); }, coin: ["Орёл", "Решка"],
      fImg: function (n, wh, kb) { return "📷 " + n + ": изображение" + (wh ? ", " + wh + " пикселей" : "") + ", " + kb + ". Содержимое описать не могу (нет распознавания изображений), только размер."; },
      fBin: function (n, kb) { return "📦 " + n + ": " + kb + ". Этот тип файла я прочитать не могу."; },
      fTxt: function (n, l, e, w, c, kb) { return "📄 " + n + ": строк " + l + " (непустых " + e + "), слов " + w + ", символов " + c + ", " + kb + "."; },
      fTrunc: " (Прочитаны только первые 30 000 символов.)", fJson: function (k) { return " Корректный JSON (" + k + ")."; }, fJsonBad: " Не удалось разобрать как JSON.", fArr: function (n) { return "массив, элементов: " + n; }, fObj: function (n) { return "объект, ключей: " + n; },
      fCsv: function (r, c) { return " Примерная таблица: " + r + " строк × " + c + " столбцов."; }, fTop: "Самые частые слова: ", fFirst: "Первые строки:"
    }
  };
  return { NAMES: NAMES, M: M, UI: UI, T: T, detect: detect };
});
