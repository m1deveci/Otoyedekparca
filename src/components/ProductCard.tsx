import { ShoppingCart, Package, Star, Heart, Eye } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const finalPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const isCriticalStock = product.stock_quantity > 0 && product.stock_quantity <= 3;
  const isLowStock = product.stock_quantity > 3 && product.stock_quantity <= product.low_stock_threshold;
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-slate-100">
      {/* Ürün Resmi */}
      <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-20 h-20 text-slate-300" />
          </div>
        )}
        
        {/* İndirim Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Stok Durumu */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="text-center">
              <span className="text-white font-bold text-xl block">TÜKENDİ</span>
              <span className="text-slate-300 text-sm">Yakında gelir</span>
            </div>
          </div>
        )}
        
        {isCriticalStock && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
            ⚠️ Son {product.stock_quantity} Ürün
          </div>
        )}
        
        {isLowStock && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            Sadece {product.stock_quantity} Adet
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button className="bg-white text-slate-700 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="bg-white text-slate-700 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ürün Bilgileri */}
      <div className="p-6">
        {/* Marka */}
        <div className="text-sm text-orange-600 font-semibold mb-2">{product.brand}</div>
        
        {/* Ürün Adı */}
        <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 min-h-[3rem] text-lg">
          {product.name}
        </h3>
        
        {/* SKU */}
        <div className="text-xs text-slate-500 mb-4">SKU: {product.sku}</div>

        {/* Fiyat */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-sm text-slate-400 line-through">
                {product.price.toFixed(2)} ₺
              </span>
            )}
            <span className="text-2xl font-bold text-slate-900">
              {finalPrice.toFixed(2)} ₺
            </span>
          </div>
          
          {/* Yıldız Puanı */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm text-slate-600 ml-1">(4.8)</span>
          </div>
        </div>

        {/* Stok Uyarısı */}
        {!isOutOfStock && isCriticalStock && (
          <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 font-semibold text-center">
              ⚡ Hemen sipariş verin! Son {product.stock_quantity} ürün
            </p>
          </div>
        )}

        {/* Sepete Ekle Butonu */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <ShoppingCart className="w-5 h-5" />
          {isOutOfStock ? 'Stokta Yok' : 'Sepete Ekle'}
        </button>
      </div>
    </div>
  );
}
