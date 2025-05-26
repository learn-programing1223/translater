import Fuse from 'fuse.js';
import { db } from './schema';
import { Product } from '@/types';

const fuseOptions = {
  keys: [
    'name',
    'nameTranslations',
    'description',
    'descriptionTranslations',
    'category',
    'brand',
    'barcode',
  ],
  threshold: 0.3,
  ignoreLocation: true,
  useExtendedSearch: true,
};

export class CatalogService {
  private fuse: Fuse<Product> | null = null;

  async initialize() {
    const products = await db.products.toArray();
    if (products.length === 0) {
      await this.seedDatabase();
    }
    await this.buildSearchIndex();
  }

  private async buildSearchIndex() {
    const products = await db.products.toArray();
    this.fuse = new Fuse(products, fuseOptions);
  }

  async searchProducts(query: string, language: string): Promise<Product[]> {
    if (!this.fuse) {
      await this.buildSearchIndex();
    }

    // Search in the specified language's translations
    const results = this.fuse!.search(query);
    
    // Also search in language-specific fields
    const languageResults = this.fuse!.search({
      $or: [
        { [`nameTranslations.${language}`]: query },
        { [`descriptionTranslations.${language}`]: query },
      ],
    });

    // Combine and deduplicate results
    const combined = [...results, ...languageResults];
    const uniqueProducts = Array.from(
      new Map(combined.map((r) => [r.item.id, r.item])).values()
    );

    return uniqueProducts.slice(0, 10); // Return top 10 results
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    return await db.products.where('barcode').equals(barcode).first() || null;
  }

