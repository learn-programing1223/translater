import { NextRequest, NextResponse } from 'next/server';
import { detectLanguage } from '../../../lib/language-detection';

function getMockResponse(message: string, language: string): string {
  const responses = {
    'en': {
      'milk': 'You can find milk in Aisle 3, Refrigerated Section, for $3.99.',
      'bread': 'Bread is located in Aisle 1, Bakery Section, for $2.49.',
      'bananas': 'Bananas are in the Produce Section, Fresh Fruit area, for $1.29.',
      'default': 'I can help you find products in our store. What are you looking for?'
    },
    'es': {
      'leche': 'Puedes encontrar la leche en el Pasillo 3, Sección Refrigerada, por $3.99.',
      'pan': 'El pan está ubicado en el Pasillo 1, Sección de Panadería, por $2.49.',
      'plátanos': 'Los plátanos están en la Sección de Productos, área de Fruta Fresca, por $1.29.',
      'default': 'Puedo ayudarte a encontrar productos en nuestra tienda. ¿Qué estás buscando?'
    },
    'fr': {
      'lait': 'Vous pouvez trouver le lait dans l\'Allée 3, Section Réfrigérée, pour $3.99.',
      'pain': 'Le pain se trouve dans l\'Allée 1, Section Boulangerie, pour $2.49.',
      'bananes': 'Les bananes sont dans la Section Produits, zone Fruits Frais, pour $1.29.',
      'default': 'Je peux vous aider à trouver des produits dans notre magasin. Que cherchez-vous?'
    },
    'zh': {
      '牛奶': '您可以在第3通道，冷藏区找到牛奶，价格为$3.99。',
      '面包': '面包位于第1通道，烘焙区，价格为$2.49。',
      '香蕉': '香蕉在农产品区，新鲜水果区，价格为$1.29。',
      'default': '我可以帮您在我们商店中找到产品。您在找什么？'
    },
    'ar': {
      'حليب': 'يمكنك العثور على الحليب في الممر 3، قسم المبردات، بسعر $3.99.',
      'خبز': 'الخبز موجود في الممر 1، قسم المخبوزات، بسعر $2.49.',
      'موز': 'الموز في قسم المنتجات، منطقة الفواكه الطازجة، بسعر $1.29.',
      'default': 'يمكنني مساعدتك في العثور على المنتجات في متجرنا. ماذا تبحث عنه؟'
    },
    'hi': {
      'दूध': 'आप गलियारा 3, रेफ्रिजरेटेड सेक्शन में दूध पा सकते हैं, $3.99 की कीमत पर।',
      'रोटी': 'रोटी गलियारा 1, बेकरी सेक्शन में है, $2.49 की कीमत पर।',
      'केला': 'केले प्रोड्यूस सेक्शन में हैं, फ्रेश फ्रूट एरिया में, $1.29 की कीमत पर।',
      'default': 'मैं आपको हमारे स्टोर में उत्पाद खोजने में मदद कर सकता हूं। आप क्या खोज रहे हैं?'
    },
    'ru': {
      'молоко': 'Вы можете найти молоко в проходе 3, в холодильном отделе, за $3.99.',
      'хлеб': 'Хлеб находится в проходе 1, в отделе хлебобулочных изделий, за $2.49.',
      'бананы': 'Бананы находятся в отделе продуктов, в зоне свежих фруктов, за $1.29.',
      'default': 'Я могу помочь вам найти товары в нашем магазине. Что вы ищете?'
    },
    'ja': {
      'ミルク': '牛乳は通路3の冷蔵セクションで$3.99で見つけることができます。',
      'パン': 'パンは通路1のベーカリーセクションにあり、$2.49です。',
      'バナナ': 'バナナは農産物セクションの新鮮果物エリアにあり、$1.29です。',
      'default': '私たちの店で商品を見つけるお手伝いができます。何をお探しですか？'
    },
    'ko': {
      '우유': '우유는 3번 통로, 냉장 섹션에서 $3.99에 찾을 수 있습니다.',
      '빵': '빵은 1번 통로, 베이커리 섹션에 $2.49에 있습니다.',
      '바나나': '바나나는 농산물 섹션, 신선 과일 구역에 $1.29에 있습니다.',
      'default': '저희 매장에서 제품을 찾는 데 도움을 드릴 수 있습니다. 무엇을 찾고 계신가요?'
    },
    'th': {
      'นม': 'คุณสามารถหานมได้ที่ทางเดิน 3 ส่วนแช่เย็น ราคา $3.99',
      'ขนมปัง': 'ขนมปังอยู่ที่ทางเดิน 1 ส่วนเบเกอรี่ ราคา $2.49',
      'กล้วย': 'กล้วยอยู่ในส่วนผลิตภัณฑ์ พื้นที่ผลไม้สด ราคา $1.29',
      'default': 'ฉันสามารถช่วยคุณหาสินค้าในร้านของเราได้ คุณกำลังมองหาอะไร?'
    }
  };

  const langResponses = responses[language as keyof typeof responses] || responses.en;
  const lowerMessage = message.toLowerCase();
  
  for (const [keyword, response] of Object.entries(langResponses)) {
    if (keyword !== 'default' && lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  return langResponses.default;
}

export async function POST(request: NextRequest) {
  try {
    const { message, language } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Use provided language or detect from message
    const detectedLanguage = language || detectLanguage(message);
    
    console.log('=== CHAT API REQUEST ==='); // DEBUG
    console.log('Message:', message); // DEBUG
    console.log('Provided Language:', language); // DEBUG
    console.log('Final Language:', detectedLanguage); // DEBUG
    console.log('======================='); // DEBUG
    
    const response = getMockResponse(message, detectedLanguage);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const words = response.split(' ');
          
          for (const word of words) {
            const data = JSON.stringify({ 
              content: word + ' ', 
              language: detectedLanguage,
              done: false 
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          const finalData = JSON.stringify({ 
            content: '', 
            language: detectedLanguage,
            done: true 
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Accept-Charset': 'utf-8',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request', details: String(error) },
      { status: 500 }
    );
  }
}