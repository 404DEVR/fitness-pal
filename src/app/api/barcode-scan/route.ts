import { NextRequest, NextResponse } from 'next/server';

interface ProductData {
    name: string;
    brand: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    category: string;
    image_url: string | null;
    barcode: string;
    serving_size: string;
}

export async function POST(request: NextRequest) {
    try {
        const { barcode } = await request.json();

        if (!barcode) {
            return NextResponse.json(
                { error: 'Barcode is required' },
                { status: 400 }
            );
        }

        console.log(`🔍 Looking up barcode: ${barcode}`);

        // Try multiple food databases in order of preference
        let productData: ProductData | null = null;

        // 1. Try Open Food Facts (free, comprehensive database)
        productData = await searchOpenFoodFacts(barcode);

        if (productData) {
            console.log(`✅ Found product in Open Food Facts`);
            return NextResponse.json({ ...productData, source: 'Open Food Facts' });
        }

        // 2. Try UPC Database (backup)
        productData = await searchUPCDatabase(barcode);

        if (productData) {
            console.log(`✅ Found product in UPC Database`);
            return NextResponse.json({ ...productData, source: 'UPC Database' });
        }

        // 3. If not found, return generic response
        console.log(`⚠️ Product not found in any database`);
        return NextResponse.json({
            error: 'Product not found',
            message: 'This barcode was not found in our food databases. You can still add it manually.',
            barcode,
        }, { status: 404 });

    } catch (error) {
        console.error('Barcode scan error:', error);
        return NextResponse.json(
            { error: 'Failed to scan barcode' },
            { status: 500 }
        );
    }
}

async function searchOpenFoodFacts(barcode: string): Promise<ProductData | null> {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (data.status === 0 || !data.product) {
            return null;
        }

        const product = data.product;
        const nutriments = product.nutriments || {};

        // Extract nutrition info per 100g
        return {
            name: product.product_name || product.product_name_en || 'Unknown Product',
            brand: product.brands || null,
            calories: Math.round(nutriments.energy_kcal_100g || nutriments['energy-kcal_100g'] || 0),
            protein: Math.round(nutriments.proteins_100g || 0),
            carbs: Math.round(nutriments.carbohydrates_100g || 0),
            fat: Math.round(nutriments.fat_100g || 0),
            fiber: Math.round(nutriments.fiber_100g || 0),
            sugar: Math.round(nutriments.sugars_100g || 0),
            sodium: Math.round(nutriments.sodium_100g || 0),
            category: product.categories || 'Food',
            image_url: product.image_front_url || product.image_url || null,
            barcode,
            serving_size: product.serving_size || '100g',
        };
    } catch (error) {
        console.error('Open Food Facts API error:', error);
        return null;
    }
}

async function searchUPCDatabase(barcode: string): Promise<ProductData | null> {
    try {
        // This is a backup API - you might need to get an API key
        // For now, we'll return null to fallback to manual entry
        return null;

        /* Example implementation if you get a UPC API key:
        const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
        
        if (!response.ok) {
          return null;
        }
    
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          return null;
        }
    
        const item = data.items[0];
        
        return {
          name: item.title,
          brand: item.brand,
          calories: 0, // UPC DB doesn't have nutrition info
          protein: 0,
          carbs: 0,
          fat: 0,
          category: item.category,
          image_url: item.images?.[0] || null,
          barcode,
          serving_size: '100g',
        };
        */
    } catch (error) {
        console.error('UPC Database API error:', error);
        return null;
    }
}