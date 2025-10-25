import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Search, Filter, Download, AlertTriangle, Droplets, Wrench } from 'lucide-react';
import type { Product, Category } from '../../types';
import { ProductForm } from './ProductForm';
import { apiClient } from '../../lib/api';
import { logActions } from '../../utils/logger';

export function ProductsTab() {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Navigation state'ini kontrol et
  useEffect(() => {
    if (location.state) {
      const { selectedCategory: navCategory, showFilters: navShowFilters } = location.state as any;
      if (navCategory) {
        setSelectedCategory(navCategory);
      }
      if (navShowFilters) {
        setShowFilters(navShowFilters);
      }
    }
  }, [location.state]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  // Pagination hesaplamaları
  useEffect(() => {
    const total = filteredProducts.length;
    const pages = Math.ceil(total / itemsPerPage);
    setTotalPages(pages);
    
    // Eğer mevcut sayfa toplam sayfa sayısından büyükse, ilk sayfaya git
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1);
    }
  }, [filteredProducts, itemsPerPage, currentPage]);

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id === parseInt(selectedCategory));
    }

    setFilteredProducts(filtered);
  };

  // Statistics calculation
  const getProductStats = () => {
    const totalProducts = products.length;
    const filterProducts = products.filter(p => p.category_id === 1); // Filtreler kategorisi
    const oilProducts = products.filter(p => p.category_id === 4); // Madeni Yağlar kategorisi
    const lowStockProducts = products.filter(p => p.stock_quantity < 10); // Kritik stok

    return {
      total: totalProducts,
      filters: filterProducts.length,
      oils: oilProducts.length,
      lowStock: lowStockProducts.length
    };
  };

  // Pagination fonksiyonları
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Sayfa değiştiğinde ilk sayfaya git
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleStatClick = (type: string) => {
    switch (type) {
      case 'filters':
        setSelectedCategory('1'); // Filtreler kategorisi ID'si
        setSearchQuery('');
        break;
      case 'oils':
        setSelectedCategory('4'); // Madeni Yağlar kategorisi ID'si
        setSearchQuery('');
        break;
      case 'lowStock':
        // Kritik stok filtreleme için özel logic
        setSearchQuery('');
        setSelectedCategory('');
        // Kritik stok filtreleme için özel state ekleyelim
        setFilteredProducts(products.filter(p => p.stock_quantity < 10));
        break;
      case 'all':
      default:
        setSearchQuery('');
        setSelectedCategory('');
        setFilteredProducts(products);
    }
  };

  const exportProducts = () => {
    const headers = ['ID', 'Ürün Adı', 'SKU', 'Barkod', 'Kategori', 'Alış Fiyatı', 'Satış Fiyatı', 'Stok'];
    const csvRows = [
      headers.join(';'),
      ...filteredProducts.map(product => [
        product.id,
        product.name,
        product.sku || '',
        product.barcode || '',
        categories.find(c => c.id === product.category_id)?.name || '',
        product.cost_price || 0,
        product.sale_price || product.price,
        product.stock_quantity
      ].join(';'))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `urunler_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadProducts = async () => {
    try {
      const data = await apiClient.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
      await apiClient.deleteProduct(parseInt(id));
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ürün silinirken bir hata oluştu.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Kategorisiz';
    return categories.find((c) => c.id === categoryId)?.name || 'Bilinmeyen';
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Yükleniyor...</div>;
  }

  const stats = getProductStats();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ürünler</h2>
          <p className="text-sm text-slate-600">Toplam {filteredProducts.length} ürün</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Filter className="w-4 h-4" />
            Filtreler
          </button>
          <button
            onClick={exportProducts}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            Dışa Aktar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Yeni Ürün
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div 
          onClick={() => handleStatClick('all')}
          className="bg-white p-4 rounded-lg shadow border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Toplam Ürün</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div 
          onClick={() => handleStatClick('filters')}
          className="bg-white p-4 rounded-lg shadow border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Filtreler</p>
              <p className="text-2xl font-bold text-slate-900">{stats.filters}</p>
            </div>
            <Filter className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div 
          onClick={() => handleStatClick('oils')}
          className="bg-white p-4 rounded-lg shadow border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Yağlar</p>
              <p className="text-2xl font-bold text-slate-900">{stats.oils}</p>
            </div>
            <Droplets className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div 
          onClick={() => handleStatClick('lowStock')}
          className="bg-white p-4 rounded-lg shadow border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Kritik Stok</p>
              <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Arama
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ürün adı, SKU, barkod..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="w-full px-4 py-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">
            {searchQuery || selectedCategory ? 'Arama kriterlerinize uygun ürün bulunamadı' : 'Henüz ürün eklenmemiş'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Barkod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Alış Fiyatı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Satış Fiyatı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {getCurrentPageProducts().map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{product.name}</div>
                          <div className="text-sm text-slate-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getCategoryName(product.category_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.sku || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.barcode || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-slate-900 font-semibold">
                        {(product.cost_price || 0).toFixed(2)} ₺
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.sale_price ? (
                        <div>
                          <div className="text-slate-900 font-semibold">
                            {product.sale_price.toFixed(2)} ₺
                          </div>
                          <div className="text-xs text-slate-400 line-through">
                            {product.price.toFixed(2)} ₺
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-900 font-semibold">
                          {product.price.toFixed(2)} ₺
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock_quantity <= 0
                            ? 'bg-red-100 text-red-800'
                            : product.stock_quantity <= product.low_stock_threshold
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {product.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Sayfa başına öğe seçimi */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Sayfa başına:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-slate-600">
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} / {filteredProducts.length}
              </span>
            </div>

            {/* Sayfa navigasyonu */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    currentPage === page
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
