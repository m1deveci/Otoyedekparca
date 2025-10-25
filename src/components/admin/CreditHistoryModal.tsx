import { X, Download, Filter, Search, Calendar, DollarSign, CreditCard, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TechnicalService {
  id: number;
  name: string;
  current_balance: number;
}

interface CreditTransaction {
  id: number;
  transaction_type: 'sale' | 'payment' | 'adjustment';
  amount: number;
  description: string;
  reference_number: string;
  created_by: string;
  created_at: string;
}

interface CreditSale {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  sale_date: string;
  notes: string;
}

interface CreditHistoryModalProps {
  service: TechnicalService;
  onClose: () => void;
}

export function CreditHistoryModal({ service, onClose }: CreditHistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [sales, setSales] = useState<CreditSale[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'transactions' | 'sales'>('all');
  const [dateFilter, setDateFilter] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    loadHistory();
  }, [service.id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      // TODO: API endpoint'i implement et
      // Şimdilik mock data
      const mockTransactions: CreditTransaction[] = [
        {
          id: 1,
          transaction_type: 'payment',
          amount: 5000,
          description: 'Nakit ödeme',
          reference_number: 'PAY-001',
          created_by: 'Admin',
          created_at: '2024-01-20 14:30:00'
        },
        {
          id: 2,
          transaction_type: 'adjustment',
          amount: -1000,
          description: 'Bakiye düzeltmesi',
          reference_number: 'ADJ-001',
          created_by: 'Admin',
          created_at: '2024-01-18 10:15:00'
        }
      ];

      const mockSales: CreditSale[] = [
        {
          id: 1,
          product_name: 'Motor Yağı 5W-30',
          quantity: 10,
          unit_price: 150,
          total_amount: 1500,
          sale_date: '2024-01-15',
          notes: 'Veresiye satış'
        },
        {
          id: 2,
          product_name: 'Hava Filtresi',
          quantity: 5,
          unit_price: 50,
          total_amount: 250,
          sale_date: '2024-01-10',
          notes: 'Veresiye satış'
        }
      ];

      setTransactions(mockTransactions);
      setSales(mockSales);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'adjustment':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'sale':
        return <CreditCard className="w-5 h-5 text-orange-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'text-green-600 bg-green-50';
      case 'adjustment':
        return 'text-blue-600 bg-blue-50';
      case 'sale':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'payment':
        return 'Ödeme';
      case 'adjustment':
        return 'Düzeltme';
      case 'sale':
        return 'Satış';
      default:
        return 'Bilinmeyen';
    }
  };

  const filteredData = () => {
    let data: any[] = [];
    
    if (filterType === 'all' || filterType === 'transactions') {
      data = [...data, ...transactions.map(t => ({ ...t, type: 'transaction' }))];
    }
    
    if (filterType === 'all' || filterType === 'sales') {
      data = [...data, ...sales.map(s => ({ ...s, type: 'sale', transaction_type: 'sale' }))];
    }
    
    return data.sort((a, b) => new Date(b.created_at || b.sale_date).getTime() - new Date(a.created_at || a.sale_date).getTime());
  };

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Yükleniyor...</p>
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
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">İşlem Geçmişi</h2>
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

          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setFilterType('transactions')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'transactions'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  İşlemler
                </button>
                <button
                  onClick={() => setFilterType('sales')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'sales'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Satışlar
                </button>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Başlangıç"
                />
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Bitiş"
                />
              </div>
            </div>

            {/* History List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredData().map((item, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTransactionColor(item.transaction_type)}`}>
                        {getTransactionIcon(item.transaction_type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {item.type === 'sale' ? item.product_name : getTransactionTypeText(item.transaction_type)}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {item.type === 'sale' 
                            ? `${item.quantity} adet x ${item.unit_price} ₺`
                            : item.description
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${(item.amount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {(item.amount || 0) > 0 ? '+' : ''}{(item.amount || 0).toLocaleString('tr-TR')} ₺
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.created_at || item.sale_date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  
                  {item.reference_number && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Ref:</span>
                      <span>{item.reference_number}</span>
                    </div>
                  )}
                  
                  {item.notes && (
                    <p className="text-xs text-slate-600 mt-2">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Toplam İşlem:</span>
                <span className="font-bold text-orange-600">
                  {filteredData().length} işlem
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
