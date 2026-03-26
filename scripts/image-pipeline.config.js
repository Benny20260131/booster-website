/**
 * 图片处理流水线配置
 * 定义图片从拍摄到上线的完整流程
 */

module.exports = {
  // 输入配置
  input: {
    // 原始图片目录
    rawDir: './raw-images',
    // 支持的格式
    formats: ['.cr2', '.nef', '.arw', '.jpg', '.png', '.tiff'],
    // 命名模式
    namingPattern: {
      regex: /^([A-Z0-9-]+)_(front|side|detail|back|top|bottom|package)_?(\d+)?\.([a-z]+)$/i,
      groups: ['sku', 'angle', 'sequence', 'ext']
    }
  },
  
  // 处理配置
  processing: {
    // 背景处理
    background: {
      enabled: true,
      type: 'remove', // 'remove' | 'white' | 'transparent'
      color: '#FFFFFF',
      tolerance: 30
    },
    
    // 色彩校正
    colorCorrection: {
      enabled: true,
      whiteBalance: 'auto',
      brightness: 0,
      contrast: 1.0,
      saturation: 1.0
    },
    
    // 裁剪和尺寸
    resize: {
      enabled: true,
      sizes: [
        { name: 'thumbnail', width: 200, height: 200, quality: 80 },
        { name: 'medium', width: 600, height: 600, quality: 85 },
        { name: 'large', width: 1200, height: 1200, quality: 90 }
      ],
      maintainAspectRatio: true,
      fit: 'contain' // 'cover' | 'contain' | 'fill'
    },
    
    // 锐化
    sharpen: {
      enabled: true,
      sigma: 1.0,
      flat: 1.0,
      jagged: 2.0
    },
    
    // 水印（可选）
    watermark: {
      enabled: false,
      text: 'BOOSTER',
      position: 'bottom-right',
      opacity: 0.3
    }
  },
  
  // 输出配置
  output: {
    // 主目录
    dir: './public/images/products',
    
    // 格式转换
    formats: [
      {
        type: 'webp',
        quality: 85,
        effort: 6,
        lossless: false
      },
      {
        type: 'jpg',
        quality: 90,
        progressive: true
      }
    ],
    
    // 目录结构
    structure: 'flat', // 'flat' | 'by-sku' | 'by-category'
    
    // 文件名模板
    filenameTemplate: '{sku}_{angle}_{size}.{ext}'
  },
  
  // 质量检查
  quality: {
    enabled: true,
    rules: [
      {
        name: 'min-resolution',
        check: (metadata) => metadata.width >= 800 && metadata.height >= 800,
        message: '分辨率必须 >= 800x800'
      },
      {
        name: 'max-file-size',
        check: (metadata, fileInfo) => fileInfo.size <= 500 * 1024,
        message: '文件大小必须 <= 500KB'
      },
      {
        name: 'background-color',
        check: (metadata) => metadata.dominantColor === '#FFFFFF',
        message: '背景必须是纯白色',
        warning: true
      }
    ]
  },
  
  // CDN上传配置
  cdn: {
    enabled: true,
    provider: 'aliyun-oss', // 'aliyun-oss' | 'qiniu' | 'aws-s3'
    config: {
      region: 'oss-cn-hangzhou',
      bucket: 'booster-images',
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET
    },
    // 上传路径
    path: 'products/{date}/{sku}/{filename}',
    // 缓存控制
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  
  // 数据库同步
  database: {
    enabled: true,
    // 更新产品图片映射
    updateMapping: true,
    // 生成回滚数据
    generateRollback: true
  },
  
  // 日志配置
  logging: {
    level: 'info', // 'debug' | 'info' | 'warn' | 'error'
    file: './logs/image-pipeline.log',
    console: true
  }
};

// 拍摄计划配置
const shootingSchedule = {
  // 每日拍摄目标
  dailyTarget: 30, // SKU数量
  
  // 每个SKU的拍摄要求
  shotsPerSku: {
    min: 2,
    recommended: 3,
    angles: ['front', 'side', 'detail']
  },
  
  // 分类优先级
  priorities: [
    { category: '吸头', priority: 1, estimatedCount: 80 },
    { category: 'PCR', priority: 1, estimatedCount: 60 },
    { category: '细胞培养', priority: 2, estimatedCount: 70 },
    { category: '离心管', priority: 2, estimatedCount: 50 },
    { category: '保存管', priority: 2, estimatedCount: 40 },
    { category: '深孔板', priority: 3, estimatedCount: 30 },
    { category: '酶标板', priority: 3, estimatedCount: 30 },
    { category: '试剂瓶', priority: 3, estimatedCount: 40 },
    { category: '培养皿', priority: 3, estimatedCount: 30 }
  ]
};

// 预算估算
const budget = {
  // 设备
  equipment: {
    camera: { item: '相机机身', cost: 15000, count: 1 },
    lens: { item: '镜头', cost: 8000, count: 2 },
    lighting: { item: '灯光设备', cost: 5000, count: 1 },
    backdrop: { item: '背景系统', cost: 2000, count: 1 },
    computer: { item: '后期电脑', cost: 12000, count: 1 }
  },
  
  // 人力 (按月)
  personnel: {
    photographer: { role: '摄影师', monthly: 15000, months: 3 },
    retoucher: { role: '后期处理', monthly: 8000, months: 3, count: 2 }
  },
  
  // 场地
  studio: {
    rent: { item: '摄影棚租金', monthly: 5000, months: 3 },
    utilities: { item: '水电杂费', monthly: 1000, months: 3 }
  },
  
  // 其他
  other: {
    software: { item: '软件许可', cost: 6000 },
    props: { item: '道具耗材', cost: 3000 },
    contingency: { item: '应急预算', rate: 0.1 } // 10%
  }
};

// 计算总预算
function calculateBudget() {
  let total = 0;
  
  // 设备
  Object.values(budget.equipment).forEach(item => {
    total += item.cost * (item.count || 1);
  });
  
  // 人力
  Object.values(budget.personnel).forEach(item => {
    total += item.monthly * item.months * (item.count || 1);
  });
  
  // 场地
  Object.values(budget.studio).forEach(item => {
    total += item.monthly * item.months;
  });
  
  // 其他
  Object.values(budget.other).forEach(item => {
    if (item.cost) {
      total += item.cost;
    }
  });
  
  // 应急预算
  const contingency = total * budget.other.contingency.rate;
  total += contingency;
  
  return {
    subtotal: total - contingency,
    contingency,
    total: Math.round(total)
  };
}

module.exports.shootingSchedule = shootingSchedule;
module.exports.budget = budget;
module.exports.calculateBudget = calculateBudget;

// 如果直接运行此文件，显示预算
if (require.main === module) {
  const result = calculateBudget();
  console.log('\n========================================');
  console.log('项目预算估算');
  console.log('========================================');
  console.log(`设备费用: ¥${Object.values(budget.equipment).reduce((a, b) => a + b.cost * (b.count || 1), 0).toLocaleString()}`);
  console.log(`人力费用: ¥${Object.values(budget.personnel).reduce((a, b) => a + b.monthly * b.months * (b.count || 1), 0).toLocaleString()}`);
  console.log(`场地费用: ¥${Object.values(budget.studio).reduce((a, b) => a + b.monthly * b.months, 0).toLocaleString()}`);
  console.log(`其他费用: ¥${Object.values(budget.other).filter(i => i.cost).reduce((a, b) => a + b.cost, 0).toLocaleString()}`);
  console.log(`应急预算: ¥${result.contingency.toLocaleString()}`);
  console.log('----------------------------------------');
  console.log(`总计预算: ¥${result.total.toLocaleString()}`);
  console.log('========================================\n');
}
