import { X, Save, Package, Calculator, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { logActions } from '../../utils/logger';
import Swal from 'sweetalert2';

interface TechnicalService {
  id: number;
  name: string;
  current_balance: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  sku: string;
  brand: string;
  category_id?: number;
}

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CreditSaleModalProps {
  service: TechnicalService;
  onClose: () => void;
}

export function CreditSaleModal({ service, onClose }: CreditSaleModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [totalCartAmount, setTotalCartAmount] = useState(0);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    calculateTotalCartAmount();
  }, [cart]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const calculateTotalCartAmount = () => {
    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    setTotalCartAmount(total);
  };

  const calculateProductPrice = (product: Product) => {
    // Eğer cost_price ve category_id varsa kar marjı hesapla
    if (product.cost_price && product.cost_price > 0 && product.category_id && categories.length > 0) {
      const category = categories.find(cat => cat.id === product.category_id);
      const profitMargin = category?.profit_margin || 0;
      if (profitMargin > 0) {
        return product.cost_price * (1 + profitMargin / 100);
      }
    }
    
    // Eğer cost_price yoksa ama category_id varsa, normal price üzerinden kar marjı hesapla
    if (product.category_id && categories.length > 0) {
      const category = categories.find(cat => cat.id === product.category_id);
      const profitMargin = category?.profit_margin || 0;
      if (profitMargin > 0 && product.price > 0) {
        // Normal price'ı cost_price olarak kabul et ve kar marjı ekle
        return product.price * (1 + profitMargin / 100);
      }
    }
    
    // Fallback: normal price kullan
    return product.price || 0;
  };

  const addToCart = async () => {
    if (!selectedProduct || quantity <= 0) return;

    // Stok kontrolü
    if (selectedProduct.stock_quantity < quantity) {
      await Swal.fire({
        title: 'Stok Yetersiz!',
        text: `${selectedProduct.name} ürününden stokta sadece ${selectedProduct.stock_quantity} adet bulunmaktadır.`,
        icon: 'warning',
        confirmButtonText: 'Tamam'
      });
      return;
    }

    const unitPrice = calculateProductPrice(selectedProduct);
    const totalPrice = unitPrice * quantity;

    const existingItem = cart.find(item => item.product.id === selectedProduct.id);
    
    if (existingItem) {
      // Mevcut ürünün miktarını artır - stok kontrolü
      const newTotalQuantity = existingItem.quantity + quantity;
      if (selectedProduct.stock_quantity < newTotalQuantity) {
        await Swal.fire({
          title: 'Stok Yetersiz!',
          text: `${selectedProduct.name} ürününden stokta sadece ${selectedProduct.stock_quantity} adet bulunmaktadır. Sepette zaten ${existingItem.quantity} adet var.`,
          icon: 'warning',
          confirmButtonText: 'Tamam'
        });
        return;
      }
      
      setCart(cart.map(item => 
        item.product.id === selectedProduct.id 
          ? { ...item, quantity: newTotalQuantity, totalPrice: newTotalQuantity * unitPrice }
          : item
      ));
    } else {
      // Yeni ürün ekle
      const newItem: CartItem = {
        id: Date.now(),
        product: selectedProduct,
        quantity,
        unitPrice,
        totalPrice
      };
      setCart([...cart, newItem]);
    }

    // Form'u temizle
    setSelectedProduct(null);
    setQuantity(1);
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
        : item
    ));
  };

  const checkCreditLimit = () => {
    const newBalance = service.current_balance + totalCartAmount;
    return newBalance <= service.credit_limit;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Lütfen en az bir ürün seçin.');
      return;
    }

    // Kredi limiti kontrolü
    if (!checkCreditLimit()) {
      const newBalance = service.current_balance + totalCartAmount;
      const exceedAmount = newBalance - service.credit_limit;
      const confirmMessage = `Bu işlem kredi limitini ${exceedAmount.toLocaleString('tr-TR')} TL aşacak. Devam etmek istediğinize emin misiniz?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    setLoading(true);

    try {
      // Her ürün için ayrı satış kaydı oluştur ve stoktan düş
      for (const item of cart) {
        const data = {
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_amount: item.totalPrice,
          sale_date: new Date().toISOString().split('T')[0],
          notes: notes || `Veresiye satış: ${item.product.name}`
        };

        const response = await fetch(`/api/admin/technical-services/${service.id}/sales`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        // Stoktan düş
        const stockResponse = await fetch(`/api/admin/products/${item.product.id}/stock`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: item.quantity,
            operation: 'decrease'
          }),
        });

        if (!stockResponse.ok) {
          console.error('Failed to update stock for product:', item.product.name);
        }
      }
      
      await Swal.fire({
        title: 'Başarılı!',
        text: 'Veresiye satış kaydedildi ve stoklar güncellendi!',
        icon: 'success',
        confirmButtonText: 'Tamam'
      });
      onClose();
    } catch (error) {
      console.error('Error saving credit sale:', error);
      await Swal.fire({
        title: 'Hata!',
        text: 'Veresiye satış kaydedilirken bir hata oluştu.',
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

          <div className="p-6 space-y-6">
            {/* Current Balance */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Mevcut Bakiye:</span>
                <span className={`text-lg font-bold ${(service.current_balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(service.current_balance || 0).toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-slate-600">Kredi Limiti:</span>
                <span className="text-lg font-bold text-blue-600">
                  {(service.credit_limit || 0).toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>

            {/* Product Selection Form */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Ürün Ekle</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ürün Seçin *
                  </label>
                  <select
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
                        {product.name} - {product.brand} ({product.sku}) {product.stock_quantity > 0 ? `[Stok: ${product.stock_quantity}]` : '[STOK YOK!]'}
                      </option>
                    ))}
                  </select>
                  {selectedProduct && (
                    <div className="mt-2 p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Stok Durumu:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          selectedProduct.stock_quantity > 10 
                            ? 'bg-green-100 text-green-800' 
                            : selectedProduct.stock_quantity > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedProduct.stock_quantity > 0 
                            ? `${selectedProduct.stock_quantity} adet mevcut` 
                            : 'STOK YOK!'
                          }
                        </span>
                      </div>
                      {selectedProduct.stock_quantity === 0 && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg mb-2">
                          <p className="text-sm text-red-600 font-medium">
                            ⚠️ Bu ürün stokta bulunmamaktadır!
                          </p>
                        </div>
                      )}
                      {selectedProduct.stock_quantity > 0 && selectedProduct.stock_quantity <= 5 && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
                          <p className="text-sm text-yellow-600 font-medium">
                            ⚠️ Stok azalıyor! Sadece {selectedProduct.stock_quantity} adet kaldı.
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-slate-600">
                        Birim Fiyat: {calculateProductPrice(selectedProduct).toLocaleString('tr-TR')} ₺
                      </p>
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
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    disabled={selectedProduct?.stock_quantity === 0}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Add to Cart Button */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={!selectedProduct || quantity <= 0 || selectedProduct?.stock_quantity === 0}
                    className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {selectedProduct?.stock_quantity === 0 ? 'Stok Yok!' : 'Sepete Ekle'}
                  </button>
                </div>
              </div>
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Sepet</h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{item.product.name}</h4>
                        <p className="text-sm text-slate-600">{item.product.brand} - {item.product.sku}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-600">Miktar:</label>
                            <input
                              type="number"
                              min="1"
                              max={item.product.stock_quantity}
                              value={item.quantity}
                              onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                            />
                          </div>
                          <div className="text-sm text-slate-600">
                            Birim: {item.unitPrice.toLocaleString('tr-TR')} ₺
                          </div>
                          <div className="text-sm font-semibold text-orange-600">
                            Toplam: {item.totalPrice.toLocaleString('tr-TR')} ₺
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Ürünü kaldır"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Cart Total */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900">Toplam Tutar:</span>
                    <span className="text-xl font-bold text-orange-600">
                      {totalCartAmount.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-slate-600">Yeni Bakiye:</span>
                    <span className={`text-lg font-bold ${((service.current_balance || 0) + totalCartAmount) > (service.credit_limit || 0) ? 'text-red-600' : 'text-green-600'}`}>
                      {((service.current_balance || 0) + totalCartAmount).toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                  {!checkCreditLimit() && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">
                        ⚠️ Bu işlem kredi limitini aşacak!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                type="button"
                onClick={handleSubmit}
                disabled={loading || cart.length === 0}
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
          </div>
        </div>
      </div>
    </>
  );
}
