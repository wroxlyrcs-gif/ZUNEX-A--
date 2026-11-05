(function (root, factory) {
  var kb = factory();
  if (typeof module === "object" && module.exports) module.exports = kb;
  else root.ZunexKB = kb;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  // Anahtarlar ASCII ve küçük harf. "!" öneki güçlü anahtar (tek başına yeter).
  return {
    capitals: {
      "turkiye": ["Türkiye", "Ankara"], "almanya": ["Almanya", "Berlin"], "fransa": ["Fransa", "Paris"],
      "italya": ["İtalya", "Roma"], "ispanya": ["İspanya", "Madrid"], "ingiltere": ["İngiltere", "Londra"],
      "birlesik krallik": ["Birleşik Krallık", "Londra"], "portekiz": ["Portekiz", "Lizbon"],
      "yunanistan": ["Yunanistan", "Atina"], "bulgaristan": ["Bulgaristan", "Sofya"], "romanya": ["Romanya", "Bükreş"],
      "rusya": ["Rusya", "Moskova"], "ukrayna": ["Ukrayna", "Kiev (Kyiv)"], "polonya": ["Polonya", "Varşova"],
      "hollanda": ["Hollanda", "Amsterdam (hükümet merkezi Lahey)"], "belcika": ["Belçika", "Brüksel"],
      "isvec": ["İsveç", "Stokholm"], "norvec": ["Norveç", "Oslo"], "finlandiya": ["Finlandiya", "Helsinki"],
      "danimarka": ["Danimarka", "Kopenhag"], "isvicre": ["İsviçre", "Bern"], "avusturya": ["Avusturya", "Viyana"],
      "macaristan": ["Macaristan", "Budapeşte"], "cekya": ["Çekya", "Prag"], "abd": ["ABD", "Washington D.C."],
      "amerika": ["ABD", "Washington D.C."], "kanada": ["Kanada", "Ottawa"], "meksika": ["Meksika", "Meksiko (Mexico City)"],
      "brezilya": ["Brezilya", "Brasília"], "arjantin": ["Arjantin", "Buenos Aires"], "sili": ["Şili", "Santiago"],
      "japonya": ["Japonya", "Tokyo"], "cin": ["Çin", "Pekin"], "hindistan": ["Hindistan", "Yeni Delhi"],
      "guney kore": ["Güney Kore", "Seul"], "kuzey kore": ["Kuzey Kore", "Pyongyang"], "azerbaycan": ["Azerbaycan", "Bakü"],
      "gurcistan": ["Gürcistan", "Tiflis"], "ermenistan": ["Ermenistan", "Erivan"], "iran": ["İran", "Tahran"],
      "irak": ["Irak", "Bağdat"], "suriye": ["Suriye", "Şam"], "misir": ["Mısır", "Kahire"],
      "suudi arabistan": ["Suudi Arabistan", "Riyad"], "avustralya": ["Avustralya", "Canberra"],
      "yeni zelanda": ["Yeni Zelanda", "Wellington"], "nijerya": ["Nijerya", "Abuja"], "kenya": ["Kenya", "Nairobi"],
      "pakistan": ["Pakistan", "İslamabad"], "kazakistan": ["Kazakistan", "Astana"], "ozbekistan": ["Özbekistan", "Taşkent"]
    },
    facts: [
      { t: "Atatürk", k: ["!ataturk", "!mustafa kemal"], a: "Mustafa Kemal Atatürk, 1881’de Selanik’te doğdu ve 10 Kasım 1938’de İstanbul’da vefat etti. Türkiye Cumhuriyeti’nin kurucusu ve ilk cumhurbaşkanıdır." },
      { t: "Cumhuriyet’in ilanı", k: ["!cumhuriyet"], a: "Türkiye Cumhuriyeti 29 Ekim 1923’te ilan edildi. İlk cumhurbaşkanı Mustafa Kemal Atatürk oldu." },
      { t: "İstanbul’un fethi", k: ["!fetih", "!fatih"], a: "İstanbul, 29 Mayıs 1453’te Osmanlı Sultanı II. Mehmed (Fatih Sultan Mehmed) tarafından fethedildi." },
      { t: "Işık hızı", k: ["!isik hizi", "!isigin hizi"], a: "Işığın boşluktaki hızı saniyede yaklaşık 299.792 km’dir (kabaca 300.000 km/sn)." },
      { t: "Işık yılı", k: ["!isik yili"], a: "Işık yılı bir süre değil, mesafe birimidir: ışığın bir yılda aldığı yol, yaklaşık 9,46 trilyon km." },
      { t: "Dünya–Güneş mesafesi", k: ["gunes", "uzak", "mesafe", "dunya"], a: "Dünya ile Güneş arasındaki ortalama mesafe yaklaşık 150 milyon km’dir (1 astronomik birim)." },
      { t: "Güneş Sistemi’nin gezegenleri", k: ["!gezegen", "!gunes sistemi"], a: "Güneş Sistemi’nde 8 gezegen vardır: Merkür, Venüs, Dünya, Mars, Jüpiter, Satürn, Uranüs ve Neptün. En büyüğü Jüpiter’dir." },
      { t: "Ay", k: ["!uydu", "!ay uydusu"], a: "Dünya’nın tek doğal uydusu Ay’dır; Dünya’ya ortalama yaklaşık 384.400 km uzaktadır." },
      { t: "Kıtalar", k: ["!kita"], a: "Yaygın modele göre 7 kıta vardır: Asya, Afrika, Kuzey Amerika, Güney Amerika, Antarktika, Avrupa ve Avustralya (Okyanusya)." },
      { t: "Okyanuslar", k: ["!okyanus"], a: "5 okyanus vardır: Pasifik (en büyüğü), Atlas, Hint, Güney ve Arktik (Kuzey Buz) Okyanusu." },
      { t: "Everest Dağı", k: ["!everest"], a: "Everest Dağı, deniz seviyesinden yaklaşık 8.849 m yüksekliğiyle dünyanın en yüksek zirvesidir." },
      { t: "Suyun kaynama ve donma noktası", k: ["!kaynama", "!kaynar", "!donma"], a: "Su, deniz seviyesinde 100 °C’de kaynar ve 0 °C’de donar. Yükseldikçe kaynama noktası düşer." },
      { t: "Fotosentez", k: ["!fotosentez"], a: "Fotosentez, bitkilerin ve bazı canlıların ışık enerjisiyle su ve karbondioksitten glikoz üretip oksijen açığa çıkarmasıdır." },
      { t: "DNA", k: ["!dna"], a: "DNA, canlıların kalıtsal bilgisini taşıyan çift sarmallı moleküldür; bilgi A, T, G ve C adlı dört bazın dizilimiyle kodlanır." },
      { t: "Yer çekimi", k: ["!yer cekimi", "!yercekimi"], a: "Dünya yüzeyinde yer çekimi ivmesi yaklaşık 9,81 m/s²’dir. Newton’un evrensel çekim yasasına göre kütleli cisimler birbirini çeker." },
      { t: "Pisagor teoremi", k: ["!pisagor"], a: "Dik üçgende dik kenarların kareleri toplamı hipotenüsün karesine eşittir: a² + b² = c²." },
      { t: "Asal sayılar", k: ["!asal"], a: "Asal sayı, yalnızca 1’e ve kendisine bölünebilen, 1’den büyük doğal sayıdır (2, 3, 5, 7, 11…). Bir sayıyı sorabilirsin: “29 asal mı?”" },
      { t: "Pi sayısı", k: ["!pi sayi"], a: "Pi (π), bir çemberin çevresinin çapına oranıdır: yaklaşık 3,14159265. İrrasyoneldir, yani ondalık gösterimi sonsuza dek tekrarsız sürer." },
      { t: "Fibonacci dizisi", k: ["!fibonacci"], a: "Fibonacci dizisinde her sayı önceki ikisinin toplamıdır: 0, 1, 1, 2, 3, 5, 8, 13, 21…" },
      { t: "Artık yıl", k: ["!artik yil"], a: "Artık yıl 366 gün sürer (Şubat 29 çeker) ve genelde 4’e bölünen yıllardır. İstisna: 100’e bölünen yıllar, 400’e de bölünmedikçe artık değildir." },
      { t: "Türk alfabesi", k: ["!alfabe"], a: "Türk alfabesi 29 harften oluşur: 8 ünlü ve 21 ünsüz." },
      { t: "İnsan iskeleti", k: ["!kemik"], a: "Yetişkin bir insanda 206 kemik bulunur." },
      { t: "Bit ve bayt", k: ["!bayt", "!byte", "!bit"], a: "1 bayt = 8 bittir. Geleneksel olarak 1 KB = 1024 bayt, 1 MB = 1024 KB’dir." },
      { t: "Yapay zekâ", k: ["!yapay zeka"], a: "Yapay zekâ, bilgisayarların öğrenme, çıkarım ve dil anlama gibi insan zekâsıyla ilişkilendirilen işleri yapmasını sağlayan yöntemlerin genel adıdır. Ben bunlardan biri değilim: kural ve bilgi tabanı temelli, tarayıcında çalışan basit bir asistanım." },
      { t: "HTML", k: ["!html"], a: "HTML, web sayfalarının yapısını (başlık, paragraf, bağlantı, görsel vb.) tanımlayan işaretleme dilidir." },
      { t: "CSS", k: ["!css"], a: "CSS, HTML ile yazılmış sayfaların renk, yerleşim ve yazı tipi gibi görünümünü belirleyen stil dilidir." },
      { t: "JavaScript", k: ["!javascript"], a: "JavaScript, web sayfalarına etkileşim kazandıran programlama dilidir; tarayıcıda çalışır." },
      { t: "Python", k: ["!python"], a: "Python, okunaklı söz dizimiyle bilinen genel amaçlı bir programlama dilidir; veri analizi, otomasyon ve web geliştirmede yaygındır." },
      { t: "GitHub Pages", k: ["!github"], a: "GitHub Pages, GitHub depolarındaki statik siteleri (HTML, CSS, JS) ücretsiz yayınlayan bir hizmettir." }
    ]
  };
});
