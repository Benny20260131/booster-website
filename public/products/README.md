# 产品图片目录说明

此目录用于存放产品图片，用于网站产品展示。

## 图片命名规范

建议使用以下命名规范，以便于模糊匹配：

1. **按产品类型命名**：
   - 吸头相关：`tip_*.png` 或 `吸头_*.png`
   - PCR相关：`pcr_*.png` 或 `PCR_*.png`
   - 培养瓶相关：`flask_*.png` 或 `培养瓶_*.png`
   - 培养皿相关：`dish_*.png` 或 `培养皿_*.png`
   - 离心管相关：`tube_*.png` 或 `离心管_*.png`
   - 酶标板相关：`plate_*.png` 或 `酶标板_*.png`

2. **按SKU命名**（推荐）：
   - 使用品牌货号作为文件名，如：`BSD-HC-TIP-10UL-001.png`
   - 这样可以精确匹配产品

## 图片要求

- 格式：PNG 或 JPG
- 尺寸：建议 800x800 像素（正方形）
- 文件大小：建议小于 500KB
- 背景：建议使用白色或透明背景

## 如何添加图片

1. 将PDF转换为图片（使用在线工具或专业软件）
2. 将图片文件复制到此目录
3. 运行 `node match_product_images.js` 进行自动匹配
4. 匹配结果将保存到 `booster-website/src/product_image_matches.json`

## 自动匹配脚本

运行以下命令进行图片匹配：

```bash
cd "c:\Users\Labbiotec\Desktop\2025博仕达\产品资料\OEM表格"
node match_product_images.js
```

脚本会根据产品描述和SKU自动匹配最合适的图片。

## 注意事项

- 确保图片文件名包含产品关键词或SKU
- 如果没有匹配到图片，网站会显示默认的占位符图标
- 可以手动编辑 `product_image_matches.json` 来调整匹配结果
