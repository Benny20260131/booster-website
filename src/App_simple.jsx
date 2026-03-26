import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';

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
        placeholder: '搜索货号、产品名称...'
      },
      hero: {
        title1: '赋能科学，助力探索',
        title2: '一站式实验室解决方案',
        desc: '我们提供高质量的国产化替代方案，涵盖分子生物学、耗材及化学试剂，助力您的科研事业。'
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
        {currentPage === 'products' && <div className="py-12 px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-center">产品中心</h1></div>}
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