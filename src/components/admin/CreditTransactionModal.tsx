import { X, Save, CreditCard, DollarSign, FileText } from 'lucide-react';
import { useState } from 'react';

interface TechnicalService {
  id: number;
  name: string;
  current_balance: number;
}

interface CreditTransactionModalProps {
  service: TechnicalService;
  onClose: () => void;
}

export function CreditTransactionModal({ service, onClose }: CreditTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'payment' | 'adjustment'>('payment');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    reference_number: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        technical_service_id: service.id,
        transaction_type: transactionType,
        amount: parseFloat(formData.amount),
        description: formData.description,
        reference_number: formData.reference_number,
        created_by: 'Admin', // TODO: Get from auth context
      };

      // TODO: API endpoint'i implement et
      console.log('Credit transaction:', data);
      
      alert('İşlem başarıyla kaydedildi!');
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('İşlem kaydedilirken bir hata oluştu.');
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
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Kredi İşlemi</h2>
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
            {/* Current Balance */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Mevcut Bakiye:</span>
                <span className={`text-lg font-bold ${service.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {service.current_balance.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  İşlem Türü
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTransactionType('payment')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      transactionType === 'payment'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      <span className="font-medium">Ödeme</span>
                    </div>
                    <p className="text-xs mt-1">Bakiye azaltır</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('adjustment')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      transactionType === 'adjustment'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">Düzeltme</span>
                    </div>
                    <p className="text-xs mt-1">Bakiye ayarlar</p>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tutar (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="İşlem açıklaması"
                />
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Referans Numarası
                </label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Referans numarası"
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
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
