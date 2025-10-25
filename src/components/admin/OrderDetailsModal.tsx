import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Order, OrderItem } from '../../types';
import { apiClient } from '../../lib/api';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrderDetailsModal({ order, onClose, onUpdate }: OrderDetailsModalProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderItems();
  }, [order.id]);

  const loadOrderItems = async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error loading order items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: status })
        .eq('id', order.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Ödeme durumu güncellenirken bir hata oluştu.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Sipariş Detayları</h2>
                <p className="text-sm text-slate-600">{order.order_number}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-3">Müşteri Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Ad Soyad:</span>
                      <span className="ml-2 font-semibold">{order.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Telefon:</span>
                      <span className="ml-2 font-semibold">{order.customer_phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">E-posta:</span>
                      <span className="ml-2 font-semibold">{order.customer_email}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-3">Teslimat Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Şehir:</span>
                      <span className="ml-2 font-semibold">{order.shipping_city}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Adres:</span>
                      <p className="mt-1 font-semibold">{order.shipping_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-slate-600">Yükleniyor...</div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Sipariş Ürünleri</h3>
                    <div className="bg-slate-50 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                              Ürün
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                              Adet
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                              Fiyat
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                              Toplam
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {orderItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900">
                                  {item.product_name}
                                </div>
                                <div className="text-xs text-slate-500">SKU: {item.product_sku}</div>
                              </td>
                              <td className="px-4 py-3 text-right text-sm">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-sm">
                                {item.unit_price.toFixed(2)} ₺
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-sm">
                                {item.total_price.toFixed(2)} ₺
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg mb-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Ara Toplam:</span>
                        <span className="font-semibold">{order.subtotal.toFixed(2)} ₺</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">KDV:</span>
                        <span className="font-semibold">{order.tax.toFixed(2)} ₺</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Kargo:</span>
                        <span className="font-semibold">{order.shipping_cost.toFixed(2)} ₺</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-900">Toplam:</span>
                        <span className="font-bold text-orange-600 text-lg">
                          {order.total.toFixed(2)} ₺
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="text-sm text-slate-600 block mb-1">Ödeme Yöntemi:</span>
                      <span className="font-semibold">
                        {order.payment_method === 'cash'
                          ? 'Kapıda Nakit'
                          : order.payment_method === 'transfer'
                          ? 'Banka Havalesi'
                          : 'Kredi Kartı'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600 block mb-1">Ödeme Durumu:</span>
                      <select
                        value={order.payment_status}
                        onChange={(e) => updatePaymentStatus(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="pending">Beklemede</option>
                        <option value="paid">Ödendi</option>
                        <option value="failed">Başarısız</option>
                      </select>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-2">Sipariş Notu</h3>
                      <p className="text-sm text-slate-700">{order.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
