import { ArrowLeft, Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function OrderTrackingPage() {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    
    // TODO: API endpoint'i implement et
    // Şimdilik mock data
    setTimeout(() => {
      setOrderStatus({
        orderNumber: orderNumber,
        status: 'shipped',
        date: '2024-01-15',
        estimatedDelivery: '2024-01-18',
        trackingNumber: 'TR123456789',
        carrier: 'Aras Kargo',
        steps: [
          { id: 1, name: 'Sipariş Alındı', status: 'completed', date: '2024-01-15 10:30' },
          { id: 2, name: 'Hazırlanıyor', status: 'completed', date: '2024-01-15 14:20' },
          { id: 3, name: 'Kargoya Verildi', status: 'completed', date: '2024-01-16 09:15' },
          { id: 4, name: 'Yolda', status: 'current', date: '2024-01-16 15:30' },
          { id: 5, name: 'Teslim Edildi', status: 'pending', date: null },
        ]
      });
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'current':
        return 'text-orange-600 bg-orange-100';
      case 'pending':
        return 'text-slate-400 bg-slate-100';
      default:
        return 'text-slate-400 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'current':
        return <Truck className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Ana Sayfaya Dön</span>
            </button>
            <div className="h-6 w-px bg-slate-300" />
            <h1 className="text-2xl font-bold text-slate-900">Sipariş Takip</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Siparişinizi Takip Edin
          </h2>
          <p className="text-lg text-slate-600">
            Sipariş numaranızı girerek siparişinizin güncel durumunu öğrenebilirsiniz.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Sipariş numaranızı girin"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? 'Aranıyor...' : 'Sorgula'}
            </button>
          </form>
        </div>

        {/* Order Status */}
        {orderStatus && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Sipariş #{orderStatus.orderNumber}</h3>
                <p className="text-slate-600">Sipariş Tarihi: {orderStatus.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Kargo Takip No</p>
                <p className="font-semibold text-slate-900">{orderStatus.trackingNumber}</p>
                <p className="text-sm text-slate-600">{orderStatus.carrier}</p>
              </div>
            </div>

            {/* Status Steps */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 mb-4">Sipariş Durumu</h4>
              {orderStatus.steps.map((step: any, index: number) => (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-slate-900">{step.name}</h5>
                      {step.date && (
                        <span className="text-sm text-slate-600">{step.date}</span>
                      )}
                    </div>
                    {step.status === 'current' && (
                      <p className="text-sm text-orange-600 mt-1">
                        Tahmini teslimat: {orderStatus.estimatedDelivery}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="mt-8 p-6 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Sorularınız mı var?</h4>
              <p className="text-slate-600 mb-4">
                Siparişinizle ilgili herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  İletişime Geç
                </button>
                <button className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Yardım Merkezi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!orderStatus && (
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Sipariş Numaranızı Bulamıyor musunuz?</h3>
            <p className="text-lg mb-6 opacity-90">
              Sipariş numaranızı e-posta kutunuzda arayabilir veya bizimle iletişime geçebilirsiniz.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/contact')}
                className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                İletişime Geç
              </button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                E-posta Kontrol Et
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
