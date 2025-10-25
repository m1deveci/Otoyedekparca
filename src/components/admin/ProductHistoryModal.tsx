import { X, Package, TrendingUp, TrendingDown, Calendar, DollarSign, Truck, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  stock_quantity: number;
  cost_price?: number;
  price: number;
  sku: string;
  brand: string;
}

interface StockTransaction {
  id: number;
  product_id: number;
  transaction_type: 'stock_add' | 'stock_remove' | 'stock_adjust';
  quantity: number;
  cost_price: number;
  supplier?: string;
  notes?: string;
  purchase_date?: string;
  created_at: string;
}

interface SaleTransaction {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  sale_date: string;
  notes?: string;
  created_at: string;
}

interface ProductHistoryModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductHistoryModal({ product, onClose }: ProductHistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [saleTransactions, setSaleTransactions] = useState<SaleTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'sales'>('stock');

  useEffect(() => {
    loadHistory();
  }, [product.id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      // Stok işlemlerini yükle
      const stockResponse = await fetch(`/api/admin/products/${product.id}/stock-history`);
      if (stockResponse.ok) {
        const stockData = await stockResponse.json();
        setStockTransactions(stockData);
      }

      // Satış işlemlerini yükle (eğer endpoint varsa)
      try {
        const salesResponse = await fetch(`/api/admin/products/${product.id}/sales-history`);
        if (salesResponse.ok) {
          const salesData = await salesResponse.json();
          setSaleTransactions(salesData);
        }
      } catch (error) {
        console.log('Sales history endpoint not available yet');
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'stock_add':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'stock_remove':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stock_adjust':
        return <Package className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'stock_add':
        return 'Stok Eklendi';
      case 'stock_remove':
        return 'Stok Çıkarıldı';
      case 'stock_adjust':
        return 'Stok Düzeltildi';
      default:
        return 'Bilinmeyen';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'stock_add':
        return 'bg-green-100 text-green-800';
      case 'stock_remove':
        return 'bg-red-100 text-red-800';
      case 'stock_adjust':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotals = () => {
    const stockAdded = stockTransactions
      .filter(t => t.transaction_type === 'stock_add')
      .reduce((sum, t) => sum + t.quantity, 0);
    
    const stockRemoved = stockTransactions
      .filter(t => t.transaction_type === 'stock_remove')
      .reduce((sum, t) => sum + t.quantity, 0);
    
    const totalStockCost = stockTransactions
      .filter(t => t.transaction_type === 'stock_add')
      .reduce((sum, t) => sum + (t.quantity * t.cost_price), 0);
    
    const totalSales = saleTransactions.reduce((sum, t) => sum + t.total_amount, 0);
    
    return {
      stockAdded,
      stockRemoved,
      totalStockCost,
      totalSales,
      netStock: stockAdded - stockRemoved
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Geçmiş yükleniyor...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Ürün Geçmişi</h2>
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
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Stok Eklenen</span>
                </div>
                <div className="text-2xl font-bold text-green-900">{totals.stockAdded} adet</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Stok Çıkarılan</span>
                </div>
                <div className="text-2xl font-bold text-red-900">{totals.stockRemoved} adet</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Toplam Alış</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {totals.totalStockCost.toLocaleString('tr-TR')} ₺
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Net Stok</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">{totals.netStock} adet</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'stock'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stok İşlemleri
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'sales'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Satış İşlemleri
              </button>
            </div>

            {/* Stock Transactions */}
            {activeTab === 'stock' && (
              <div className="space-y-4">
                {stockTransactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Henüz stok işlemi bulunmuyor</p>
                  </div>
                ) : (
                  stockTransactions.map((transaction) => (
                    <div key={transaction.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getTransactionIcon(transaction.transaction_type)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTransactionTypeColor(transaction.transaction_type)}`}>
                                {getTransactionTypeText(transaction.transaction_type)}
                              </span>
                              <span className="text-sm text-slate-500">
                                {formatDate(transaction.created_at)}
                              </span>
                            </div>
                            <div className="text-lg font-semibold text-slate-900">
                              {transaction.quantity} adet
                            </div>
                            {transaction.cost_price > 0 && (
                              <div className="text-sm text-slate-600">
                                Alış Fiyatı: {transaction.cost_price.toLocaleString('tr-TR')} ₺
                              </div>
                            )}
                            {transaction.supplier && (
                              <div className="text-sm text-slate-600">
                                Tedarikçi: {transaction.supplier}
                              </div>
                            )}
                            {transaction.notes && (
                              <div className="text-sm text-slate-600 mt-1">
                                Not: {transaction.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">
                            {(transaction.quantity * transaction.cost_price).toLocaleString('tr-TR')} ₺
                          </div>
                          <div className="text-sm text-slate-500">
                            Toplam Tutar
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sales Transactions */}
            {activeTab === 'sales' && (
              <div className="space-y-4">
                {saleTransactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Henüz satış işlemi bulunmuyor</p>
                  </div>
                ) : (
                  saleTransactions.map((transaction) => (
                    <div key={transaction.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Satış
                              </span>
                              <span className="text-sm text-slate-500">
                                {formatDate(transaction.created_at)}
                              </span>
                            </div>
                            <div className="text-lg font-semibold text-slate-900">
                              {transaction.quantity} adet
                            </div>
                            <div className="text-sm text-slate-600">
                              Birim Fiyat: {transaction.unit_price.toLocaleString('tr-TR')} ₺
                            </div>
                            {transaction.notes && (
                              <div className="text-sm text-slate-600 mt-1">
                                Not: {transaction.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {transaction.total_amount.toLocaleString('tr-TR')} ₺
                          </div>
                          <div className="text-sm text-slate-500">
                            Toplam Satış
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
