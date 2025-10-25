import { X, Save, Package, Calculator, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TechnicalService {
  id: number;
  name: string;
  current_balance: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  sku: string;
  brand: string;
}

interface CreditSaleModalProps {
  service: TechnicalService;
  onClose: () => void;
}

export function CreditSaleModal({ service, onClose }: CreditSaleModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setUnitPrice(selectedProduct.price);
      calculateTotal();
    }
  }, [selectedProduct, quantity, unitPrice]);

  const loadProducts = async () => {
    try {
      // TODO: API endpoint'i implement et
      // Şimdilik mock data
      const mockProducts: Product[] = [
        { id: 1, name: 'Motor Yağı 5W-30', price: 150, stock_quantity: 50, sku: 'MY001', brand: 'Castrol' },
        { id: 2, name: 'Hava Filtresi', price: 50, stock_quantity: 30, sku: 'HF001', brand: 'Mann' },
        { id: 3, name: 'Yağ Filtresi', price: 25, stock_quantity: 40, sku: 'YF001', brand: 'Bosch' },
        { id: 4, name: 'Fren Balata', price: 200, stock_quantity: 20, sku: 'FB001', brand: 'Brembo' }
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const calculateTotal = () => {
    const total = quantity * unitPrice;
    setTotalAmount(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        technical_service_id: service.id,
        product_id: selectedProduct?.id,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        sale_date: new Date().toISOString().split('T')[0],
        notes: notes,
      };

      // TODO: API endpoint'i implement et
      console.log('Credit sale:', data);
      
      alert('Veresiye satış kaydedildi!');
      onClose();
    } catch (error) {
      console.error('Error saving credit sale:', error);
      alert('Veresiye satış kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Veresiye Ürün Satışı</h2>
                <p className="text-sm text-slate-600">{service.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current Balance */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Mevcut Bakiye:</span>
                <span className={`text-lg font-bold ${(service.current_balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(service.current_balance || 0).toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ürün Seçin *
                </label>
                <select
                  required
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === parseInt(e.target.value));
                    setSelectedProduct(product || null);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Ürün seçin</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.brand} ({product.sku})
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <div className="mt-2 text-sm text-slate-600">
                    <p>Stok: {selectedProduct.stock_quantity} adet</p>
                    <p>Birim Fiyat: {selectedProduct.price.toLocaleString('tr-TR')} ₺</p>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Miktar *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.stock_quantity || 1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Birim Fiyat (₺) *
                </label>
                <input
                  type="text"
                  required
                  value={unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onChange={(e) => {
                    // Sadece rakam ve nokta/virgül kabul et
                    const value = e.target.value.replace(/[^0-9.,]/g, '');
                    const numValue = parseFloat(value.replace(',', '.')) || 0;
                    setUnitPrice(numValue);
                  }}
                  onBlur={(e) => {
                    // Türk para birimi formatına çevir
                    const numValue = parseFloat(e.target.value.replace(',', '.')) || 0;
                    setUnitPrice(numValue);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0,00"
                />
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Toplam Tutar (₺)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    onChange={(e) => {
                      // Sadece rakam ve nokta/virgül kabul et
                      const value = e.target.value.replace(/[^0-9.,]/g, '');
                      const numValue = parseFloat(value.replace(',', '.')) || 0;
                      setTotalAmount(numValue);
                    }}
                    onBlur={(e) => {
                      // Türk para birimi formatına çevir
                      const numValue = parseFloat(e.target.value.replace(',', '.')) || 0;
                      setTotalAmount(numValue);
                    }}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0,00"
                  />
                  <button
                    type="button"
                    onClick={calculateTotal}
                    className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    title="Hesapla"
                  >
                    <Calculator className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notlar
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Veresiye satış notları"
              />
            </div>

            {/* Summary */}
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Satış Özeti</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ürün:</span>
                  <span>{selectedProduct?.name || 'Seçilmedi'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Miktar:</span>
                  <span>{quantity} adet</span>
                </div>
                <div className="flex justify-between">
                  <span>Birim Fiyat:</span>
                  <span>{unitPrice.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between font-semibold text-orange-600">
                  <span>Toplam:</span>
                  <span>{totalAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between font-bold text-red-600">
                  <span>Yeni Bakiye:</span>
                  <span>{((service.current_balance || 0) + totalAmount).toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>
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
                disabled={loading || !selectedProduct}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? 'Kaydediliyor...' : 'Veresiye Satış Yap'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
