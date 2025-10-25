import { ShoppingCart, User, Search, Menu, X, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onCartClick: () => void;
  onLoginClick: () => void;
  onAdminClick: () => void;
  onSearch: (query: string) => void;
}

export function Header({ onCartClick, onLoginClick, onAdminClick, onSearch }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getCartCount } = useCart();
  const { isAdmin } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <>
      {/* Top Bar - İletişim Bilgileri */}
      <div className="bg-slate-800 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+90 XXX XXX XX XX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@otoridvan.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span>Hızlı ve güvenli alışverişe giriş yapın!</span>
              <button
                onClick={onLoginClick}
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                Giriş Yap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ana Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                OR
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">OtoRıdvan</span>
                <span className="text-sm text-orange-600 font-medium">Filtre Dünyası</span>
              </div>
            </div>

            {/* Arama Çubuğu */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Ürün, marka veya model ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-12 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder-slate-500 text-lg"
                />
                <Search className="absolute left-4 top-4 w-6 h-6 text-slate-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Ara
                </button>
              </div>
            </form>

            {/* Sağ Menü */}
            <div className="hidden md:flex items-center gap-6">
              {isAdmin && (
                <button
                  onClick={onAdminClick}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                >
                  <User className="w-5 h-5" />
                  <span>Admin Panel</span>
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-700">
                <Heart className="w-5 h-5" />
                <span className="hidden lg:inline">Favorilerim</span>
              </button>
              <button
                onClick={onCartClick}
                className="relative flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-700"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden lg:inline">Sepetim</span>
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Mobil Menü Butonu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-50 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobil Menü */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 placeholder-slate-500"
                  />
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                </div>
              </form>
              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      onAdminClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                  >
                    <User className="w-5 h-5" />
                    <span>Admin Panel</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors text-slate-700"
                >
                  <User className="w-5 h-5" />
                  <span>Giriş Yap</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors text-slate-700">
                  <Heart className="w-5 h-5" />
                  <span>Favorilerim</span>
                </button>
                <button
                  onClick={() => {
                    onCartClick();
                    setMobileMenuOpen(false);
                  }}
                  className="relative flex items-center gap-2 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors text-slate-700"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Sepetim ({getCartCount()})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
