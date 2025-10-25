import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2, CreditCard, History, DollarSign, ShoppingCart } from 'lucide-react';
import { TechnicalServiceForm } from './TechnicalServiceForm';
import { CreditTransactionModal } from './CreditTransactionModal';
import { CreditHistoryModal } from './CreditHistoryModal';
import { CreditSaleModal } from './CreditSaleModal';

interface TechnicalService {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  tax_number: string;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
}

export function TechnicalServicesTab() {
  const [services, setServices] = useState<TechnicalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingService, setEditingService] = useState<TechnicalService | null>(null);
  const [selectedService, setSelectedService] = useState<TechnicalService | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/admin/technical-services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        // Fallback to mock data if API fails
        const mockServices: TechnicalService[] = [
          {
            id: 1,
            name: 'Ahmet Oto Servis',
            contact_person: 'Ahmet Yılmaz',
            phone: '+90 555 123 4567',
            email: 'ahmet@otoservis.com',
            address: 'İstanbul, Türkiye',
            tax_number: '1234567890',
            credit_limit: 50000,
            current_balance: 15000,
            is_active: true,
            created_at: '2024-01-15'
          },
          {
            id: 2,
            name: 'Mehmet Teknik Servis',
            contact_person: 'Mehmet Demir',
            phone: '+90 555 987 6543',
            email: 'mehmet@teknik.com',
            address: 'Ankara, Türkiye',
            tax_number: '0987654321',
            credit_limit: 30000,
            current_balance: 8000,
            is_active: true,
            created_at: '2024-01-20'
          }
        ];
        setServices(mockServices);
      }
    } catch (error) {
      console.error('Error loading technical services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu teknik servisi silmek istediğinize emin misiniz?')) return;

    try {
      // TODO: API endpoint'i implement et
      console.log('Delete service:', id);
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Teknik servis silinirken bir hata oluştu.');
    }
  };

  const handleEdit = (service: TechnicalService) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingService(null);
    loadServices();
  };

  const handlePayment = (service: TechnicalService) => {
    setSelectedService(service);
    setShowTransactionModal(true);
  };

  const handleHistory = (service: TechnicalService) => {
    setSelectedService(service);
    setShowHistoryModal(true);
  };

  const handleSale = (service: TechnicalService) => {
    setSelectedService(service);
    setShowSaleModal(true);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600';
    if (balance < 0) return 'text-green-600';
    return 'text-slate-600';
  };

  const getBalanceBgColor = (balance: number) => {
    if (balance > 0) return 'bg-red-50';
    if (balance < 0) return 'bg-green-50';
    return 'bg-slate-50';
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Yükleniyor...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Teknik Servisler</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Yeni Teknik Servis
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Henüz teknik servis eklenmemiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                    <p className="text-sm text-slate-500">{service.contact_person}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {service.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Telefon:</span>
                  <span>{service.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">E-posta:</span>
                  <span>{service.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Kredi Limiti:</span>
                  <span>{(service.credit_limit || 0).toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${getBalanceBgColor(service.current_balance || 0)}`}>
                  <span className="font-medium">Mevcut Bakiye:</span>
                  <span className={`font-semibold ${getBalanceColor(service.current_balance || 0)}`}>
                    {(service.current_balance || 0).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Düzenle
                </button>
                <button
                  onClick={() => handleSale(service)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-colors text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Ürün Sat
                </button>
                <button
                  onClick={() => handlePayment(service)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  Ödeme
                </button>
                <button
                  onClick={() => handleHistory(service)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                >
                  <History className="w-4 h-4" />
                  Geçmiş
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TechnicalServiceForm
          service={editingService}
          onClose={handleFormClose}
        />
      )}

      {showTransactionModal && selectedService && (
        <CreditTransactionModal
          service={selectedService}
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedService(null);
            loadServices();
          }}
        />
      )}

      {showHistoryModal && selectedService && (
        <CreditHistoryModal
          service={selectedService}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedService(null);
          }}
        />
      )}

      {showSaleModal && selectedService && (
        <CreditSaleModal
          service={selectedService}
          onClose={() => {
            setShowSaleModal(false);
            setSelectedService(null);
            loadServices();
          }}
        />
      )}
    </div>
  );
}
