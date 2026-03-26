/**
 * 产品图片显示组件
 * 支持：默认图标、匹配图片、加载状态、错误处理
 */

import React, { useState, useEffect } from 'react';
import { ImageIcon, Package, Beaker, FlaskConical, TestTube, Pipette, Microscope } from 'lucide-react';
import { useImageManager } from '../imageManager';

// 根据产品类型返回对应的默认图标
const getDefaultIcon = (productType) => {
  const type = (productType || '').toLowerCase();
  
  if (type.includes('试剂') || type.includes('reagent')) {
    return <Beaker className="w-full h-full p-4 text-gray-400" />;
  }
  if (type.includes('管') || type.includes('tube')) {
    return <TestTube className="w-full h-full p-4 text-gray-400" />;
  }
  if (type.includes('吸头') || type.includes('tip')) {
    return <Pipette className="w-full h-full p-4 text-gray-400" />;
  }
  if (type.includes('培养') || type.includes('culture')) {
    return <Microscope className="w-full h-full p-4 text-gray-400" />;
  }
  if (type.includes('瓶') || type.includes('bottle')) {
    return <FlaskConical className="w-full h-full p-4 text-gray-400" />;
  }
  
  return <Package className="w-full h-full p-4 text-gray-400" />;
};

/**
 * 产品图片组件
 */
const ProductImage = ({ 
  sku, 
  productType,
  description,
  size = 'md',
  className = '',
  showPlaceholder = true,
  fallbackUrl = null
}) => {
  const { getMatch } = useImageManager();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 尺寸配置
  const sizeConfig = {
    sm: { width: 'w-16', height: 'h-16', iconSize: 8 },
    md: { width: 'w-24', height: 'h-24', iconSize: 12 },
    lg: { width: 'w-32', height: 'h-32', iconSize: 16 },
    xl: { width: 'w-48', height: 'h-48', iconSize: 24 },
    full: { width: 'w-full', height: 'h-full', iconSize: 32 }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // 加载匹配的图片
  useEffect(() => {
    const loadImage = () => {
      setLoading(true);
      setError(false);

      // 1. 尝试从数据库获取匹配的图片
      const matchedImage = getMatch(sku);
      
      if (matchedImage) {
        setImageUrl(matchedImage.url);
      } else if (fallbackUrl) {
        // 2. 使用传入的fallback URL
        setImageUrl(fallbackUrl);
      } else {
        // 3. 无图片可用
        setImageUrl(null);
      }
      
      setLoading(false);
    };

    loadImage();
  }, [sku, fallbackUrl, getMatch]);

  // 处理图片加载错误
  const handleError = () => {
    setError(true);
    setImageUrl(null);
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className={`${config.width} ${config.height} bg-gray-100 rounded-lg animate-pulse flex items-center justify-center ${className}`}>
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 渲染图片或占位符
  return (
    <div className={`${config.width} ${config.height} bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      {imageUrl && !error ? (
        <img
          src={imageUrl}
          alt={sku}
          className="w-full h-full object-cover"
          onError={handleError}
          loading="lazy"
        />
      ) : showPlaceholder ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          {getDefaultIcon(productType || description)}
        </div>
      ) : null}
    </div>
  );
};

/**
 * 产品图片画廊组件
 */
export const ProductImageGallery = ({ 
  sku, 
  images = [],
  productType,
  className = ''
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { getMatch } = useImageManager();

  // 获取所有可用图片
  const allImages = React.useMemo(() => {
    const matched = getMatch(sku);
    const result = [];
    
    if (matched) {
      result.push({ url: matched.url, type: 'matched', id: 'main' });
    }
    
    images.forEach((img, idx) => {
      result.push({ url: img, type: 'additional', id: idx });
    });
    
    return result;
  }, [sku, images, getMatch]);

  if (allImages.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height: '400px' }}>
        {getDefaultIcon(productType)}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 主图 */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        <img
          src={allImages[selectedIndex]?.url}
          alt={`Product ${selectedIndex + 1}`}
          className="w-full h-full object-contain"
        />
        
        {/* 图片计数器 */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* 缩略图 */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {allImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedIndex === idx ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 产品卡片组件（带图片）
 */
export const ProductCard = ({ product, onClick, className = '' }) => {
  const sku = product.品牌货号 || product.sku;
  const description = product.描述 || product.description;
  const productType = product.分类 || product.category;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden ${className}`}
    >
      {/* 图片区域 */}
      <div className="aspect-square bg-gray-50">
        <ProductImage
          sku={sku}
          productType={productType}
          description={description}
          size="full"
          className="w-full h-full"
        />
      </div>
      
      {/* 信息区域 */}
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{sku}</div>
        <h3 className="font-medium text-gray-900 line-clamp-2">{description}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">{product.规格 || product.specification}</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
            {productType}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * 产品详情图片组件
 */
export const ProductDetailImage = ({ product }) => {
  const sku = product.品牌货号 || product.sku;
  const description = product.描述 || product.description;
  const productType = product.分类 || product.category;

  return (
    <div className="space-y-6">
      {/* 主图 */}
      <ProductImageGallery
        sku={sku}
        productType={productType}
        className="w-full"
      />
      
      {/* 产品信息 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-2">{description}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">货号：</span>
            <span className="font-medium">{sku}</span>
          </div>
          <div>
            <span className="text-gray-500">规格：</span>
            <span>{product.规格 || product.specification}</span>
          </div>
          <div>
            <span className="text-gray-500">分类：</span>
            <span>{productType}</span>
          </div>
          <div>
            <span className="text-gray-500">品牌：</span>
            <span>{product.品牌 || product.brand || 'BOOSTER'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImage;
