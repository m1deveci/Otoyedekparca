import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Category } from '../../types';
import { CategoryForm } from './CategoryForm';
import { apiClient } from '../../lib/api';

export function CategoriesTab() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [productCounts, setProductCounts] = useState<{[key: number]: number}>({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      loadProductCounts();
    }
  }, [categories]);

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductCounts = async () => {
    try {
      const counts: {[key: number]: number} = {};
      
      // Her kategori için ürün sayısını hesapla
      for (const category of categories) {
        const products = await apiClient.getProducts();
        const categoryProducts = products.filter(product => product.category_id === category.id);
        counts[category.id] = categoryProducts.length;
      }
      
      setProductCounts(counts);
    } catch (error) {
      console.error('Error loading product counts:', error);
    }
  };

  const handleProductCountClick = (categoryId: number) => {
    // Products sayfasına yönlendir ve kategori filtresini ayarla
    navigate('/admin/products', { 
      state: { 
        selectedCategory: categoryId.toString(),
        showFilters: true 
      } 
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;

    try {
      await apiClient.deleteCategory(parseInt(id));
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kategori silinirken bir hata oluştu.');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
    loadCategories();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Kategoriler</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Kategori
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Henüz kategori eklenmemiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FolderOpen className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                    <p className="text-xs text-slate-500">{category.slug}</p>
                    <p className="text-xs text-green-600 font-medium">
                      Kar Marjı: %{(category as any).profit_margin || 0}
                    </p>
                    <p 
                      className="text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-800 hover:underline transition-colors"
                      onClick={() => handleProductCountClick(category.id)}
                      title="Bu kategorideki ürünleri görüntüle"
                    >
                      Ürün Sayısı: {productCounts[category.id] || 0}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {category.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              {category.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-semibold">Düzenle</span>
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-semibold">Sil</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <CategoryForm category={editingCategory} onClose={handleFormClose} />}
    </div>
  );
}