  private async seedDatabase() {
    const sampleProducts: Product[] = [
      {
        id: '1',
        barcode: '012345678901',
        name: 'Organic Whole Milk',
        nameTranslations: {
          es: 'Leche Entera Orgánica',
          fr: 'Lait Entier Biologique',
          de: 'Bio-Vollmilch',
          zh: '有机全脂牛奶',
          ja: '有機全乳',
          ar: 'حليب كامل الدسم عضوي',
          hi: 'जैविक पूर्ण दूध',
          sw: 'Maziwa Kamili ya Kikaboni',
          yo: 'Wàrà Kíkún Ọ̀gbìn',
          zu: 'Ubisi Oluphelele Oluphilayo',
        },
        description: 'Fresh organic whole milk from grass-fed cows',
        descriptionTranslations: {
          es: 'Leche fresca orgánica de vacas alimentadas con pasto',
          fr: 'Lait frais biologique de vaches nourries à l\'herbe',
          de: 'Frische Bio-Milch von grasgefütterten Kühen',
          zh: '来自草饲奶牛的新鲜有机全脂牛奶',
          ja: '牧草飼育の牛からの新鮮な有機牛乳',
          ar: 'حليب عضوي طازج من أبقار تتغذى على العشب',
          hi: 'घास खाने वाली गायों से ताजा जैविक दूध',
          sw: 'Maziwa safi ya kikaboni kutoka ng\'ombe wanaolishwa majani',
          yo: 'Wàrà tútù ọ̀gbìn láti ọ̀dọ̀ màlúù tí wọ́n ń jẹ koríko',
          zu: 'Ubisi olusha oluphilayo oluvela ezinkomeni ezidla utshani',
        },
        price: 4.99,
        currency: 'USD',
        category: 'Dairy',
        brand: 'Happy Farms',
        location: 'Aisle 3, Section B',
        allergens: ['Milk'],
        inStock: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: '2',
        barcode: '012345678902',
        name: 'Whole Wheat Bread',
        nameTranslations: {
          es: 'Pan de Trigo Integral',
          fr: 'Pain de Blé Complet',
          de: 'Vollkornbrot',
          zh: '全麦面包',
          ja: '全粒小麦パン',
          ar: 'خبز القمح الكامل',
          hi: 'होल व्हीट ब्रेड',
          sw: 'Mkate wa Ngano Nzima',
          yo: 'Àkàrà Alikama Kíkún',
          zu: 'Isinkwa Sikamabele Aphelele',
        },
        description: 'Freshly baked whole wheat bread with no preservatives',
        descriptionTranslations: {
          es: 'Pan de trigo integral recién horneado sin conservantes',
          fr: 'Pain de blé complet fraîchement cuit sans conservateurs',
          de: 'Frisch gebackenes Vollkornbrot ohne Konservierungsstoffe',
          zh: '新鲜烘焙的全麦面包，不含防腐剂',
          ja: '保存料不使用の焼きたて全粒小麦パン',
          ar: 'خبز القمح الكامل المخبوز طازجًا بدون مواد حافظة',
          hi: 'बिना प्रिज़र्वेटिव के ताज़ा बेक किया हुआ होल व्हीट ब्रेड',
          sw: 'Mkate wa ngano nzima uliookwa safi bila vihifadhi',
          yo: 'Àkàrà alikama kíkún tí a ṣẹ̀ ṣe lálàìsí àwọn èròjà ìtọ́jú',
          zu: 'Isinkwa esisha esibhakwe ngaphandle kwama-preservatives',
        },
        price: 3.49,
        currency: 'USD',
        category: 'Bakery',
        brand: 'Artisan Bakehouse',
        location: 'Aisle 5, Section A',
        allergens: ['Wheat', 'Gluten'],
        inStock: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: '3',
        barcode: '012345678903',
        name: 'Extra Virgin Olive Oil',
        nameTranslations: {
          es: 'Aceite de Oliva Virgen Extra',
          fr: 'Huile d\'Olive Extra Vierge',
          de: 'Natives Olivenöl Extra',
          zh: '特级初榨橄榄油',
          ja: 'エクストラバージンオリーブオイル',
          ar: 'زيت زيتون بكر ممتاز',
          hi: 'एक्स्ट्रा वर्जिन ऑलिव ऑयल',
          sw: 'Mafuta ya Mzeituni ya Dume Safi',
          yo: 'Òróró Ólífì Kíkún Tó Dára Jùlọ',
          zu: 'Amafutha e-olive amahle kakhulu',
        },
        description: 'Cold-pressed extra virgin olive oil from Mediterranean olives',
        descriptionTranslations: {
          es: 'Aceite de oliva virgen extra prensado en frío de aceitunas mediterráneas',
          fr: 'Huile d\'olive extra vierge pressée à froid d\'olives méditerranéennes',
          de: 'Kaltgepresstes natives Olivenöl extra aus mediterranen Oliven',
          zh: '地中海橄榄冷榨特级初榨橄榄油',
          ja: '地中海産オリーブのコールドプレスエクストラバージンオリーブオイル',
          ar: 'زيت زيتون بكر ممتاز معصور على البارد من زيتون البحر المتوسط',
          hi: 'भूमध्यसागरीय जैतून से कोल्ड-प्रेस्ड एक्स्ट्रा वर्जिन ऑलिव ऑयल',
          sw: 'Mafuta ya zeituni yasiyochanganywa yaliyokamiliwa baridi kutoka mizeituni ya Mediterania',
          yo: 'Òróró ólífì tí a fún ní ọ̀nà tútù láti inú èso ólífì Mediterránéà',
          zu: 'Amafutha e-olive akhishwe ngokubanda avela kuma-olive aseMediterranean',
        },
        price: 12.99,
        currency: 'USD',
        category: 'Cooking Oils',
        brand: 'Mediterranean Gold',
        location: 'Aisle 7, Section C',
        allergens: [],
        inStock: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: '4',
        barcode: '012345678904',
        name: 'Organic Bananas',
        nameTranslations: {
          es: 'Plátanos Orgánicos',
          fr: 'Bananes Biologiques',
          de: 'Bio-Bananen',
          zh: '有机香蕉',
          ja: '有機バナナ',
          ar: 'موز عضوي',
          hi: 'जैविक केले',
          sw: 'Ndizi za Kikaboni',
          yo: 'Ọ̀gẹ̀dẹ̀ Ọ̀gbìn',
          zu: 'Ubhanana Oluphilayo',
        },
        description: 'Fresh organic bananas, perfect ripeness',
        descriptionTranslations: {
          es: 'Plátanos orgánicos frescos, madurez perfecta',
          fr: 'Bananes biologiques fraîches, maturité parfaite',
          de: 'Frische Bio-Bananen, perfekte Reife',
          zh: '新鲜有机香蕉，完美成熟度',
          ja: '新鮮な有機バナナ、完璧な熟度',
          ar: 'موز عضوي طازج، نضج مثالي',
          hi: 'ताजे जैविक केले, सही पकाव',
          sw: 'Ndizi safi za kikaboni, ubivu mkamilifu',
          yo: 'Ọ̀gẹ̀dẹ̀ ọ̀gbìn tútù, bíbọ́ tó péye',
          zu: 'Ubhanana olusha oluphilayo, ukuvuthwa okuhle',
        },
        price: 0.69,
        currency: 'USD',
        category: 'Produce',
        brand: 'Nature\'s Best',
        location: 'Produce Section',
        allergens: [],
        inStock: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: '5',
        barcode: '012345678905',
        name: 'Greek Yogurt Plain',
        nameTranslations: {
          es: 'Yogur Griego Natural',
          fr: 'Yaourt Grec Nature',
          de: 'Griechischer Joghurt Natur',
          zh: '原味希腊酸奶',
          ja: 'プレーンギリシャヨーグルト',
          ar: 'زبادي يوناني سادة',
          hi: 'प्लेन ग्रीक योगर्ट',
          sw: 'Yogati ya Kigiriki Isiyo na Ladha',
          yo: 'Wàrà Gírììkì Funfun',
          zu: 'I-yogathi yaseGrisi engenakunambitheka',
        },
        description: 'Thick and creamy Greek yogurt with live cultures',
        descriptionTranslations: {
          es: 'Yogur griego espeso y cremoso con cultivos vivos',
          fr: 'Yaourt grec épais et crémeux avec cultures vivantes',
          de: 'Dicker und cremiger griechischer Joghurt mit lebenden Kulturen',
          zh: '含活性菌的浓稠奶油希腊酸奶',
          ja: '生きた培養菌入りの濃厚でクリーミーなギリシャヨーグルト',
          ar: 'زبادي يوناني سميك وكريمي مع خمائر حية',
          hi: 'जीवित संस्कृतियों के साथ गाढ़ा और मलाईदार ग्रीक योगर्ट',
          sw: 'Yogati ya Kigiriki nene na laini yenye viumbe hai',
          yo: 'Wàrà Gírììkì tó nípọn tó sì dùn pẹ̀lú àwọn kóńkù alààyè',
          zu: 'I-yogathi yaseGrisi eshelelayo nekhilimu enama-culture aphilayo',
        },
        price: 5.99,
        currency: 'USD',
        category: 'Dairy',
        brand: 'Hellenic Farms',
        location: 'Aisle 3, Section A',
        allergens: ['Milk'],
        inStock: true,
        lastUpdated: new Date().toISOString(),
      },
      // Add more products as needed...
    ];

    await db.products.bulkAdd(sampleProducts);
  }

  async syncCatalog() {
    // In a real app, this would fetch updates from a CDN
    // For now, we'll just rebuild the search index
    await this.buildSearchIndex();
  }
}

export const catalogService = new CatalogService();