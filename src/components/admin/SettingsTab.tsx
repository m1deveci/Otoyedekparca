import { useState, useEffect } from 'react';
import { Settings, Save, DollarSign, Truck, CreditCard, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { StoreSetting, PaymentMethod, ShippingMethod } from '../../types';

export function SettingsTab() {
  const [activeSection, setActiveSection] = useState<'general' | 'payment' | 'shipping'>('general');
  const [settings, setSettings] = useState<StoreSetting[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, paymentRes, shippingRes] = await Promise.all([
        supabase.from('store_settings').select('*').order('category', { ascending: true }),
        supabase.from('payment_methods').select('*').order('display_order', { ascending: true }),
        supabase.from('shipping_methods').select('*').order('display_order', { ascending: true }),
      ]);

      if (settingsRes.data) setSettings(settingsRes.data);
      if (paymentRes.data) setPaymentMethods(paymentRes.data);
      if (shippingRes.data) setShippingMethods(shippingRes.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('store_settings')
      .update({ value })
      .eq('key', key);

    if (!error) {
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    }
  };

  const togglePaymentMethod = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_active: isActive })
      .eq('id', id);

    if (!error) {
      setPaymentMethods(prev => prev.map(p => p.id === id ? { ...p, is_active: isActive } : p));
    }
  };

  const updateShippingMethod = async (id: string, updates: Partial<ShippingMethod>) => {
    const { error } = await supabase
      .from('shipping_methods')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setShippingMethods(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category);
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
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-8 h-8 text-orange-500" />
          <h2 className="text-2xl font-bold text-slate-900">Mağaza Ayarları</h2>
        </div>

        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveSection('general')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeSection === 'general'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Genel Ayarlar
            </div>
          </button>

          <button
            onClick={() => setActiveSection('payment')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeSection === 'payment'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Ödeme Yöntemleri
            </div>
          </button>

          <button
            onClick={() => setActiveSection('shipping')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeSection === 'shipping'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Kargo Yöntemleri
            </div>
          </button>
        </div>
      </div>

      {activeSection === 'general' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Genel Bilgiler</h3>
            <div className="grid gap-4">
              {getSettingsByCategory('general').map(setting => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {setting.description}
                  </label>
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Vergi Ayarları</h3>
            <div className="grid gap-4">
              {getSettingsByCategory('tax').map(setting => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {setting.description}
                  </label>
                  <input
                    type="number"
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Sipariş Ayarları</h3>
            <div className="grid gap-4">
              {getSettingsByCategory('orders').map(setting => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {setting.description}
                  </label>
                  <input
                    type={setting.type === 'number' ? 'number' : 'text'}
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Stok Ayarları</h3>
            <div className="grid gap-4">
              {getSettingsByCategory('inventory').map(setting => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {setting.description}
                  </label>
                  <input
                    type="number"
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'payment' && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Ödeme Yöntemleri</h3>
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <div key={method.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    method.is_active ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    <CreditCard className={`w-6 h-6 ${
                      method.is_active ? 'text-green-600' : 'text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{method.name}</h4>
                    <p className="text-sm text-slate-600">{method.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={method.is_active}
                    onChange={(e) => togglePaymentMethod(method.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'shipping' && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Kargo Yöntemleri</h3>
          <div className="space-y-4">
            {shippingMethods.map(method => (
              <div key={method.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      method.is_active ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <Truck className={`w-6 h-6 ${
                        method.is_active ? 'text-blue-600' : 'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{method.name}</h4>
                      <p className="text-sm text-slate-600">{method.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={method.is_active}
                      onChange={(e) => updateShippingMethod(method.id, { is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={method.price}
                      onChange={(e) => updateShippingMethod(method.id, { price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tahmini Gün
                    </label>
                    <input
                      type="number"
                      value={method.estimated_days}
                      onChange={(e) => updateShippingMethod(method.id, { estimated_days: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ücretsiz Kargo Limiti (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={method.free_shipping_threshold}
                      onChange={(e) => updateShippingMethod(method.id, { free_shipping_threshold: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Bilgi</p>
            <p>Ayarlarınız otomatik olarak kaydedilir. Değişiklikler anında yürürlüğe girer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
