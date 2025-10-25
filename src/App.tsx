import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LoginModal } from './components/LoginModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiClient } from './lib/api';
import type { Product, Category } from './types';

function AppContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const { isAdmin, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      );
    }

    console.log('Filtering products:', { 
      totalProducts: products.length, 
      searchQuery, 
      selectedCategory, 
      filteredCount: filtered.length 
    });
    
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setCartOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onCartClick={() => setCartOpen(true)}
        onLoginClick={() => setLoginOpen(true)}
        onAdminClick={() => setAdminOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
        onSearch={setSearchQuery}
      />

      <main className="bg-slate-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">OtoRıdvan - Filtre Dünyası</h1>
              <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
                Araç yedek parça, filtre ve madeni yağ konusunda güvenilir çözüm ortağınız. 
                Kaliteli ürünler, hızlı teslimat ve uzman desteği ile yanınızdayız.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg">
                  Ürünleri İncele
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-orange-600 transition-colors">
                  İletişime Geç
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kategori Kartları */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Kategoriler</h2>
            <p className="text-slate-600 text-lg">İhtiyacınıza uygun kategoriyi seçin</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <button
              onClick={() => setSelectedCategory('')}
              className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                selectedCategory === ''
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg">Tüm Ürünler</h3>
              <p className="text-sm opacity-80 mt-2">Tüm kategoriler</p>
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg">{category.name}</h3>
                <p className="text-sm opacity-80 mt-2">Kaliteli ürünler</p>
              </button>
            ))}
          </div>
        </div>

        {/* Ürünler Bölümü */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <p className="text-slate-600 text-lg">Ürün bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Özellikler Bölümü */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Güvenli Alışveriş</h3>
              <p className="text-slate-600 text-sm">SSL sertifikası ile korumalı</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🔄</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Kolay İade & Değişim</h3>
              <p className="text-slate-600 text-sm">30 gün içinde iade</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💳</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Çeşitli Ödeme Seçenekleri</h3>
              <p className="text-slate-600 text-sm">Kredi kartı, havale, kapıda ödeme</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Hızlı Teslimat</h3>
              <p className="text-slate-600 text-sm">Aynı gün kargo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo ve Açıklama */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                  OR
                </div>
                <div>
                  <h3 className="text-2xl font-bold">OtoRıdvan</h3>
                  <p className="text-orange-400 font-medium">Filtre Dünyası</p>
                </div>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Otomobil yedek parça, filtre ve madeni yağ konusunda güvenilir çözüm ortağınız. 
                Kaliteli ürünler, hızlı teslimat ve uzman desteği ile yanınızdayız.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer">
                  <span className="text-white">f</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer">
                  <span className="text-white">t</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer">
                  <span className="text-white">i</span>
                </div>
              </div>
            </div>

            {/* Kurumsal */}
            <div>
              <h4 className="font-bold text-lg mb-6">Kurumsal</h4>
              <div className="space-y-3">
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Yeni Üyelik</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Hakkımızda</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">İletişim</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Sıkça Sorulan Sorular</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Sipariş Takip</a>
              </div>
            </div>

            {/* Alışveriş */}
            <div>
              <h4 className="font-bold text-lg mb-6">Alışveriş</h4>
              <div className="space-y-3">
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Kişisel Veriler Politikası</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Mesafeli Satış Sözleşmesi</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Ödeme & Teslimat</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">İptal İade Koşulları</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">İade & Teslimat Politikaları</a>
              </div>
            </div>

            {/* Kategoriler */}
            <div>
              <h4 className="font-bold text-lg mb-6">Kategoriler</h4>
              <div className="space-y-3">
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Hava Filtreleri</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Yağ Filtreleri</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Motor Yağları</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">Fren Balataları</a>
                <a href="#" className="block text-slate-400 hover:text-orange-400 transition-colors">İndirimli Ürünler</a>
              </div>
            </div>
          </div>

          {/* Alt Çizgi */}
          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm mb-4 md:mb-0">
                &copy; 2025 OtoRıdvan - Filtre Dünyası. Tüm hakları saklıdır.
              </p>
              <p className="text-slate-500 text-sm">
                IdeaSoft® | Akıllı E-Ticaret paketleri ile hazırlanmıştır.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          setCheckoutOpen(false);
        }}
      />

      <LoginModal 
        isOpen={loginOpen} 
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => {
          setLoginOpen(false);
          navigate('/admin');
        }}
      />

      <ProfileModal 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)}
      />

      {isAdmin && <AdminPanel isOpen={adminOpen} onClose={() => setAdminOpen(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/admin/*" element={<AdminRoute />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

function AdminRoute() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  const handleClose = () => {
    navigate('/');
  };
  
  return <AdminPanel isOpen={true} onClose={handleClose} />;
}

export default App;
