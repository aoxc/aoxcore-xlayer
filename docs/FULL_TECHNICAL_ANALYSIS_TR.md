# AOXC Kütüphane Dönüşümü – Tam Teknik Analiz

## 1) Kapsam ve hedef
Bu analiz, mevcut `aoxc-library` dönüşümünü **eksiksiz** değerlendirmek için hazırlandı:

- Mimari doğruluk
- Derlenebilirlik/operasyonel hazır olma
- Entegrasyon ergonomisi
- Riskler ve kapatma planı

---

## 2) Mevcut durum özeti

### 2.1 Modül yüzeyi
Proje, tüketici odaklı bir kütüphane katmanı sunuyor:

- core
- treasury
- ai
- stake
- bridge
- access
- governance
- infra

Bu katmandaki sözleşmeler, V2 implementasyonlarını kalıtım yoluyla dışarı açan ince giriş sözleşmeleri (`*Module.sol`).

### 2.2 Import ergonomisi
`foundry.toml` içindeki `aoxc-lib-*` remapping’leri ile dış entegrasyon tarafında import path karmaşıklığı ciddi şekilde düşürülmüş durumda.

### 2.3 Dokümantasyon
Mevcut dokümantasyon:
- `PRO_LIBRARY_ARCHITECTURE.md` (profesyonel İngilizce mimari anlatım)
- `ZERO_ERROR_COMPILATION_PLAYBOOK.md` (derleme disiplini)
- `AOXC_LIBRARY_ARCHITECTURE_TR.md` (TR özet)

Bu üçlü temel seviyede iyi; ancak release düzeyi için daha ölçülebilir kabul kriterleri eklenmeli.

---

## 3) Güçlü yönler

1. **Kırıcı taşımadan kaçınma:** `src/aoxcore-v2` korunarak düşük riskli geçiş yapılmış.
2. **Tüketici odaklı yüzey:** Dış proje için modül bazlı import okunabilirliği artmış.
3. **Alias stratejisi:** Sözleşme türleri ile import namespace’leri hizalanmış.
4. **Pipeline başlangıcı:** `script/validate_foundry_pipeline.sh` ile tekrar edilebilir kontrol akışı tanımlı.

---

## 4) Kritik boşluklar (tamamlanması gerekenler)

### 4.1 Ortam bağımlılığı
Bu ortamda `forge` yok; bu yüzden gerçek derleme/test sonucu burada kanıtlanamıyor.

**Etkisi:** “Derler mi?” sorusu bu konteynerde kesin doğrulanamaz.

### 4.2 Lint borcu
Önceki çıktılarda yoğun lint notları/uyarıları vardı (isimlendirme, modifier yapısı, unsafe cast, unchecked transfer vb.).

**Etkisi:**
- Kod kalitesi ve audit okunabilirliği düşer.
- Gelecek PR’larda diff gürültüsü artar.

### 4.3 API stabilite politikası
`aoxc-library` için resmi semver + deprecation politikası henüz yazılı ve zorlayıcı değil.

**Etkisi:** Dış kullanıcılar kırıcı değişimde sürpriz yaşayabilir.

---

## 5) “Hatasız derleme” için net kabul kriterleri

Aşağıdaki kriterler sağlanmadan “production-ready” denmemeli:

1. `forge fmt --check` ✅
2. `forge build --sizes` ✅
3. `forge test -vvv` ✅
4. Kritik lint sınıfları için sıfır ihlal (en azından: unsafe-typecast, erc20-unchecked-transfer) ✅
5. `aoxc-library` import örnekleri ile smoke test ✅

---

## 6) 3 fazlı kapanış planı

### Faz A – Derleme deterministikliği (1-2 gün)
- CI runner’da Foundry kur
- Submodule/dependency doğrulamasını pipeline’a bağla
- Build+test’i branch protection kuralı yap

### Faz B – Lint azaltma (2-5 gün)
- Unsafe cast noktalarına explicit guard/comment
- ERC20 transfer kontrollerini normalize et
- Modifier wrapping tavsiyelerini tek stilde uygula
- İsimlendirme standardını modül modül düzelt

### Faz C – Kütüphane sözleşmesi sertleştirme (2-4 gün)
- `aoxc-library` için API sürüm tablosu yayınla
- Deprecation penceresi tanımla
- Dış entegrasyon için örnek tüketici repo ekle

---

## 7) Sonuç
Mimari yön doğru ve ileri seviye bir kütüphane yüzeyi kurulmuş durumda. 
Ancak “tam/hatasız” seviyesine geçmek için teknik olarak kritik adım, Foundry-enabled CI üzerinde **gerçek build+test+lints** kapısını zorunlu hale getirmektir.

Bu dosya, o geçiş için referans kabul kriterlerini ve uygulama sırasını netleştirir.
