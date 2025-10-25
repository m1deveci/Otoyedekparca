import { ArrowLeft, Users, Target, Award, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AboutPage() {
  const navigate = useNavigate();

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
            <h1 className="text-2xl font-bold text-slate-900">Hakkımızda</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            OtoRıdvan ile Güvenli Alışveriş
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            2010 yılından beri otomotiv sektöründe hizmet veren OtoRıdvan, 
            kaliteli ürünler ve güvenilir hizmet anlayışıyla müşteri memnuniyetini ön planda tutar.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Müşteri Odaklı</h3>
            <p className="text-slate-600">
              Müşteri memnuniyeti bizim önceliğimizdir. Her zaman yanınızdayız.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Kalite Garantisi</h3>
            <p className="text-slate-600">
              Sadece orijinal ve kaliteli ürünleri müşterilerimize sunuyoruz.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Uzman Kadro</h3>
            <p className="text-slate-600">
              Alanında uzman ekibimizle size en iyi hizmeti veriyoruz.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Güvenilir Hizmet</h3>
            <p className="text-slate-600">
              Yılların verdiği deneyimle güvenilir hizmet sunuyoruz.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Hikayemiz</h3>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p className="mb-4">
              OtoRıdvan, 2010 yılında otomotiv sektöründe faaliyet göstermeye başladı. 
              Kuruluşundan bu yana, müşteri memnuniyetini ön planda tutarak, 
              kaliteli ürünler ve güvenilir hizmet anlayışıyla sektörde öncü konumunu korumaktadır.
            </p>
            <p className="mb-4">
              Geniş ürün yelpazemizle, araç sahiplerinin tüm ihtiyaçlarını karşılamayı hedefliyoruz. 
              Filtrelerden motor yağlarına, fren balatalarından egzoz parçalarına kadar 
              her türlü otomotiv yedek parçasını uygun fiyatlarla sunuyoruz.
            </p>
            <p>
              Teknolojik altyapımız ve deneyimli ekibimizle, 
              müşterilerimize en iyi alışveriş deneyimini yaşatmayı amaçlıyoruz.
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6">Bizimle İletişime Geçin</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Adres</h4>
              <p>İstanbul, Türkiye</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Telefon</h4>
              <p>+90 XXX XXX XX XX</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">E-posta</h4>
              <p>info@otoridvan.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
