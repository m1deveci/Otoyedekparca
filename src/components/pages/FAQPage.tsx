import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export function FAQPage() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: 'Siparişimi nasıl takip edebilirim?',
      answer: 'Siparişinizi takip etmek için "Sipariş Takip" sayfasından sipariş numaranızı girerek güncel durumunu öğrenebilirsiniz.',
      category: 'siparis'
    },
    {
      id: 2,
      question: 'Kargo ücreti ne kadar?',
      answer: '150₺ ve üzeri siparişlerde kargo ücretsizdir. 150₺ altındaki siparişlerde kargo ücreti 25₺\'dir.',
      category: 'kargo'
    },
    {
      id: 3,
      question: 'Ürün iadesi nasıl yapılır?',
      answer: 'Ürün iadesi için 14 gün içinde bizimle iletişime geçmeniz gerekmektedir. Ürün orijinal ambalajında ve kullanılmamış olmalıdır.',
      category: 'iade'
    },
    {
      id: 4,
      question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      answer: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerini kabul ediyoruz.',
      category: 'odeme'
    },
    {
      id: 5,
      question: 'Ürün garantisi var mı?',
      answer: 'Tüm ürünlerimiz orijinal garantilidir. Garanti süresi ürün türüne göre değişiklik gösterebilir.',
      category: 'garanti'
    },
    {
      id: 6,
      question: 'Stokta olmayan ürünler için ne yapabilirim?',
      answer: 'Stokta olmayan ürünler için bildirim alabilirsiniz. Ürün stokta olduğunda size e-posta ile bilgi verilir.',
      category: 'stok'
    },
    {
      id: 7,
      question: 'Kurumsal alımlar için indirim var mı?',
      answer: 'Evet, kurumsal alımlar için özel indirimlerimiz bulunmaktadır. Detaylar için bizimle iletişime geçin.',
      category: 'kurumsal'
    },
    {
      id: 8,
      question: 'Ürün montajı yapılıyor mu?',
      answer: 'Ürün montajı hizmetimiz bulunmamaktadır. Sadece yedek parça satışı yapmaktayız.',
      category: 'montaj'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'siparis', name: 'Sipariş' },
    { id: 'kargo', name: 'Kargo' },
    { id: 'iade', name: 'İade' },
    { id: 'odeme', name: 'Ödeme' },
    { id: 'garanti', name: 'Garanti' },
    { id: 'stok', name: 'Stok' },
    { id: 'kurumsal', name: 'Kurumsal' },
    { id: 'montaj', name: 'Montaj' }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
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
            <h1 className="text-2xl font-bold text-slate-900">Sıkça Sorulan Sorular</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Merak Ettiklerinizin Cevapları
          </h2>
          <p className="text-lg text-slate-600">
            En çok sorulan sorular ve cevapları burada. Aradığınızı bulamazsanız bizimle iletişime geçin.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map(faq => (
            <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900 pr-4">
                  {faq.question}
                </span>
                {openItems.includes(faq.id) ? (
                  <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(faq.id) && (
                <div className="px-6 pb-6">
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-slate-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Aradığınızı Bulamadınız mı?</h3>
          <p className="text-lg mb-6 opacity-90">
            Sorularınız için bizimle iletişime geçin. Size yardımcı olmaktan mutluluk duyarız.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            İletişime Geç
          </button>
        </div>
      </div>
    </div>
  );
}
