import { useState, useEffect } from 'react';
import { TrendingUp, Package, ShoppingBag, DollarSign, AlertTriangle, Users, ArrowUp, ArrowDown } from 'lucide-react';
import type { InventoryAlert } from '../../types';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  revenueChange: number;
  ordersChange: number;
}

export function DashboardTab() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
  });
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, alertsRes] = await Promise.all([
        supabase.from('products').select('id, is_active, stock_quantity, low_stock_threshold'),
        supabase.from('orders').select('id, status, total, created_at'),
        supabase.from('inventory_alerts').select('*, product:products(name, sku)').eq('is_resolved', false).order('created_at', { ascending: false }).limit(10),
      ]);

      if (productsRes.data) {
        const totalProducts = productsRes.data.length;
        const activeProducts = productsRes.data.filter(p => p.is_active).length;
        const lowStockProducts = productsRes.data.filter(p => p.stock_quantity <= p.low_stock_threshold).length;

        setStats(prev => ({
          ...prev,
          totalProducts,
          activeProducts,
          lowStockProducts,
        }));
      }

      if (ordersRes.data) {
        const totalOrders = ordersRes.data.length;
        const pendingOrders = ordersRes.data.filter(o => o.status === 'pending').length;
        const totalRevenue = ordersRes.data
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const thisMonthOrders = ordersRes.data.filter(o => new Date(o.created_at) >= lastMonth);
        const lastMonthOrders = ordersRes.data.filter(o => {
          const date = new Date(o.created_at);
          return date < lastMonth && date >= new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
        });

        const ordersChange = lastMonthOrders.length > 0
          ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
          : 0;

        const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0);
        const revenueChange = lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

        setStats(prev => ({
          ...prev,
          totalOrders,
          pendingOrders,
          totalRevenue,
          ordersChange,
          revenueChange,
        }));
      }

      if (alertsRes.data) {
        setAlerts(alertsRes.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id: string) => {
    const { error } = await supabase
      .from('inventory_alerts')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h2>
        <p className="text-slate-600">Mağaza performansınızı ve önemli metrikleri görüntüleyin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Aktif Ürünler</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeProducts}</p>
              <p className="text-xs text-slate-500">/ {stats.totalProducts} toplam</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalRevenue.toFixed(2)} ₺</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                {stats.revenueChange >= 0 ? (
                  <>
                    <ArrowUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">+{stats.revenueChange.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3 h-3 text-red-600" />
                    <span className="text-xs text-red-600">{stats.revenueChange.toFixed(1)}%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Siparişler</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                {stats.ordersChange >= 0 ? (
                  <>
                    <ArrowUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">+{stats.ordersChange.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3 h-3 text-red-600" />
                    <span className="text-xs text-red-600">{stats.ordersChange.toFixed(1)}%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Düşük Stok</p>
              <p className="text-2xl font-bold text-slate-900">{stats.lowStockProducts}</p>
              <p className="text-xs text-slate-500">ürün</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-slate-900">Hızlı İstatistikler</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-700">Bekleyen Siparişler</span>
              <span className="font-semibold text-slate-900">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-700">Ortalama Sipariş Değeri</span>
              <span className="font-semibold text-slate-900">
                {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'} ₺
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-700">Ürün Çeşitliliği</span>
              <span className="font-semibold text-slate-900">{stats.totalProducts}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-slate-900">Stok Uyarıları</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-slate-600 text-center py-8">Aktif uyarı yok</p>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          alert.alert_type === 'out_of_stock'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {alert.alert_type === 'out_of_stock' ? 'Stokta Yok' : 'Düşük Stok'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900 font-medium">{alert.message}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(alert.created_at).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="text-sm text-slate-600 hover:text-slate-900 underline"
                    >
                      Çözüldü
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
