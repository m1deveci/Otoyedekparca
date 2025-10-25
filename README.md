# OtoRıdvan - Filtre Dünyası

Modern e-ticaret sitesi - Otomobil yedek parça, filtre ve madeni yağ satış platformu.

## 🚀 Özellikler

- **Modern Tasarım** - Kalyoncu Motor benzeri profesyonel görünüm
- **Responsive** - Tüm cihazlarda mükemmel görünüm
- **E-ticaret Standartları** - Modern e-ticaret UX/UI
- **Admin Panel** - Ürün ve kategori yönetimi
- **Sepet Sistemi** - Alışveriş sepeti ve sipariş takibi
- **Kullanıcı Yönetimi** - Giriş/çıkış sistemi

## 🛠️ Teknolojiler

### Frontend
- **React 18** - Modern React hooks
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon set

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MariaDB** - MySQL uyumlu veritabanı
- **CORS** - Cross-origin resource sharing

### Deployment
- **Nginx** - Web server
- **SSL** - Cloudflare Origin SSL
- **PM2** - Process manager

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- MariaDB/MySQL
- Nginx

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/m1deveci/Otoyedekparca.git
cd Otoyedekparca
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Environment değişkenlerini ayarlayın
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

### 4. Veritabanını oluşturun
```sql
CREATE DATABASE otoridvan_db;
CREATE USER 'otoridvan_user'@'localhost' IDENTIFIED BY 'DevkitDeveci1453';
GRANT ALL PRIVILEGES ON otoridvan_db.* TO 'otoridvan_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Projeyi build edin
```bash
npm run build
```

### 6. Sunucuyu başlatın
```bash
npm run server
```

## 🗄️ Veritabanı Yapısı

### Tablolar
- **categories** - Ürün kategorileri
- **products** - Ürün bilgileri
- **customers** - Müşteri bilgileri
- **orders** - Sipariş bilgileri
- **order_items** - Sipariş kalemleri
- **admin_users** - Admin kullanıcıları

## 🔧 API Endpoints

### Kategoriler
- `GET /api/categories` - Tüm kategorileri getir

### Ürünler
- `GET /api/products` - Tüm ürünleri getir
- `GET /api/products/:id` - Belirli ürünü getir

### Siparişler
- `POST /api/orders` - Yeni sipariş oluştur
- `GET /api/orders` - Siparişleri listele

## 👤 Admin Panel

### Giriş Bilgileri
- **Email:** admin@otoridvan.com
- **Şifre:** admin123

### Özellikler
- Ürün ekleme/düzenleme/silme
- Kategori yönetimi
- Sipariş takibi
- Stok yönetimi

## 🌐 Deployment

### Nginx Konfigürasyonu
```nginx
server {
    listen 443 ssl http2;
    server_name otoridvan.devkit.com.tr;
    
    ssl_certificate /etc/ssl/otoridvan.devkit.com.tr/cert.pem;
    ssl_certificate_key /etc/ssl/otoridvan.devkit.com.tr/private.key;
    
    root /var/www/otoridvan.devkit.com.tr/dist;
    index index.html;
    
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📱 Responsive Tasarım

- **Mobile First** - Mobil öncelikli tasarım
- **Tablet Uyumlu** - Orta ekran optimizasyonu
- **Desktop** - Büyük ekran deneyimi
- **Touch Friendly** - Dokunmatik uyumlu

## 🎨 Tasarım Özellikleri

- **Modern UI/UX** - Kalyoncu Motor benzeri tasarım
- **Gradient Renkler** - Orange-Red tema
- **Hover Efektleri** - İnteraktif deneyim
- **Shadow Efektleri** - Derinlik hissi
- **Animasyonlar** - Smooth geçişler

## 🔒 Güvenlik

- **SSL Sertifikası** - HTTPS bağlantı
- **CORS Koruması** - Cross-origin güvenlik
- **SQL Injection Koruması** - Prepared statements
- **XSS Koruması** - Input sanitization

## 📊 Performans

- **Vite Build** - Hızlı build süreci
- **Code Splitting** - Lazy loading
- **Image Optimization** - Optimize edilmiş görseller
- **Caching** - Browser ve server cache

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Website:** https://otoridvan.devkit.com.tr
- **Email:** info@otoridvan.com
- **GitHub:** https://github.com/m1deveci/Otoyedekparca

---

**OtoRıdvan - Filtre Dünyası** 🚗✨
