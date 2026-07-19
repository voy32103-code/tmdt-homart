import React, { useState, useRef, useEffect } from 'react';

function parseMarkdown(text) {
  let escaped = String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
  escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");

  const lines = escaped.split("\n");
  let inList = false;
  const resultLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        resultLines.push("<ul>");
        inList = true;
      }
      resultLines.push(`<li>${trimmed.substring(2)}</li>`);
    } else {
      if (inList) {
        resultLines.push("</ul>");
        inList = false;
      }
      resultLines.push(line);
    }
  }
  if (inList) {
    resultLines.push("</ul>");
  }

  return resultLines.join("<br>").replace(/<\/ul><br>/g, "</ul>").replace(/<br><ul>/g, "<ul>");
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi tôi thông tin chi tiết về các sản phẩm đồ gia dụng có sẵn tại HomeMart." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userText = inputVal.trim();
    if (!userText) return;

    setInputVal('');
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) {
        let errMessage = "Không thể kết nối với máy chủ chatbot.";
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errMessage = errData.message;
          }
        } catch (_) {}
        throw new Error(errMessage);
      }

      const data = await response.json();
      const botReply = data.reply || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn ngay lúc này.";
      setMessages(prev => [...prev, { role: "assistant", content: botReply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "Đã xảy ra lỗi khi kết nối với trợ lý ảo: " + error.message }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div id="chatbotWidget" className="chatbot-widget">
      <button 
        id="chatbotToggleBtn" 
        className="chatbot-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mở chat tư vấn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {isOpen && (
        <div id="chatbotPanel" className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-info">
              <span className="chatbot-status-dot"></span>
              <div>
                <h4>Trợ lý AI HomeMart</h4>
                <p>Hỗ trợ mua sắm 24/7</p>
              </div>
            </div>
            <button id="chatbotCloseBtn" className="chatbot-close-btn" onClick={() => setIsOpen(false)} aria-label="Đóng chat">✕</button>
          </div>

          <div id="chatbotMessages" className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`chatbot-message ${msg.role === 'user' ? 'user' : 'bot'}`}
              >
                <p dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-message bot typing-indicator">
                <p>
                  <span></span>
                  <span></span>
                  <span></span>
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form id="chatbotForm" className="chatbot-input-area" onSubmit={handleSubmit}>
            <input 
              type="text" 
              id="chatbotInput" 
              placeholder="Nhập câu hỏi của bạn..." 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              autoComplete="off" 
              required 
            />
            <button type="submit" id="chatbotSendBtn" aria-label="Gửi">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
