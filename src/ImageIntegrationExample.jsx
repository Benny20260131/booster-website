/**
 * 图片系统集成示例
 * 展示如何在产品列表和详情页中使用图片功能
 */

import React, { useState, useEffect } from 'react';
import productsData from './products_new.json';
import { 
  ProductImage, 
  ProductImageGallery, 
  ProductCard, 
  ProductDetailImage 
} from './components/ProductImage';
import ImageUploader from './components/ImageUploader';
import { useImageManager, ImageDatabase } from './imageManager';
import { initializeImages, autoMatchProducts, exportMatches } from './initImages';
import { Settings, Image, Database, Download, RefreshCw } from 'lucide-react';

/**
 * 图片管理面板
 */
const ImageManagementPanel = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [matches, setMatches] = useState([]);
  const { images, exportData, importData } = useImageManager();

  // 加载产品数据
  useEffect(() => {
    // 扁平化产品数据
    const allProducts = [];
    Object.entries(productsData).forEach(([category, items]) => {
      items.forEach(item => {
        allProducts.push({
          ...item,
          category
        });
      });
    });
    setProducts(allProducts);
  }, []);

  // 初始化图片库
  const handleInitialize = () => {
    if (confirm('确定要初始化图片库吗？这将导入所有爬取的图片。')) {
      initializeImages('/images/products/');
      alert('图片库初始化完成！');
      window.location.reload();
    }
  };

  // 自动匹配
  const handleAutoMatch = () => {
    const matches = autoMatchProducts(products, '/images/products/');
    setMatches(matches);
    
    // 保存到本地存储
    const db = new ImageDatabase();
    matches.forEach(match => {
      const image = images.find(img => img.filename === match.imageFilename);
      if (image) {
        db.setMatch(match.sku, image.id, match.confidence);
      }
    });
    
    alert(`自动匹配完成！成功匹配 ${matches.length} 个产品`);
  };

  // 导出匹配结果
  const handleExport = () => {
    const exportData = exportMatches(products, '/images/products/');
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_image_matches.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 渲染产品列表
  const renderProducts = () => (
    <div className="grid grid-cols-4 gap-4">
      {products.slice(0, 12).map((product, idx) => (
        <ProductCard
          key={idx}
          product={product}
          onClick={() => console.log('Selected:', product)}
        />
      ))}
    </div>
  );

  // 渲染图片上传
  const renderUploader = () => (
    <ImageUploader 
      products={products}
      onMatchesUpdate={(newMatches) => setMatches(newMatches)}
    />
  );

  // 渲染匹配结果
  const renderMatches = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">匹配结果 ({matches.length})</h3>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          导出JSON
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">SKU</th>
              <th className="px-4 py-2 text-left">描述</th>
              <th className="px-4 py-2 text-left">匹配图片</th>
              <th className="px-4 py-2 text-left">置信度</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {matches.map((match, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 font-mono text-sm">{match.sku}</td>
                <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                  {match.description}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <img
                      src={match.imageUrl}
                      alt={match.imageFilename}
                      className="w-10 h-10 object-cover rounded mr-2"
                    />
                    <span className="text-xs text-gray-500">{match.imageFilename}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    match.confidence > 80 ? 'bg-green-100 text-green-700' :
                    match.confidence > 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {match.confidence}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">图片管理系统</h1>
        <p className="text-gray-600">管理产品图片，自动匹配SKU与图片资源</p>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleInitialize}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Database className="w-4 h-4 mr-2" />
          初始化图片库
        </button>
        <button
          onClick={handleAutoMatch}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          自动匹配
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center px-4 py-2 rounded ${
            activeTab === 'upload' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Image className="w-4 h-4 mr-2" />
          上传图片
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center px-4 py-2 rounded ${
            activeTab === 'products' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4 mr-2" />
          产品展示
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex items-center px-4 py-2 rounded ${
            activeTab === 'matches' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Database className="w-4 h-4 mr-2" />
          匹配结果
        </button>
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'upload' && renderUploader()}
        {activeTab === 'matches' && renderMatches()}
      </div>
    </div>
  );
};

/**
 * 产品详情页示例
 */
const ProductDetailExample = ({ product }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-2 gap-8">
        {/* 左侧：图片 */}
        <ProductDetailImage product={product} />
        
        {/* 右侧：信息 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {product.描述 || product.description}
            </h1>
            <p className="text-gray-500">货号: {product.品牌货号 || product.sku}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">规格</span>
              <span>{product.规格 || product.specification}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">分类</span>
              <span>{product.分类 || product.category}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">品牌</span>
              <span>{product.品牌 || product.brand || 'BOOSTER'}</span>
            </div>
          </div>
          
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            加入询价单
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 产品列表项示例
 */
const ProductListItemExample = ({ product }) => {
  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <ProductImage
        sku={product.品牌货号 || product.sku}
        productType={product.分类 || product.category}
        description={product.描述 || product.description}
        size="md"
      />
      <div className="ml-4 flex-1">
        <h3 className="font-medium">{product.描述 || product.description}</h3>
        <p className="text-sm text-gray-500">{product.品牌货号 || product.sku}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">{product.规格 || product.specification}</p>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
          {product.分类 || product.category}
        </span>
      </div>
    </div>
  );
};

export default ImageManagementPanel;
export { ProductDetailExample, ProductListItemExample };
