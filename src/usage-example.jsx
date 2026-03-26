/**
 * 图片系统使用示例
 * 展示如何在不同场景中使用图片组件
 */

import React from 'react';
import { ProductImage, ProductCard, ProductDetailImage } from './components/ProductImage';

// ==================== 示例1: 基础图片显示 ====================
const Example1_BasicImage = () => {
  return (
    <div>
      <h2>基础图片显示</h2>
      
      {/* 小型图片 */}
      <ProductImage 
        sku="BSD-HC-TIP-200UL-001" 
        size="sm" 
      />
      
      {/* 中型图片（默认） */}
      <ProductImage 
        sku="BSD-HC-TIP-200UL-001" 
        size="md"
        productType="吸头"
        description="200uL普通吸头"
      />
      
      {/* 大型图片 */}
      <ProductImage 
        sku="BSD-HC-TIP-200UL-001"
        size="lg"
        productType="吸头"
        description="200uL普通吸头"
      />
    </div>
  );
};

// ==================== 示例2: 产品卡片 ====================
const Example2_ProductCard = () => {
  const product = {
    '品牌货号': 'BSD-HC-TIP-200UL-001',
    '描述': '200uL普通吸头，适用于大多数移液器',
    '规格': '1000支/包',
    '分类': '吸头',
    '品牌': 'BOOSTER'
  };

  return (
    <div>
      <h2>产品卡片</h2>
      <ProductCard 
        product={product}
        onClick={() => console.log('点击了产品:', product)}
      />
    </div>
  );
};

// ==================== 示例3: 产品详情页 ====================
const Example3_ProductDetail = () => {
  const product = {
    '品牌货号': 'BSD-HC-TIP-200UL-001',
    '描述': '200uL普通吸头',
    '规格': '1000支/包，无菌',
    '分类': '吸头',
    '品牌': 'BOOSTER',
    '应用范围': '分子生物学、细胞培养'
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* 左侧：图片 */}
      <ProductDetailImage product={product} />
      
      {/* 右侧：信息 */}
      <div>
        <h1>{product['描述']}</h1>
        <p>货号: {product['品牌货号']}</p>
        <p>规格: {product['规格']}</p>
      </div>
    </div>
  );
};

// ==================== 示例4: 产品列表 ====================
const Example4_ProductList = () => {
  const products = [
    {
      '品牌货号': 'BSD-HC-TIP-200UL-001',
      '描述': '200uL普通吸头',
      '规格': '1000支/包',
      '分类': '吸头'
    },
    {
      '品牌货号': 'BSD-HC-PCR-001',
      '描述': '0.2mL PCR 8联管',
      '规格': '125条/包',
      '分类': 'PCR'
    },
    {
      '品牌货号': 'BSD-HC-PLATE-001',
      '描述': '96孔细胞培养板',
      '规格': '50块/箱',
      '分类': '细胞培养'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={index}
          product={product}
          onClick={() => console.log('选中产品:', product)}
        />
      ))}
    </div>
  );
};

// ==================== 示例5: 表格中显示图片 ====================
const Example5_ProductTable = () => {
  const products = [
    {
      '品牌货号': 'BSD-HC-TIP-200UL-001',
      '描述': '200uL普通吸头',
      '规格': '1000支/包'
    },
    {
      '品牌货号': 'BSD-HC-TIP-1000UL-001',
      '描述': '1000uL普通吸头',
      '规格': '500支/包'
    }
  ];

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>图片</th>
          <th>货号</th>
          <th>描述</th>
          <th>规格</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product, index) => (
          <tr key={index}>
            <td>
              <ProductImage 
                sku={product['品牌货号']}
                size="sm"
              />
            </td>
            <td>{product['品牌货号']}</td>
            <td>{product['描述']}</td>
            <td>{product['规格']}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ==================== 示例6: 搜索结果 ====================
const Example6_SearchResults = () => {
  const searchResults = [
    // 搜索结果数据...
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {searchResults.map((product, index) => (
        <div key={index} className="border rounded-lg p-4">
          <ProductImage
            sku={product['品牌货号']}
            productType={product['分类']}
            description={product['描述']}
            size="lg"
          />
          <h3 className="mt-2 font-medium">{product['描述']}</h3>
          <p className="text-sm text-gray-500">{product['品牌货号']}</p>
        </div>
      ))}
    </div>
  );
};

// ==================== 完整示例导出 ====================
const ImageSystemExamples = () => {
  return (
    <div className="space-y-12 p-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">图片系统使用示例</h1>
        <p className="text-gray-600">
          以下是不同场景下使用图片组件的示例代码。
          所有组件已集成到 App.jsx 中，可以直接使用。
        </p>
      </section>

      <section className="border-t pt-8">
        <Example1_BasicImage />
      </section>

      <section className="border-t pt-8">
        <Example2_ProductCard />
      </section>

      <section className="border-t pt-8">
        <Example3_ProductDetail />
      </section>

      <section className="border-t pt-8">
        <Example4_ProductList />
      </section>

      <section className="border-t pt-8">
        <Example5_ProductTable />
      </section>

      <section className="border-t pt-8">
        <Example6_SearchResults />
      </section>
    </div>
  );
};

export default ImageSystemExamples;

// 单独导出各个示例
export {
  Example1_BasicImage,
  Example2_ProductCard,
  Example3_ProductDetail,
  Example4_ProductList,
  Example5_ProductTable,
  Example6_SearchResults
};
