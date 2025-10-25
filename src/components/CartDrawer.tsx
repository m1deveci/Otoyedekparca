import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Sepetim</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-24 h-24 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Sepetiniz Boş</h3>
            <p className="text-slate-600">Alışverişe başlamak için ürün ekleyin</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {items.map((item) => {
                  const price = item.product.sale_price || item.product.price;
                  return (
                    <div key={item.product.id} className="flex gap-4 bg-slate-50 p-4 rounded-lg">
                      <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-slate-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-slate-600 mb-2">
                          {price.toFixed(2)} ₺
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-slate-100 transition-colors rounded-l-lg"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock_quantity}
                              className="p-1.5 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold"
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 p-6 bg-slate-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-slate-900">Toplam:</span>
                <span className="text-2xl font-bold text-orange-600">
                  {getCartTotal().toFixed(2)} ₺
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition-colors"
              >
                Siparişi Tamamla
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
