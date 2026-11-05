# Zunex AI

Tarayıcıda **tamamen yerel** çalışan, dört dilli (Azərbaycan dili, Türkçe, English, Русский) asistan. API anahtarı, sunucu, abonelik veya internet bağlantısı gerekmez. Yazdıkların cihazından çıkmaz.

## Dürüst bir not
Zunex AI büyük bir yapay zekâ modeli **değildir**. Kurallar, anahtar kelime eşleştirme, küçük bir bilgi bankası ve hesap motoruyla çalışır. Her konuyu bilmez, muhakeme yürütmez; bilmediğini söyler. Fotoğrafların içeriğini göremez (yalnızca boyut verir).

## Özellikler
- **Diller:** yazdığın dili otomatik algılar ve aynı dilde cevap verir; Ayarlar'dan elle de seçilebilir (arayüz dili de değişir).
- **Hesap:** `(12+8)*3`, `sqrt 144`, `2^10`, `7!`, `sin(30)`, `15% of 200`, “5 плюс 7”, “12 times 8 plus 4”
- **Birim çevirme:** °C↔°F, km↔mil, kg↔lb, m↔ft · `29 asal mı?` / `Is 97 prime?`
- **Bilgi bankası (13 kategori, ~55 madde):** bilim, tarih, coğrafya, matematik, fizik, kimya, biyoloji, bilgisayar/HTML/CSS/JS/Python, spor, müzik-sanat, eğitim, günlük yaşam, meslekler. Yazım hatalarını küçük ölçüde tolere eder; “peki ya Japonya?”, “tell me more” gibi takip sorularını anlar.
- **Metin araçları:** `özetle: …` / `summarize: …` / `резюмируй: …` (seçmeli özet), `düzelt: …` / `fix: …` (boşluk, noktalama, büyük harf)
- **Kod:** kod yapıştır → yapısını açıklar; hata mesajı yapıştır (TypeError, NameError, SyntaxError…) → olası nedeni söyler
- **Dosya:** .txt/.csv/.json/kod dosyalarında satır, kelime, sık kelimeler, JSON/CSV yapısı
- **Hafıza:** birden fazla sohbet, yan panelde geçmiş, yeni sohbet, adın; hepsi `localStorage`'da. Ayarlar → “Tüm sohbetleri sil”
- **Tema:** Sistem / Aydınlık / Karanlık · mobil uyumlu (yan panel çekmeceye dönüşür) · çevrimdışı çalışır (Service Worker)

## Bilinen sınırlar
- Bilgi bankası küçüktür; çoğu soruya “bilmiyorum” der.
- Yeni eklenen maddelerin bir kısmı yalnızca Türkçe/İngilizce; diğer dillerde Türkçe cevap ve bir uyarı gösterilir.
- Özetleme “çıkarımsal”dır (önemli cümleleri seçer), yeniden yazmaz. Dil bilgisi denetimi yoktur.
- Kod analizi yalnızca yapıyı okur, kodu çalıştırmaz.
- Matematikte sin/cos/tan derece cinsindendir.

## GitHub Pages'te yayınlama
1. Yeni bir depo aç, bu klasördeki **tüm dosyaları** köke yükle (`.nojekyll` dahil).
2. **Settings → Pages**: *Deploy from a branch* → `main` / `(root)` → Save.
3. `https://KULLANICI.github.io/DEPO/` adresinde açılır (yollar göreli, alt klasörde çalışır).

## Dosyalar
`index.html` (arayüz) · `app.js` (arayüz mantığı, sohbetler, ayarlar) · `assistant.js` (motor) · `lang.js` (dil algılama ve cevap metinleri) · `knowledge.js` + `knowledge-ml.js` (bilgi bankası) · `sw.js` (çevrimdışı önbellek) · `test.js` (`node test.js`)

## Bilgi eklemek
`knowledge-ml.js` içindeki `RAW` listesine `[kategori, başlık, [anahtarlar], TR cevap, EN başlık, EN cevap]` ekle. Anahtarlar küçük harf ve aksansız yazılır (Latin: `ğ→g, ı→i, ə→e`; Kiril: küçük harf, ё→е). `!` önekli anahtar tek başına eşleşme sağlar.

## Android (APK)
Siteyi GitHub Pages'e yükledikten sonra https://www.pwabuilder.com adresiyle Android paketi oluşturabilirsin.
