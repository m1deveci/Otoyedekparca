import { useState } from 'react';
import { X, Package, ShoppingBag, FolderOpen, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardTab } from './DashboardTab';
import { ProductsTab } from './ProductsTab';
import { CategoriesTab } from './CategoriesTab';
import { OrdersTab } from './OrdersTab';
import { SettingsTab } from './SettingsTab';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'settings'>('dashboard');
  const { signOut } = useAuth();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">
                OR
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-slate-400">OtoRıdvan Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Çıkış</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 bg-slate-800 border-r border-slate-700 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
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
                onClick={() => setActiveTab('products')}
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
                onClick={() => setActiveTab('categories')}
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
                onClick={() => setActiveTab('orders')}
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
                onClick={() => setActiveTab('settings')}
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

          <div className="flex-1 bg-slate-100 overflow-y-auto">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'products' && <ProductsTab />}
            {activeTab === 'categories' && <CategoriesTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
