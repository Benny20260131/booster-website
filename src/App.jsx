import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Menu, X, ChevronRight, ChevronDown, Beaker, FlaskConical, Pipette, TestTube, Package, ShoppingCart, Phone, Mail, MapPin, ArrowRight, Star, Award, Shield, Zap, Leaf, TrendingUp, CheckCircle, Info } from 'lucide-react';
import productsData from './products.json';
import { getProductImage, hasRealImage } from './data/imageLoader';

const ProductImage = ({ sku, category, className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const imageUrl = getProductImage(sku, category);
  
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
          <span className="text-xs mt-1">{sku.split('-').pop()}</span>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState('zh');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [activeApplication, setActiveApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const searchTimeoutRef = useRef(null);

  // 滚动动画逻辑
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementTop < windowHeight - 100) {
          element.classList.add('visible');
        }
      });
    };

    // 初始检查
    handleScroll();

    // 添加滚动监听
    window.addEventListener('scroll', handleScroll);

    // 清理
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
      product: {
        brand: '品牌',
        sku: '品牌货号',
        description: '产品描述',
        specification: '规格',
        price: '价格',
        inquire: '咨询定价',
        details: '查看详情',
        addToCart: '加入询价单',
        close: '关闭',
        application: '应用范围',
        category: '分类',
        productImage: '产品图片'
      },
      footer: {
        desc: 'BOOSTER致力于提供高品质的实验室自动化解决方案与国产化试剂，助力科学研究更高效。',
        quickLinks: '快速链接',
        contactUs: '联系我们',
        copyright: '© 2026 BOOSTER. 保留所有权利。'
      }
    },
    en: {
      brand: 'Booster Bio',
      nav: {
        home: 'Home',
        products: 'Products',
        solutions: 'Solutions',
        support: 'Support',
        about: 'About Us',
        contact: 'Contact'
      },
      search: {
        placeholder: 'Search SKU, product name...',
        results: 'Found {count} products',
        noResults: 'No products found, please try other keywords'
      },
      hero: {
        title1: 'Empowering Science',
        title2: 'One-Stop Lab Solutions',
        desc: 'We provide high-quality domestic alternatives covering molecular biology, consumables, and chemical reagents to support your research.',
        cta1: 'Contact Us',
        cta2: 'Learn More'
      },
      product: {
        brand: 'Brand',
        sku: 'SKU',
        description: 'Description',
        specification: 'Specification',
        price: 'Price',
        inquire: 'Request Quote',
        details: 'View Details',
        addToCart: 'Add to Inquiry',
        close: 'Close',
        application: 'Application',
        category: 'Category',
        productImage: 'Product Image'
      },
      footer: {
        desc: 'Booster is committed to providing high-quality laboratory automation solutions and domestic reagents to make scientific research more efficient.',
        quickLinks: 'Quick Links',
        contactUs: 'Contact Us',
        copyright: '© 2026 Booster Bio. All rights reserved.'
      }
    }
  };

  const translations = t[lang];

  const allProducts = useMemo(() => {
    const products = [];
    productsData.categories.forEach(category => {
      category.subCategories.forEach(subCat => {
        subCat.categories.forEach(cat => {
          cat.products.forEach(product => {
            // 清理数据，确保字段类型正确
            products.push({
              ...product,
              brandSku: typeof product.brandSku === 'string' ? product.brandSku : '',
              description: typeof product.description === 'string' ? product.description : '',
              specification: typeof product.specification === 'string' ? product.specification : '',
              _category: category.name || '',
              _application: subCat.name || '',
              _subCategory: cat.name || ''
            });
          });
        });
      });
    });
    return products;
  }, []);

  const filteredProducts = useMemo(() => {
    let products = allProducts;
    
    if (activeCategory) {
      products = products.filter(p => p._category === activeCategory);
      
      if (activeApplication) {
        products = products.filter(p => p._application === activeApplication);
        
        if (activeSubCategory) {
          products = products.filter(p => p._subCategory === activeSubCategory);
        }
      }
    }
    
    // 添加额外的安全检查：确保searchTerm是字符串且不为空
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
      try {
        const term = searchTerm.toLowerCase();
        products = products.filter(p => {
          try {
            const description = typeof p.description === 'string' ? p.description.toLowerCase() : '';
            const brandSku = typeof p.brandSku === 'string' ? p.brandSku.toLowerCase() : '';
            const specification = typeof p.specification === 'string' ? p.specification.toLowerCase() : '';
            return description.includes(term) || brandSku.includes(term) || specification.includes(term);
          } catch (err) {
            console.warn('搜索过滤错误 (产品:', p.brandSku, '):', err);
            return false;
          }
        });
      } catch (err) {
        console.error('搜索处理错误:', err);
      }
    }
    
    return products;
  }, [activeCategory, activeApplication, activeSubCategory, searchTerm, allProducts]);

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const selectCategory = (categoryName) => {
    setActiveCategory(categoryName);
    setActiveApplication(null);
    setActiveSubCategory(null);
    setCurrentPage('products');
    setIsMenuOpen(false);
  };

  const selectApplication = (applicationName) => {
    setActiveApplication(applicationName);
    setActiveSubCategory(null);
  };

  const selectSubCategory = (subCategoryName) => {
    setActiveSubCategory(subCategoryName);
  };

  const generateSearchSuggestions = (term) => {
    if (!term || term.trim() === '') {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 防抖处理
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const timeoutId = setTimeout(() => {
      const termLower = term.toLowerCase();
      const suggestions = [];
      const seen = new Set();

      // 从产品数据中提取建议
      allProducts.forEach(product => {
        try {
          const description = typeof product.description === 'string' ? product.description : '';
          const brandSku = typeof product.brandSku === 'string' ? product.brandSku : '';
          const specification = typeof product.specification === 'string' ? product.specification : '';

          // 从描述中提取建议
          if (description.toLowerCase().includes(termLower)) {
            const words = description.split(/\s+/);
            words.forEach(word => {
              if (word.toLowerCase().includes(termLower) && word.length > 2 && !seen.has(word)) {
                suggestions.push(word);
                seen.add(word);
              }
            });
          }

          // 从品牌货号中提取建议
          if (brandSku.toLowerCase().includes(termLower) && !seen.has(brandSku)) {
            suggestions.push(brandSku);
            seen.add(brandSku);
          }

          // 从规格中提取建议
          if (specification.toLowerCase().includes(termLower)) {
            const specs = specification.split(/[,，;；\s+]/);
            specs.forEach(spec => {
              if (spec.toLowerCase().includes(termLower) && spec.length > 2 && !seen.has(spec)) {
                suggestions.push(spec);
                seen.add(spec);
              }
            });
          }
        } catch (err) {
          console.warn('Error generating suggestions:', err);
        }
      });

      // 限制建议数量
      setSearchSuggestions(suggestions.slice(0, 5));
      setShowSuggestions(suggestions.length > 0);
    }, 300); // 300ms防抖延迟

    searchTimeoutRef.current = timeoutId;
  };

  const handleSearch = () => {
    // 只切换页面，不进行其他操作
    if (currentPage !== 'products') {
      setCurrentPage('products');
    }
    setShowSuggestions(false);
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const navigateTo = (page, product = null) => {
    setCurrentPage(page);
    if (product) {
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const ProductModal = ({ product, onClose }) => {
    if (!product) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-red-50 to-orange-50">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Beaker className="w-6 h-6 text-red-600" />
              {translations.product.details}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">{translations.product.productImage}</h3>
                  <ProductImage
                    sku={product.brandSku}
                    category={product._category}
                    size="xl"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">{translations.product.sku}</h3>
                  <p className="text-lg font-mono text-red-600">{product.brandSku}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">{translations.product.description}</h3>
                  <p className="text-gray-900">{product.description}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">{translations.product.specification}</h3>
                  <p className="text-gray-900">{product.specification}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">{translations.product.application}</h3>
                  <p className="text-gray-900">{product._application}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">{translations.product.category}</h3>
                  <p className="text-gray-900">{product._subCategory}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">{translations.product.price}</h3>
                  {product.price ? (
                    <p className="text-gray-900">{product.price}</p>
                  ) : (
                    <p className="text-red-600 font-semibold">请联系客服询价</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {translations.product.inquire}
              </button>
              <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition">
                {translations.product.close}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HomePage = () => (
    <div>
      <section className="bg-white text-red-600 py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight animate-fade-in">{translations.hero.title1}</h1>
            <h2 className="text-3xl md:text-5xl font-semibold mb-10 tracking-tight animate-fade-in-delay">{translations.hero.title2}</h2>
            <p className="text-xl md:text-2xl mb-16 max-w-3xl mx-auto text-gray-600 leading-relaxed animate-fade-in-delay-2">{translations.hero.desc}</p>
            <div className="max-w-2xl mx-auto mb-16 animate-fade-in-delay-3">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchTerm || ''}
                  onChange={(e) => {
                    try {
                      if (e && e.target && typeof e.target.value === 'string') {
                        const value = e.target.value;
                        setSearchTerm(value);
                        generateSearchSuggestions(value);
                      }
                    } catch (err) {
                      console.warn('搜索输入错误:', err);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  onFocus={() => {
                    if (searchTerm.trim() !== '') {
                      generateSearchSuggestions(searchTerm);
                    }
                  }}
                  placeholder={translations.search.placeholder}
                  className="w-full pl-16 pr-4 py-5 rounded-lg border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg transition-all duration-300"
                />
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto border border-gray-200 animate-fade-in">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-800 flex items-center gap-3 transition-all duration-200"
                      >
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-8">
                <button 
                  onClick={handleSearch}
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

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 tracking-tight scroll-animate">产品分类</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {productsData.categories.map((category, index) => (
              <div key={index} onClick={() => selectCategory(category.name)} className="bg-white rounded-2xl shadow-sm p-8 cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 scroll-animate" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6">
                    {index === 0 && <Package className="w-10 h-10 text-white" />}
                    {index === 1 && <Beaker className="w-10 h-10 text-white" />}
                    {index === 2 && <FlaskConical className="w-10 h-10 text-white" />}
                    {index === 3 && <Pipette className="w-10 h-10 text-white" />}
                    {index === 4 && <TestTube className="w-10 h-10 text-white" />}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.subCategories.length} 个应用范围</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 tracking-tight scroll-animate">核心优势</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center scroll-animate" style={{ animationDelay: '0.1s' }}>
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">质量保证</h3>
              <p className="text-gray-600 text-lg">ISO认证，符合国际标准</p>
            </div>
            <div className="text-center scroll-animate" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">国产替代</h3>
              <p className="text-gray-600 text-lg">高品质国产化解决方案</p>
            </div>
            <div className="text-center scroll-animate" style={{ animationDelay: '0.3s' }}>
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">快速交付</h3>
              <p className="text-gray-600 text-lg">现货供应，快速发货</p>
            </div>
            <div className="text-center scroll-animate" style={{ animationDelay: '0.4s' }}>
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">专业支持</h3>
              <p className="text-gray-600 text-lg">专业技术团队全程支持</p>
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
              <button onClick={() => selectCategory(null)} className={`w-full text-left px-4 py-2 rounded-lg transition ${!activeCategory ? 'bg-red-600 text-white' : 'hover:bg-gray-100'}`}>
                全部产品
              </button>
              {productsData.categories.map((category, index) => (
                <div key={index}>
                  <button onClick={() => { toggleCategory(category.name); selectCategory(category.name); }} className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center justify-between ${activeCategory === category.name ? 'bg-red-600 text-white' : 'hover:bg-gray-100'}`}>
                    <span>{category.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategories[category.name] ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedCategories[category.name] && activeCategory === category.name && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.subCategories.map((subCat, subIndex) => (
                        <div key={subIndex}>
                          <button onClick={() => selectApplication(subCat.name)} className={`w-full text-left px-3 py-1.5 rounded text-sm transition ${activeApplication === subCat.name ? 'bg-red-100 text-red-700 font-medium' : 'hover:bg-gray-100'}`}>
                            {subCat.name}
                          </button>
                          {activeApplication === subCat.name && (
                            <div className="ml-4 mt-1 space-y-1">
                              {subCat.categories.map((cat, catIndex) => (
                                <button key={catIndex} onClick={() => selectSubCategory(cat.name)} className={`w-full text-left px-3 py-1 rounded text-sm transition ${activeSubCategory === cat.name ? 'bg-red-200 text-red-800 font-medium' : 'hover:bg-gray-100'}`}>
                                  {cat.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
                    try {
                      if (e && e.target && typeof e.target.value === 'string') {
                        const value = e.target.value;
                        setSearchTerm(value);
                        generateSearchSuggestions(value);
                      }
                    } catch (err) {
                      console.warn('搜索输入错误:', err);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  onFocus={() => {
                    if (searchTerm.trim() !== '') {
                      generateSearchSuggestions(searchTerm);
                    }
                  }}
                  placeholder={translations.search.placeholder}
                  className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto border border-gray-200">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-800 flex items-center gap-3"
                      >
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button 
                  onClick={handleSearch}
                  className="bg-red-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  搜索
                </button>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="bg-gray-200 text-gray-700 px-8 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  清空搜索
                </button>
              </div>
              {searchTerm && (
                <div className="mt-6 text-center text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <strong>搜索结果：</strong>{translations.search.results.replace('{count}', filteredProducts.length)}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.slice(0, 60).map((product, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  <ProductImage 
                    sku={product.brandSku} 
                    category={product._category}
                    size="lg"
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs text-red-600 font-semibold mb-1">{product.brandSku}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.description}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.specification}</p>
                  {product.price ? (
                    <p className="text-sm font-semibold text-green-600 mb-3">{product.price}</p>
                  ) : (
                    <p className="text-sm font-semibold text-red-600 mb-3">请联系询价</p>
                  )}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-700 transition">
                      {translations.product.details}
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-300 transition">
                      {translations.product.inquire}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length > 60 && (
            <div className="mt-8 text-center">
              <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
                加载更多产品
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );

  const SolutionsPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const energySolutions = [
      {
        title: "智能空调节能系统",
        description: "基于AI算法的智能空调节能解决方案，实现能耗优化与智能控制",
        icon: <Zap className="w-8 h-8" />,
        features: ["AI智能调温", "能耗实时监控", "远程智能控制", "节能率高达40%"],
        stats: { energy: "40%", cost: "30%", efficiency: "95%" }
      },
      {
        title: "绿色数据中心制冷",
        description: "专为数据中心设计的高效制冷解决方案，降低PUE值，提升运行效率",
        icon: <Leaf className="w-8 h-8" />,
        features: ["低PUE设计", "自然冷却技术", "智能温控系统", "绿色环保"],
        stats: { energy: "35%", cost: "25%", efficiency: "92%" }
      },
      {
        title: "工业厂房节能改造",
        description: "针对工业厂房的综合性节能改造方案，涵盖空调、照明、设备优化",
        icon: <TrendingUp className="w-8 h-8" />,
        features: ["综合能耗分析", "定制化改造方案", "ROI快速回收", "持续优化服务"],
        stats: { energy: "45%", cost: "40%", efficiency: "98%" }
      }
    ];

    const handleTabChange = (index) => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveTab(index);
        setIsAnimating(false);
      }, 300);
    };

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-red-600 mb-6 tracking-tight">
              智能节能解决方案
            </h1>
            <p className="text-xl text-red-700 max-w-3xl mx-auto leading-relaxed">
              基于先进AI技术的空调节能解决方案，为您的企业实现智能化能耗管理与成本优化
            </p>
          </div>

          <div className="mb-16">
            <div className="flex justify-center gap-4 mb-12">
              {energySolutions.map((solution, index) => (
                <button
                  key={index}
                  onClick={() => handleTabChange(index)}
                  className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === index
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                      : 'bg-gray-200 text-red-700 hover:bg-gray-300'
                  }`}
                >
                  {solution.title}
                </button>
              ))}
            </div>

            <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className="bg-gray-50 rounded-3xl p-8 shadow-2xl border border-gray-200">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                        {energySolutions[activeTab].icon}
                      </div>
                      <h2 className="text-3xl font-bold text-red-600">
                        {energySolutions[activeTab].title}
                      </h2>
                    </div>
                    <p className="text-lg text-red-700 mb-8 leading-relaxed">
                      {energySolutions[activeTab].description}
                    </p>
                    <div className="space-y-4">
                      {energySolutions[activeTab].features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-red-600" />
                          </div>
                          <span className="text-red-800">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(energySolutions[activeTab].stats).map(([key, value], index) => (
                      <div key={index} className="bg-white rounded-2xl p-6 text-center border border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                        <div className="text-4xl font-bold text-red-600 mb-2">
                          {value}
                        </div>
                        <div className="text-sm text-red-700">
                          {key === 'energy' && '节能率'}
                          {key === 'cost' && '成本降低'}
                          {key === 'efficiency' && '运行效率'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-red-600 text-center mb-12">核心优势</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: <Award className="w-8 h-8" />, title: "质量保证", desc: "ISO认证，符合国际标准" },
                { icon: <Zap className="w-8 h-8" />, title: "高效节能", desc: "节能率高达40%以上" },
                { icon: <Star className="w-8 h-8" />, title: "智能控制", desc: "AI算法智能调节" },
                { icon: <CheckCircle className="w-8 h-8" />, title: "专业服务", desc: "全流程技术支持" }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-red-600 mb-2">{item.title}</h3>
                  <p className="text-red-700">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-red-600 text-center mb-12">应用案例</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "大型商业综合体", savings: "¥280万/年", area: "50,000㎡" },
                { title: "数据中心", savings: "¥150万/年", area: "8,000㎡" },
                { title: "工业制造企业", savings: "¥320万/年", area: "120,000㎡" }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-300 hover:border-red-500 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <h3 className="text-xl font-bold text-red-600 mb-4">{item.title}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-red-700">年节省成本</span>
                      <span className="text-2xl font-bold text-red-600">{item.savings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-700">覆盖面积</span>
                      <span className="text-lg font-semibold text-red-800">{item.area}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-8 text-white text-center shadow-2xl shadow-red-500/30">
            <h2 className="text-3xl font-bold mb-4">立即获取节能方案</h2>
            <p className="text-xl mb-6 text-red-100">专业团队为您提供定制化节能解决方案</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
                <Mail className="w-5 h-5" />
                <span>service@tflabservice.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AboutPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* 公司简介部分 */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">关于我们</h1>
        <div className="max-w-4xl mx-auto">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            博仕达（Booster）是一家专注于生命科学领域的高新技术企业，致力于为全球科研机构、医疗机构和生物制药企业提供高品质的国产化替代解决方案。
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
              <h3 className="text-2xl font-bold text-red-600 mb-4">公司使命</h3>
              <p className="text-gray-700 leading-relaxed">
                以科技创新为核心，推动生命科学领域国产化进程，为客户提供优质、高效、经济的实验室解决方案，助力科学研究与产业发展。
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">公司愿景</h3>
              <p className="text-gray-700 leading-relaxed">
                成为生命科学领域领先的国产化解决方案提供商，打造具有国际竞争力的生命科学品牌，推动中国生物科技产业创新发展。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 核心业务部分 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">核心业务</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Beaker className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">分子生物学试剂</h3>
            <p className="text-gray-600 leading-relaxed">
              涵盖PCR、qPCR、核酸提取、克隆等全系列产品，广泛应用于基因检测、疾病诊断、药物研发等领域。
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">实验耗材</h3>
            <p className="text-gray-600 leading-relaxed">
              吸头、离心管、培养皿、PCR板等高品质耗材，满足各类实验室操作需求，确保实验结果准确性。
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">化学试剂</h3>
            <p className="text-gray-600 leading-relaxed">
              ADC连接子、小分子化合物、有机溶剂等，广泛应用于生物化学、药物合成、分析检测等领域。
            </p>
          </div>
        </div>
      </div>

      {/* 联系我们部分 */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">联系我们</h2>
        <p className="text-xl mb-6">获取更多产品信息和报价</p>
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <span>service@tflabservice.com</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-red-600">{translations.brand}</h1>
              <nav className="hidden md:flex gap-6">
                <button onClick={() => navigateTo('home')} className={`font-medium ${currentPage === 'home' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}>
                  {translations.nav.home}
                </button>
                <button onClick={() => navigateTo('products')} className={`font-medium ${currentPage === 'products' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}>
                  {translations.nav.products}
                </button>
                <button onClick={() => navigateTo('solutions')} className={`font-medium ${currentPage === 'solutions' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}>
                  {translations.nav.solutions}
                </button>
                <button onClick={() => navigateTo('about')} className={`font-medium ${currentPage === 'about' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}>
                  {translations.nav.about}
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">
                {lang === 'zh' ? 'EN' : '中文'}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <nav className="px-4 py-4 space-y-2">
            <button onClick={() => navigateTo('home')} className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100">
              {translations.nav.home}
            </button>
            <button onClick={() => navigateTo('products')} className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100">
              {translations.nav.products}
            </button>
            <button onClick={() => navigateTo('solutions')} className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100">
              {translations.nav.solutions}
            </button>
            <button onClick={() => navigateTo('about')} className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100">
              {translations.nav.about}
            </button>
          </nav>
        </div>
      )}

      <main>
        {currentPage === 'home' && HomePage()}
        {currentPage === 'products' && ProductsPage()}
        {currentPage === 'solutions' && <SolutionsPage />}
        {currentPage === 'about' && AboutPage()}
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{translations.brand}</h3>
              <p className="text-gray-400">{translations.footer.desc}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{translations.footer.quickLinks}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigateTo('products')} className="hover:text-white transition">产品中心</button></li>
                <li><button onClick={() => navigateTo('about')} className="hover:text-white transition">关于我们</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{translations.footer.contactUs}</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>service@tflabservice.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>上海市浦东新区锦绣东路2777号19号楼</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">关注我们</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition cursor-pointer">
                  <Star className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition cursor-pointer">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{translations.footer.copyright}</p>
          </div>
        </div>
      </footer>

      {selectedProduct && (
        ProductModal({ product: selectedProduct, onClose: () => setSelectedProduct(null) })
      )}
    </div>
  );
};

export default App;
