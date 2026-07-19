(function () {
  const chatbotToggleBtn = document.querySelector("#chatbotToggleBtn");
  const chatbotPanel = document.querySelector("#chatbotPanel");
  const chatbotCloseBtn = document.querySelector("#chatbotCloseBtn");
  const chatbotForm = document.querySelector("#chatbotForm");
  const chatbotInput = document.querySelector("#chatbotInput");
  const chatbotMessages = document.querySelector("#chatbotMessages");

  let messages = [
    { role: "assistant", content: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi tôi thông tin chi tiết về các sản phẩm đồ gia dụng có sẵn tại HomeMart." }
  ];

  chatbotToggleBtn.addEventListener("click", () => {
    chatbotPanel.classList.toggle("hidden");
    chatbotInput.focus();
    scrollToBottom();
  });

  chatbotCloseBtn.addEventListener("click", () => {
    chatbotPanel.classList.add("hidden");
  });

  chatbotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = chatbotInput.value.trim();
    if (!userText) return;

    chatbotInput.value = "";
    addMessage("user", userText);
    messages.push({ role: "user", content: userText });

    const typingIndicator = addTypingIndicator();

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối với máy chủ chatbot.");
      }

      const data = await response.json();
      removeTypingIndicator(typingIndicator);

      const botReply = data.reply || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn ngay lúc này.";
      addMessage("assistant", botReply);
      messages.push({ role: "assistant", content: botReply });
    } catch (error) {
      console.error(error);
      removeTypingIndicator(typingIndicator);
      addMessage("assistant", "Đã xảy ra lỗi khi kết nối với trợ lý ảo: " + error.message);
    }
  });

  function addMessage(role, text) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chatbot-message", role === "user" ? "user" : "bot");

    const contentP = document.createElement("p");
    contentP.innerHTML = parseMarkdown(text);
    messageDiv.appendChild(contentP);

    chatbotMessages.appendChild(messageDiv);
    scrollToBottom();
  }

  function addTypingIndicator() {
    const indicatorDiv = document.createElement("div");
    indicatorDiv.classList.add("chatbot-message", "bot", "typing-indicator");
    indicatorDiv.innerHTML = `
      <p>
        <span></span>
        <span></span>
        <span></span>
      </p>
    `;
    chatbotMessages.appendChild(indicatorDiv);
    scrollToBottom();
    return indicatorDiv;
  }

  function removeTypingIndicator(indicatorDiv) {
    if (indicatorDiv && indicatorDiv.parentNode) {
      indicatorDiv.parentNode.removeChild(indicatorDiv);
    }
  }

  function scrollToBottom() {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

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
})();
