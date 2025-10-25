import { X, Save, Package, Truck, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { logActions } from '../../utils/logger';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  name: string;
  stock_quantity: number;
  cost_price?: number;
  sku: string;
  brand: string;
}

interface StockAddModalProps {
  product: Product;
  onClose: () => void;
}

export function StockAddModal({ product, onClose }: StockAddModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    cost_price: '',
    supplier: '',
    notes: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quantity = parseInt(formData.quantity) || 0;
      const costPrice = parseFloat(formData.cost_price.replace(',', '.')) || 0;

      if (quantity <= 0) {
        await Swal.fire({
          title: 'Hata!',
          text: 'Miktar 0\'dan büyük olmalıdır.',
          icon: 'error',
          confirmButtonText: 'Tamam'
        });
        setLoading(false);
        return;
      }

      // Stok ekleme API çağrısı
      const response = await fetch(`/api/admin/products/${product.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: quantity,
          operation: 'increase',
          cost_price: costPrice,
          supplier: formData.supplier,
          notes: formData.notes,
          purchase_date: formData.purchase_date
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      // Sistem logu kaydet
      await logActions.stockAdded(product, quantity, costPrice, formData.supplier, formData.notes);

      await Swal.fire({
        title: 'Başarılı!',
        text: `${product.name} ürününe ${quantity} adet stok eklendi!`,
        icon: 'success',
        confirmButtonText: 'Tamam'
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding stock:', error);
      await Swal.fire({
        title: 'Hata!',
        text: 'Stok eklenirken bir hata oluştu.',
        icon: 'error',
        confirmButtonText: 'Tamam'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Stok Ekle</h2>
                <p className="text-sm text-slate-600">{product.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <div className="p-6">
            {/* Current Stock Info */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Mevcut Stok:</span>
                <span className="text-lg font-bold text-slate-900">{product.stock_quantity} adet</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-slate-600">Mevcut Alış Fiyatı:</span>
                <span className="text-lg font-bold text-slate-900">
                  {parseFloat(product.cost_price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Eklenen Miktar *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Miktar girin"
                />
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Alış Fiyatı (₺) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cost_price}
                  onChange={(e) => {
                    // Sadece rakam ve nokta/virgül kabul et
                    const value = e.target.value.replace(/[^0-9.,]/g, '');
                    setFormData({ ...formData, cost_price: value });
                  }}
                  onBlur={(e) => {
                    // Türk para birimi formatına çevir
                    const numValue = parseFloat(e.target.value.replace(',', '.')) || 0;
                    setFormData({ ...formData, cost_price: numValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0,00"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tedarikçi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Tedarikçi adı"
                />
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Alış Tarihi
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Stok ekleme notları"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading ? 'Ekleniyor...' : 'Stok Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
