import { X, Save, CreditCard, DollarSign, FileText } from 'lucide-react';
import { useState } from 'react';
import { logActions } from '../../utils/logger';

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
    payment_method: 'cash',
  });
  const [useFullBalance, setUseFullBalance] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Türk para birimi formatından sayıya çevir
      let amount = parseFloat(formData.amount.replace(/\./g, '').replace(',', '.')) || 0;
      
      // İşlem türüne göre tutar hesaplama
      if (transactionType === 'payment') {
        // Ödeme yapılıyorsa, mevcut bakiyeden fazla ödeme yapılamaz
        const currentBalance = service.current_balance || 0;
        if (amount > currentBalance) {
          alert(`Ödeme tutarı mevcut bakiyeden (${currentBalance.toLocaleString('tr-TR')} ₺) fazla olamaz!`);
          setLoading(false);
          return;
        }
        // Ödeme tutarını negatif yap (bakiye azaltmak için)
        amount = -amount;
      } else if (transactionType === 'adjustment') {
        // Düzeltme işlemi: Yeni bakiye - Mevcut bakiye = Fark
        const currentBalance = service.current_balance || 0;
        const newBalance = amount;
        amount = newBalance - currentBalance; // Fark hesapla
        
        // Eğer fark 0 ise, değişiklik yok
        if (amount === 0) {
          alert('Mevcut bakiye ile aynı tutar girildi. Değişiklik yapılmadı.');
          setLoading(false);
          return;
        }
      }

      const data = {
        technical_service_id: service.id,
        transaction_type: transactionType,
        amount: amount,
        description: formData.description,
        reference_number: formData.reference_number,
        payment_method: formData.payment_method,
        created_by: 'Admin', // TODO: Get from auth context
      };

      const response = await fetch(`/api/admin/technical-services/${service.id}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Log işlemi
        if (transactionType === 'payment') {
          await logActions.creditPaymentMade(service, Math.abs(amount), formData.payment_method, formData.reference_number);
        } else if (transactionType === 'adjustment') {
          await logActions.systemAction('adjustment', `Bakiye düzeltildi: ${service.name} - Yeni bakiye: ${(service.current_balance + amount).toLocaleString('tr-TR')} ₺`, {
            serviceName: service.name,
            oldBalance: service.current_balance,
            newBalance: service.current_balance + amount,
            adjustment: amount
          });
        }
        
        alert('İşlem başarıyla kaydedildi!');
        onClose();
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('İşlem kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleFullBalanceToggle = () => {
    const newUseFullBalance = !useFullBalance;
    setUseFullBalance(newUseFullBalance);
    
    if (newUseFullBalance) {
      // Tüm bakiyeyi kapat seçildi - mevcut bakiyeyi doldur
      setFormData({ ...formData, amount: (service.current_balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
    } else {
      // Tüm bakiyeyi kapat kaldırıldı - alanı temizle
      setFormData({ ...formData, amount: '' });
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
                <span className={`text-lg font-bold ${(service.current_balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(service.current_balance || 0).toLocaleString('tr-TR')} ₺
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
                    <p className="text-xs mt-1">Bakiye ayarlar (yeni tutar)</p>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {transactionType === 'payment' ? 'Ödeme Tutarı (₺) *' : 'Yeni Bakiye (₺) *'}
                </label>
                {transactionType === 'adjustment' && (
                  <p className="text-xs text-slate-500 mb-2">
                    Mevcut bakiye: {(service.current_balance || 0).toLocaleString('tr-TR')} ₺
                  </p>
                )}
                <div className="space-y-3">
                  {transactionType === 'payment' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="useFullBalance"
                        checked={useFullBalance}
                        onChange={handleFullBalanceToggle}
                        className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="useFullBalance" className="text-sm font-medium text-slate-700">
                        Tüm bakiyeyi kapat ({(service.current_balance || 0).toLocaleString('tr-TR')} ₺)
                      </label>
                    </div>
                  )}
                  <input
                    type="text"
                    required
                    value={formData.amount}
                    onChange={(e) => {
                      // Sadece rakam ve nokta/virgül kabul et
                      const value = e.target.value.replace(/[^0-9.,]/g, '');
                      setFormData({ ...formData, amount: value });
                    }}
                    onBlur={(e) => {
                      // Türk para birimi formatına çevir
                      const numValue = parseFloat(e.target.value.replace(',', '.')) || 0;
                      setFormData({ ...formData, amount: numValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0,00"
                    disabled={useFullBalance}
                  />
                  {transactionType === 'payment' && (service.current_balance || 0) > 0 && (
                    <p className="text-xs text-slate-500">
                      Maksimum ödeme: {(service.current_balance || 0).toLocaleString('tr-TR')} ₺
                    </p>
                  )}
                </div>
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

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ödeme Türü
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="cash">Nakit</option>
                  <option value="credit_card">Kredi Kartı</option>
                  <option value="bank_transfer">Havale/EFT</option>
                  <option value="check">Çek</option>
                </select>
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
