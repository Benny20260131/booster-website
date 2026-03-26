import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadProducts(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

function extractAllSkus(productsData) {
    const allSkus = [];
    
    function traverseCategories(categories) {
        for (const category of categories) {
            if (category.products) {
                for (const product of category.products) {
                    allSkus.push({
                        brandSku: product.brandSku || '',
                        description: product.description || '',
                        specification: product.specification || '',
                        brand: product.brand || '',
                        originalCategory: product.originalCategory || ''
                    });
                }
            }
            if (category.categories) {
                traverseCategories(category.categories);
            }
            if (category.subCategories) {
                for (const subcat of category.subCategories) {
                    if (subcat.categories) {
                        traverseCategories(subcat.categories);
                    }
                }
            }
        }
    }
    
    if (productsData.categories) {
        traverseCategories(productsData.categories);
    }
    
    return allSkus;
}

function matchProductToImage(skuInfo) {
    const sku = String(skuInfo.brandSku || '');
    const description = String(skuInfo.description || '');
    
    const productTypeMapping = {
        'TIP': 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=吸头',
        'PLATE': 'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=酶标板',
        'TUBE': 'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=离心管',
        'BOTTLE': 'https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=试剂瓶',
        'FLASK': 'https://via.placeholder.com/400x400/FFEAA7/333333?text=烧瓶',
        'DISH': 'https://via.placeholder.com/400x400/DDA0DD/FFFFFF?text=培养皿',
        'WELL': 'https://via.placeholder.com/400x400/98D8C8/333333?text=孔板',
        'STRIP': 'https://via.placeholder.com/400x400/F7DC6F/333333?text=酶标条',
        'CUP': 'https://via.placeholder.com/400x400/BB8FCE/FFFFFF?text=离心杯'
    };
    
    for (const [key, productType] of Object.entries(productTypeMapping)) {
        if (sku.toUpperCase().includes(key)) {
            return productType;
        }
    }
    
    if (description.includes('吸头') || description.toLowerCase().includes('tip')) {
        return 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=吸头';
    } else if (description.includes('板') || description.toLowerCase().includes('plate')) {
        return 'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=酶标板';
    } else if (description.includes('管') || description.toLowerCase().includes('tube')) {
        return 'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=离心管';
    } else if (description.includes('瓶') || description.toLowerCase().includes('bottle')) {
        return 'https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=试剂瓶';
    } else if (description.includes('皿') || description.toLowerCase().includes('dish')) {
        return 'https://via.placeholder.com/400x400/DDA0DD/FFFFFF?text=培养皿';
    } else if (description.includes('烧') || description.toLowerCase().includes('flask')) {
        return 'https://via.placeholder.com/400x400/FFEAA7/333333?text=烧瓶';
    }
    
    return 'https://via.placeholder.com/400x400/95A5A6/FFFFFF?text=产品图片';
}

function generateImageMatches(productsFile, outputFile) {
    const productsData = loadProducts(productsFile);
    const allSkus = extractAllSkus(productsData);
    
    const matches = [];
    
    for (const skuInfo of allSkus) {
        const imageUrl = matchProductToImage(skuInfo);
        
        const matchEntry = {
            sku: skuInfo.brandSku,
            description: skuInfo.description,
            imageUrl: imageUrl,
            alternativeImages: []
        };
        
        if (imageUrl && !imageUrl.includes('placeholder')) {
            const baseUrl = imageUrl.substring(0, imageUrl.lastIndexOf('.'));
            for (let i = 2; i <= 4; i++) {
                matchEntry.alternativeImages.push(`${baseUrl}_${i}.jpg`);
            }
        }
        
        matches.push(matchEntry);
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(matches, null, 2), 'utf-8');
    
    console.log(`Generated ${matches.length} image matches`);
    console.log(`Saved to ${outputFile}`);
    
    return matches;
}

const productsFile = path.join(__dirname, 'products_new.json');
const outputFile = path.join(__dirname, 'product_image_matches.json');

try {
    const matches = generateImageMatches(productsFile, outputFile);
    
    console.log('\nSample matches:');
    matches.slice(0, 5).forEach((match, index) => {
        console.log(`\n${index + 1}. SKU: ${match.sku}`);
        console.log(`   Description: ${match.description.substring(0, 50)}...`);
        console.log(`   Image URL: ${match.imageUrl}`);
    });
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}