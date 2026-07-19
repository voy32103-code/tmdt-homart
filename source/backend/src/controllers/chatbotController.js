const prisma = require('../config/prisma');
const { mapProduct } = require('./productController');

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

async function handleChatbot(req, res) {
  const { messages } = req.body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ message: 'Lịch sử tin nhắn không hợp lệ.' });
  }

  try {
    // Fetch products using Prisma
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      include: {
        category: true,
        store: true,
        prices: true,
        promotions: true,
        comments: true
      }
    });

    const mappedProducts = products.map(mapProduct);

    const catalogText = mappedProducts.map(p => {
      const priceText = p.finalPrice < p.price 
        ? `${p.finalPrice} đ (Giảm giá từ ${p.price} đ - Khuyến mại: ${p.promotion ? p.promotion.name : ''})`
        : `${p.price} đ`;
      return `- Tên: ${p.name}
  SKU: ${p.sku}
  Danh mục: ${p.categoryName}
  Thương hiệu: ${p.brand || 'Không có'}
  Giá: ${priceText}
  Tồn kho: ${p.stockQuantity} sản phẩm
  Mô tả: ${p.shortDescription || ''}`;
    }).join('\n\n');

    const systemPrompt = `Bạn là trợ lý ảo (Chatbot AI) tư vấn khách hàng của sàn thương mại đồ gia dụng HomeMart.
Nhiệm vụ của bạn là:
1. Tư vấn, giải đáp thắc mắc của khách hàng về các sản phẩm đồ gia dụng.
2. Giới thiệu sản phẩm phù hợp dựa trên danh sách sản phẩm hiện có dưới đây.
3. Luôn giữ thái độ thân thiện, lịch sự, chuyên nghiệp.
4. Trả lời bằng Tiếng Việt ngắn gọn, rõ ràng, định dạng Markdown đẹp mắt (sử dụng in đậm, danh sách...).
5. Nếu khách hỏi về sản phẩm không có trong danh sách, hãy khéo léo phản hồi là hiện tại chưa có mặt hàng đó và gợi ý các sản phẩm liên quan có sẵn.

Dưới đây là danh sách sản phẩm hiện có tại cửa hàng:
${catalogText}`;

    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const userMsg = messages[messages.length - 1]?.content || '';
      let reply = 'Xin chào! Tôi là trợ lý ảo HomeMart. Rất tiếc, hệ thống chưa cấu hình biến môi trường `GROQ_API_KEY` hoặc `GEMINI_API_KEY`. Dưới đây là thông tin các sản phẩm hiện có tại cửa hàng (chế độ demo):\n\n';
      const matched = mappedProducts.filter(p => p.name.toLowerCase().includes(userMsg.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(userMsg.toLowerCase())));
      if (userMsg.trim() !== '' && matched.length > 0) {
        reply += `Tìm thấy các sản phẩm liên quan đến yêu cầu của bạn:\n` + matched.map(p => `- **${p.name}** (Thương hiệu: ${p.brand || 'Khác'}, Giá bán: ${p.finalPrice.toLocaleString('vi-VN')} đ, Tồn kho: ${p.stockQuantity} chiếc)`).join('\n');
      } else {
        reply += `Danh sách sản phẩm đang bán:\n` + mappedProducts.map(p => `- **${p.name}** (Thương hiệu: ${p.brand || 'Khác'}, Giá bán: ${p.finalPrice.toLocaleString('vi-VN')} đ)`).join('\n') + `\n\n*Bạn hãy cấu hình biến môi trường \`GROQ_API_KEY\` hoặc \`GEMINI_API_KEY\` để kích hoạt tư vấn AI thông minh hơn.*`;
      }
      return res.json({ reply });
    }

    if (process.env.GROQ_API_KEY) {
      const payloadMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: payloadMessages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Xin lỗi, tôi không thể xử lý câu trả lời ngay lúc này.';
      return res.json({ reply });
    } else {
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      const requestPayload = {
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      };

      const model = 'gemini-2.0-flash';
      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi không thể xử lý câu trả lời ngay lúc này.';
      return res.json({ reply });
    }
  } catch (error) {
    console.error('Lỗi chatbot:', error);
    return res.status(500).json({ message: `Lỗi kết nối với AI Chatbot: ${error.message}` });
  }
}

module.exports = {
  handleChatbot
};
