import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Package, ShoppingBag, FolderOpen, LogOut, LayoutDashboard, Settings, Menu, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardTab } from './DashboardTab';
import { ProductsTab } from './ProductsTab';
import { CategoriesTab } from './CategoriesTab';
import { OrdersTab } from './OrdersTab';
import { TechnicalServicesTab } from './TechnicalServicesTab';
import { SettingsTab } from './SettingsTab';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'technical-services' | 'settings'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

      // URL'den aktif tab'ı belirle
      useEffect(() => {
        const path = location.pathname;
        if (path.includes('/admin/products')) {
          setActiveTab('products');
        } else if (path.includes('/admin/categories')) {
          setActiveTab('categories');
        } else if (path.includes('/admin/orders')) {
          setActiveTab('orders');
        } else if (path.includes('/admin/technical-services')) {
          setActiveTab('technical-services');
        } else if (path.includes('/admin/settings')) {
          setActiveTab('settings');
        } else {
          setActiveTab('dashboard');
        }
      }, [location.pathname]);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

      const handleTabChange = (tab: 'dashboard' | 'products' | 'categories' | 'orders' | 'technical-services' | 'settings') => {
        setActiveTab(tab);
        const tabPaths = {
          dashboard: '/admin',
          products: '/admin/products',
          categories: '/admin/categories',
          orders: '/admin/orders',
          'technical-services': '/admin/technical-services',
          settings: '/admin/settings'
        };
        navigate(tabPaths[tab]);
      };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl text-white">
                OR
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">OtoRıdvan Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Çıkış</span>
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Çıkış Yap"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 bg-slate-800 border-r border-slate-700 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-semibold">Dashboard</span>
              </button>

              <button
                onClick={() => handleTabChange('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'products'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="font-semibold">Ürünler</span>
              </button>

              <button
                onClick={() => handleTabChange('categories')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <FolderOpen className="w-5 h-5" />
                <span className="font-semibold">Kategoriler</span>
              </button>

                  <button
                    onClick={() => handleTabChange('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-semibold">Siparişler</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('technical-services')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'technical-services'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-semibold">Teknik Servisler</span>
                  </button>

              <button
                onClick={() => handleTabChange('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-semibold">Ayarlar</span>
              </button>
            </nav>
          </div>

          {/* Mobile Sidebar */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
              <div className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Menü</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-2">
                  <button
                    onClick={() => {
                      handleTabChange('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'dashboard'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-semibold">Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      handleTabChange('products');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'products'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-semibold">Ürünler</span>
                  </button>

                  <button
                    onClick={() => {
                      handleTabChange('categories');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'categories'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <FolderOpen className="w-5 h-5" />
                    <span className="font-semibold">Kategoriler</span>
                  </button>

                      <button
                        onClick={() => {
                          handleTabChange('orders');
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'orders'
                            ? 'bg-orange-500 text-white'
                            : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-semibold">Siparişler</span>
                      </button>

                      <button
                        onClick={() => {
                          handleTabChange('technical-services');
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'technical-services'
                            ? 'bg-orange-500 text-white'
                            : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                        <span className="font-semibold">Teknik Servisler</span>
                      </button>

                  <button
                    onClick={() => {
                      handleTabChange('settings');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-semibold">Ayarlar</span>
                  </button>
                </nav>
              </div>
            </div>
          )}

              <div className="flex-1 bg-slate-100 overflow-y-auto">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'categories' && <CategoriesTab />}
                {activeTab === 'orders' && <OrdersTab />}
                {activeTab === 'technical-services' && <TechnicalServicesTab />}
                {activeTab === 'settings' && <SettingsTab />}
              </div>
        </div>
      </div>
    </div>
  );
}
