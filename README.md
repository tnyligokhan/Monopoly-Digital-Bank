# 🎲 Monopoly Mobil Bankacılık - Supabase Edition

Monopoly oyunu için modern, gerçek zamanlı dijital bankacılık uygulaması. Fiziksel para yerine telefonunuzdan tüm işlemlerinizi yapın!

## ✨ Özellikler

- 🔐 **Güvenli Giriş**: Google OAuth veya anonim giriş
- 🎮 **Oyun Yönetimi**: Oyun oluşturma ve katılma (4 haneli kod ile)
- 👥 **Çoklu Oyuncu**: Maksimum 6 oyuncu desteği
- 💰 **Para Transferleri**: 
  - Bankadan para alma/gönderme
  - Oyuncular arası transfer
  - Maaş alma (GO üzerinden geçiş)
  - Ücretsiz otopark parası
- 📊 **Gerçek Zamanlı Güncellemeler**: Supabase Realtime ile anlık senkronizasyon
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- 🌙 **Dark Mode**: Otomatik tema desteği
- 📈 **İstatistikler**: Oyun geçmişi ve kazanma oranları
- 🎨 **Modern UI**: Animasyonlar ve geçiş efektleri

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ 
- Supabase hesabı

### Adımlar

1. **Projeyi klonlayın**
   ```bash
   git clone <repo-url>
   cd monopoly-banking-supabase
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Supabase Projesi Oluşturun**
   - [Supabase](https://supabase.com) üzerinde yeni bir proje oluşturun
   - SQL Editor'de `supabase-schema.sql` dosyasını çalıştırın
   - Authentication > Providers bölümünden Google OAuth'u etkinleştirin (opsiyonel)

4. **Environment Değişkenlerini Ayarlayın**
   ```bash
   cp .env.example .env
   ```
   
   `.env` dosyasını düzenleyin:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Geliştirme Sunucusunu Başlatın**
   ```bash
   npm run dev
   ```

6. **Tarayıcıda Açın**
   ```
   http://localhost:5173
   ```

## 📦 Vercel'e Deploy

1. **Vercel CLI Yükleyin**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Edin**
   ```bash
   vercel
   ```

3. **Environment Değişkenlerini Ekleyin**
   - Vercel Dashboard'da projenize gidin
   - Settings > Environment Variables
   - `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` ekleyin

4. **Production Deploy**
   ```bash
   vercel --prod
   ```

## 🎮 Nasıl Oynanır?

1. **Giriş Yapın**: Google veya anonim olarak giriş yapın
2. **Kullanıcı Adı Belirleyin**: Diğer oyuncuların sizi göreceği ismi seçin
3. **Oyun Kurun veya Katılın**:
   - **Oyun Kur**: Başlangıç sermayesi ve kuralları belirleyin
   - **Oyuna Katıl**: 4 haneli oyun kodunu girin
4. **Oyunu Başlatın**: En az 2 oyuncu olduğunda oyun kurucusu başlatabilir
5. **Para Transferi Yapın**: İşlem butonundan tüm bankacılık işlemlerini gerçekleştirin

## 🏗️ Teknoloji Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: Vanilla CSS (Modern, Responsive)
- **Icons**: Lucide React
- **QR Code**: qrcode.react
- **Notifications**: React Hot Toast
- **Deployment**: Vercel

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir componentler
│   ├── CreateGameModal.jsx
│   ├── JoinGameModal.jsx
│   └── TransactionModal.jsx
├── lib/                 # Kütüphane yapılandırmaları
│   └── supabase.js
├── pages/               # Sayfa componentleri
│   ├── LoginPage.jsx
│   ├── SetUsernamePage.jsx
│   ├── HomePage.jsx
│   └── GamePage.jsx
├── store/               # Zustand state management
│   ├── authStore.js
│   └── gameStore.js
├── App.jsx              # Ana uygulama ve routing
├── main.jsx             # Entry point
└── styles.css           # Global stiller (tek CSS dosyası)
```

## 🗄️ Veritabanı Şeması

### Tables

- **users**: Kullanıcı bilgileri ve istatistikleri
- **usernames**: Kullanıcı adı benzersizlik kontrolü
- **games**: Oyun verileri ve gerçek zamanlı state

### Features

- Row Level Security (RLS) politikaları
- Realtime subscriptions
- Otomatik timestamp güncellemeleri
- İndekslenmiş sorgular

## 🔒 Güvenlik

- Supabase Row Level Security (RLS) ile veri koruması
- Authenticated kullanıcı kontrolü
- Client-side validasyonlar
- Server-side veri doğrulama

## 🎨 Tasarım Özellikleri

- **Modern & Minimal**: Sade, temiz ve profesyonel tasarım dili
- **Tek CSS Dosyası**: Tüm stiller merkezi `styles.css` dosyasında
- **Otomatik Dark Mode**: Sistem tercihine göre otomatik tema değişimi
- **Design Tokens**: CSS değişkenleri ile tutarlı renk ve spacing sistemi
- **Smooth Animasyonlar**: Fade-in, slide-up ve hover efektleri
- **Responsive Grid**: Mobil-first yaklaşım ile tüm ekran boyutlarına uyum
- **Gradient Backgrounds**: Modern gradient'ler ve gölge efektleri
- **Accessibility**: WCAG uyumlu, klavye navigasyonu destekli
- **Typography**: Sistem fontları ile hızlı yükleme
- **Micro-interactions**: Buton hover, focus ve active state'leri

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

**Not**: Bu uygulama orijinal [Monopoly Mobile Banking](https://github.com/devj3ns/monopoly-banking) projesinin Supabase ve Vercel ile yeniden yazılmış Türkçe versiyonudur.
