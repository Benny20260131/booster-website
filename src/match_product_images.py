import json
import re
from typing import Dict, List, Optional

def load_products(file_path: str) -> Dict:
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_all_skus(products_data: Dict) -> List[Dict]:
    all_skus = []
    
    def traverse_categories(categories):
        for category in categories:
            if 'products' in category:
                for product in category['products']:
                    all_skus.append({
                        'brandSku': product.get('brandSku', ''),
                        'description': product.get('description', ''),
                        'specification': product.get('specification', ''),
                        'brand': product.get('brand', ''),
                        'originalCategory': product.get('originalCategory', '')
                    })
            if 'categories' in category:
                traverse_categories(category['categories'])
            if 'subCategories' in category:
                for subcat in category['subCategories']:
                    if 'categories' in subcat:
                        traverse_categories(subcat['categories'])
    
    traverse_categories(products_data.get('categories', []))
    return all_skus

def match_product_to_image(sku_info: Dict) -> Optional[str]:
    sku = sku_info['brandSku']
    description = sku_info['description']
    
    gsbio_base_url = "http://www.gsbio.cn"
    
    product_type_mapping = {
        'TIP': 'pipette-tip',
        'PLATE': 'elisa-plate',
        'TUBE': 'centrifuge-tube',
        'BOTTLE': 'reagent-bottle',
        'FLASK': 'flask',
        'DISH': 'petri-dish',
        'WELL': 'well-plate',
        'STRIP': 'elisa-strip',
        'CUP': 'centrifuge-cup'
    }
    
    for key, product_type in product_type_mapping.items():
        if key in sku.upper():
            return f"{gsbio_base_url}/Uploads/{product_type}.jpg"
    
    if '吸头' in description or 'tip' in description.lower():
        return f"{gsbio_base_url}/Uploads/pipette-tip.jpg"
    elif '板' in description or 'plate' in description.lower():
        return f"{gsbio_base_url}/Uploads/elisa-plate.jpg"
    elif '管' in description or 'tube' in description.lower():
        return f"{gsbio_base_url}/Uploads/centrifuge-tube.jpg"
    elif '瓶' in description or 'bottle' in description.lower():
        return f"{gsbio_base_url}/Uploads/reagent-bottle.jpg"
    elif '皿' in description or 'dish' in description.lower():
        return f"{gsbio_base_url}/Uploads/petri-dish.jpg"
    
    return None

def generate_image_matches(products_file: str, output_file: str):
    products_data = load_products(products_file)
    all_skus = extract_all_skus(products_data)
    
    matches = []
    
    for sku_info in all_skus:
        image_url = match_product_to_image(sku_info)
        
        match_entry = {
            'sku': sku_info['brandSku'],
            'description': sku_info['description'],
            'imageUrl': image_url,
            'alternativeImages': []
        }
        
        if image_url:
            base_url = image_url.rsplit('.', 1)[0]
            for i in range(2, 5):
                match_entry['alternativeImages'].append(f"{base_url}_{i}.jpg")
        
        matches.append(match_entry)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(matches, f, ensure_ascii=False, indent=2)
    
    print(f"Generated {len(matches)} image matches")
    print(f"Saved to {output_file}")
    
    return matches

if __name__ == "__main__":
    products_file = "products_new.json"
    output_file = "product_image_matches.json"
    
    matches = generate_image_matches(products_file, output_file)
    
    print("\nSample matches:")
    for i, match in enumerate(matches[:5]):
        print(f"\n{i+1}. SKU: {match['sku']}")
        print(f"   Description: {match['description'][:50]}...")
        print(f"   Image URL: {match['imageUrl']}")