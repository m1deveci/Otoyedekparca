import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
                OR
              </div>
              <div>
                <h3 className="text-xl font-bold">OtoRıdvan</h3>
                <p className="text-sm text-slate-400">Otomotiv Yedek Parça</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Kaliteli ürünler, güvenilir hizmet ve müşteri memnuniyeti odaklı yaklaşımımızla 
              otomotiv sektöründe öncü konumumuzu sürdürüyoruz.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Kurumsal</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleLinkClick('/about')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Hakkımızda
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/contact')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  İletişim
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/faq')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Sıkça Sorulan Sorular
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/order-tracking')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Sipariş Takip
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/privacy-policy')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Kişisel Veriler Politikası
                </button>
              </li>
            </ul>
          </div>

          {/* Alışveriş */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Alışveriş</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleLinkClick('/distance-sales-contract')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Mesafeli Satış Sözleşmesi
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/payment-delivery')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Ödeme & Teslimat
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/cancellation-return')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  İptal İade Koşulları
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/return-delivery-policy')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  İade & Teslimat Politikaları
                </button>
              </li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Kategoriler</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleLinkClick('/category/air-filters')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Hava Filtreleri
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/category/oil-filters')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Yağ Filtreleri
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/category/motor-oils')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Motor Yağları
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/category/brake-pads')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Fren Balataları
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/discounted-products')}
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  İndirimli Ürünler
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Telefon</p>
                <p className="font-semibold">+90 XXX XXX XX XX</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">E-posta</p>
                <p className="font-semibold">info@otoridvan.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Adres</p>
                <p className="font-semibold">İstanbul, Türkiye</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400">
            © 2024 OtoRıdvan. Tüm hakları saklıdır. | 
            <button
              onClick={() => handleLinkClick('/privacy-policy')}
              className="hover:text-orange-400 transition-colors ml-2"
            >
              Gizlilik Politikası
            </button>
            <span className="mx-2">|</span>
            <button
              onClick={() => handleLinkClick('/terms-of-service')}
              className="hover:text-orange-400 transition-colors"
            >
              Kullanım Koşulları
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
}
