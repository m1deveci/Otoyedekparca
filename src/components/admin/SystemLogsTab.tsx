import { useState, useEffect } from 'react';
import { Clock, User, Activity, Database, CreditCard, Package, Building2, ShoppingCart, Filter, Search, Download } from 'lucide-react';

interface SystemLog {
  id: number;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: number;
  description: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export function SystemLogsTab() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    search: ''
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.entity_type) params.append('entity_type', filters.entity_type);
      
      const response = await fetch(`/api/admin/system-logs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let filteredLogs = data;
        
        if (filters.search) {
          filteredLogs = data.filter((log: SystemLog) => 
            log.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            log.entity_type.toLowerCase().includes(filters.search.toLowerCase()) ||
            log.action.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        
        setLogs(filteredLogs);
      } else {
        console.error('Failed to load system logs');
      }
    } catch (error) {
      console.error('Error loading system logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Database className="w-4 h-4 text-green-600" />;
      case 'updated': return <Activity className="w-4 h-4 text-blue-600" />;
      case 'deleted': return <Database className="w-4 h-4 text-red-600" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-green-600" />;
      case 'credit_sale': return <ShoppingCart className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'category': return <Database className="w-4 h-4 text-blue-600" />;
      case 'product': return <Package className="w-4 h-4 text-purple-600" />;
      case 'technical_service': return <Building2 className="w-4 h-4 text-orange-600" />;
      case 'order': return <ShoppingCart className="w-4 h-4 text-green-600" />;
      case 'credit_transaction': return <CreditCard className="w-4 h-4 text-red-600" />;
      default: return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'credit_sale': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Tarih', 'Kullanıcı', 'İşlem', 'Varlık Türü', 'Açıklama', 'IP Adresi'],
      ...logs.map(log => [
        formatDate(log.created_at),
        log.user_id || 'Sistem',
        log.action,
        log.entity_type,
        log.description,
        log.ip_address
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sistem Logları</h2>
          <p className="text-slate-600">Tüm sistem işlemlerinin kayıtları</p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Dışa Aktar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              İşlem Türü
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Tümü</option>
              <option value="created">Oluşturuldu</option>
              <option value="updated">Güncellendi</option>
              <option value="deleted">Silindi</option>
              <option value="payment">Ödeme</option>
              <option value="credit_sale">Veresiye Satış</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Varlık Türü
            </label>
            <select
              value={filters.entity_type}
              onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Tümü</option>
              <option value="category">Kategori</option>
              <option value="product">Ürün</option>
              <option value="technical_service">Teknik Servis</option>
              <option value="order">Sipariş</option>
              <option value="credit_transaction">Kredi İşlemi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Arama
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Açıklama, varlık türü..."
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ action: '', entity_type: '', search: '' })}
              className="w-full px-4 py-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white border border-slate-200 rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Henüz sistem logu bulunmuyor</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    {getEntityIcon(log.entity_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-slate-600">
                        {log.entity_type}
                      </span>
                      <span className="text-sm text-slate-500">
                        #{log.entity_id}
                      </span>
                    </div>
                    
                    <p className="text-slate-900 font-medium mb-1">
                      {log.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.user_id || 'Sistem'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(log.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {log.ip_address}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
