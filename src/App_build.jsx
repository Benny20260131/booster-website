import React, { useState } from 'react';
import { Search, Menu, X, ChevronRight, ChevronDown, Beaker, FlaskConical, Pipette, TestTube, Package, ShoppingCart, Phone, Mail, MapPin, ArrowRight, Star, Award, Shield, Zap, Leaf, TrendingUp, CheckCircle, Info } from 'lucide-react';

const ProductImage = ({ sku, category, className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const imageUrl = `https://via.placeholder.com/200`;
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-80 h-80'
  };
  
  return (
    <div className={`${sizeClasses[size] || sizeClasses.md} ${className} bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden`}>
      {!imgError ? (
        <img
          src={imageUrl}
          alt={sku}
          className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <Beaker className="w-1/2 h-1/2" />
          <span className="text-xs mt-1">{sku?.split('-').pop() || ''}</span>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState('zh');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');

  const t = {
    zh: {
      brand: 'BOOSTER',
      nav: {
        home: '首页',
        products: '产品中心',
        solutions: '解决方案',
        support: '技术支持',
        about: '关于我们',
        contact: '联系我们'
      },
      search: {
        placeholder: '搜索货号、产品名称...',
        results: '找到 {count} 个产品',
        noResults: '未找到相关产品，请尝试其他关键词'
      },
      hero: {
        title1: '赋能科学，助力探索',
        title2: '一站式实验室解决方案',
        desc: '我们提供高质量的国产化替代方案，涵盖分子生物学、耗材及化学试剂，助力您的科研事业。',
        cta1: '立即咨询',
        cta2: '了解更多'
      },
      footer: {
        about: '关于我们',
        products: '产品中心',
        solutions: '解决方案',
        support: '技术支持',
        contact: '联系我们',
        address: '上海市浦东新区锦绣东路2777号19号楼',
        phone: '400-123-4567',
        email: 'service@tflabservice.com',
        quickLinks: '快速链接',
        copyright: '© 2026 Booster Bio. All rights reserved.'
      }
    }
  };

  const translations = t[lang];

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const HomePage = () => (
    <div>
      <section className="bg-white text-red-600 py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">{translations.hero.title1}</h1>
            <h2 className="text-3xl md:text-5xl font-semibold mb-10 tracking-tight">{translations.hero.title2}</h2>
            <p className="text-xl md:text-2xl mb-16 max-w-3xl mx-auto text-gray-600 leading-relaxed">{translations.hero.desc}</p>
            <div className="max-w-2xl mx-auto mb-16">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchTerm || ''}
                  onChange={(e) => {
                    if (e && e.target && typeof e.target.value === 'string') {
                      const value = e.target.value;
                      setSearchTerm(value);
                    }
                  }}
                  placeholder={translations.search.placeholder}
                  className="w-full pl-16 pr-4 py-5 rounded-lg border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg transition-all duration-300"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-8">
                <button 
                  className="bg-red-600 text-white px-10 py-4 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <Search className="w-4 h-4" />
                  搜索产品
                </button>
                <button onClick={() => navigateTo('products')} className="bg-white text-red-600 border-2 border-red-600 px-10 py-4 rounded-lg font-semibold hover:bg-red-50 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105">
                  浏览产品目录
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const ProductsPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <h3 className="text-lg font-bold mb-4 text-gray-900">产品分类</h3>
            <div className="space-y-2">
              <button onClick={() => navigateTo('products')} className="w-full text-left px-4 py-2 rounded-lg transition bg-red-600 text-white">
                全部产品
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">产品搜索</h2>
              <p className="text-gray-600 mt-1">快速找到您需要的实验室产品</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchTerm || ''}
                  onChange={(e) => {
                    if (e && e.target && typeof e.target.value === 'string') {
                      const value = e.target.value;
                      setSearchTerm(value);
                    }
                  }}
                  placeholder={translations.search.placeholder}
                  className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                <ProductImage 
                  sku="BSD-HC-TIP-10UL-001" 
                  category="通用"
                  size="lg"
                  className="w-full h-full"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-red-600 font-semibold mb-1">BSD-HC-TIP-10UL-001</div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">0.1-10 ul，辐照灭菌，带滤芯，带刻度，透明，灭菌，PP，盒装（32mm）</h3>
                <p className="text-sm text-gray-600 mb-2">96/盒，50盒/箱</p>
                <p className="text-sm font-semibold text-red-600 mb-3">请联系询价</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="#" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-red-600">{translations.brand}</span>
              </a>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => navigateTo('home')} className="text-gray-900 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                {translations.nav.home}
              </button>
              <button onClick={() => navigateTo('products')} className="text-gray-900 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                {translations.nav.products}
              </button>
              <button onClick={() => navigateTo('solutions')} className="text-gray-900 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                {translations.nav.solutions}
              </button>
              <button onClick={() => navigateTo('support')} className="text-gray-900 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                {translations.nav.support}
              </button>
              <button onClick={() => navigateTo('about')} className="text-gray-900 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                {translations.nav.about}
              </button>
              <button onClick={() => navigateTo('contact')} className="text-gray-900 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                {translations.nav.contact}
              </button>
            </nav>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => navigateTo('home')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50 w-full text-left">
                {translations.nav.home}
              </button>
              <button onClick={() => navigateTo('products')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50 w-full text-left">
                {translations.nav.products}
              </button>
              <button onClick={() => navigateTo('solutions')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50 w-full text-left">
                {translations.nav.solutions}
              </button>
              <button onClick={() => navigateTo('support')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50 w-full text-left">
                {translations.nav.support}
              </button>
              <button onClick={() => navigateTo('about')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50 w-full text-left">
                {translations.nav.about}
              </button>
              <button onClick={() => navigateTo('contact')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600 hover:bg-gray-50 w-full text-left">
                {translations.nav.contact}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 主内容 */}
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'products' && <ProductsPage />}
        {currentPage === 'solutions' && <div className="py-12 px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-center">解决方案</h1></div>}
        {currentPage === 'support' && <div className="py-12 px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-center">技术支持</h1></div>}
        {currentPage === 'about' && <div className="py-12 px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-center">关于我们</h1></div>}
        {currentPage === 'contact' && <div className="py-12 px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-center">联系我们</h1></div>}
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} {translations.brand}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;