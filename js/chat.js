/* chat.js — AI chat hybrid: FAQ 100 cau local (offline) -> neu miss thi goi backend Ollama /api/chat.
   Cau hinh: dien CHAT_ENDPOINT (URL ngrok https, KHONG kem dau "/" cuoi). De '' = chi dung FAQ local.
   Backend: Colab T4 + Ollama qwen2.5:7b (xem server/colab_chat.ipynb). KHONG dat token/secret o day. */
(function () {
  'use strict';

  var CHAT_ENDPOINT = 'https://demanding-harddisk-hatbox.ngrok-free.dev'; // dev domain co dinh (P6)
  var MODEL = 'qwen2.5:7b';
  var REMOTE_TIMEOUT_MS = 60000;
  var SYSTEM_PROMPT = 'Bạn là trợ lý học tập của trang "Nucleus — Nhiễm sắc thể" cho học sinh lớp 12 (chương trình Việt Nam). LĨNH VỰC GỐC: sinh học — nhiễm sắc thể, nguyên phân, giảm phân, đột biến NST, gen - DNA, di truyền học; câu hỏi thuộc lĩnh vực này phải trả lời chính xác, bám sát kiến thức phổ thông. MỞ RỘNG: bạn được phép trả lời cả câu hỏi ngoài môn sinh (toán, lý, hóa, tin học, văn, kỹ năng học tập, đời sống...) một cách thân thiện và hữu ích; khi có thể hãy liên hệ về góc nhìn sinh học làm nền tảng, nhưng đừng gượng ép nếu không liên quan. QUY TẮC NGÔN NGỮ (bắt buộc): 1) Luôn trả lời 100% bằng tiếng Việt có dấu. 2) TUYỆT ĐỐI không viết chữ Hán hoặc tiếng Trung, dù chỉ một ký tự. 3) Không trả lời bằng tiếng Anh — chỉ giữ nguyên viết tắt khoa học phổ biến (DNA, NST, RNA). Trả lời ngắn gọn, chính xác, dễ hiểu, phù hợp học sinh lớp 12. Nếu không chắc chắn, nói rõ là không chắc chắn.';
  var FALLBACK_TEXT = 'Câu hỏi của bạn khá thú vị! Tuy nhiên, kho dữ liệu của tôi hiện tại chưa có câu trả lời chính xác cho vấn đề này. Bạn có thể thử hỏi về các chủ đề như: Nguyên phân, Giảm phân, Cấu trúc NST, Trao đổi chéo, Đột biến NST, hoặc click vào các gợi ý câu hỏi phía trên nhé!';
  var REMOTE_ERROR_TEXT = 'AI đang tạm không kết nối được — bạn thử lại sau nhé. Trong lúc đó, bạn có thể hỏi về: Nguyên phân, Giảm phân, Cấu trúc NST, Đột biến NST, Gen và DNA.';

  var aiForm = document.getElementById('aiForm');
  var aiInput = document.getElementById('aiInput');
  var aiChatMessages = document.getElementById('aiChatMessages');
  var aiPrompts = document.getElementById('aiPrompts');
  var DEBUG = /[?&]debug=1/.test(window.location.search);

  // Scoring FAQ nam o js/qa-score.js (IDF weights). Tra null neu ngoai kho.
  function findLocalAnswer(query) {
    return QAScore.findLocalAnswer(QA_DATABASE, query);
  }

  function addMessage(text, sender) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ' + (sender === 'user' ? 'user-message' : 'ai-message');

    var avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = sender === 'user' ? 'You' : 'AI';

    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    aiChatMessages.appendChild(msgDiv);

    // Scroll to bottom
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ai-message typing-msg';
    msgDiv.id = 'typingIndicator';

    var avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = 'AI';

    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    aiChatMessages.appendChild(msgDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    var indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  }

  // Goi backend Ollama (OpenAI-style /api/chat) — chi khi co CHAT_ENDPOINT
  function askRemote(text) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, REMOTE_TIMEOUT_MS);

    fetch(CHAT_ENDPOINT + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text + '\n\n(Trả lời bằng tiếng Việt có dấu. Không dùng chữ Hán.)' }
        ],
        options: { temperature: 0.4, num_predict: 500 }
      }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      clearTimeout(timer);
      removeTypingIndicator();
      var reply = (data && data.message && data.message.content) ? data.message.content.trim() : '';
      addMessage(reply || REMOTE_ERROR_TEXT, 'ai');
    }).catch(function () {
      clearTimeout(timer);
      removeTypingIndicator();
      addMessage(REMOTE_ERROR_TEXT, 'ai');
    });
  }

  if (aiForm) {
    aiForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = aiInput.value.trim();
      if (!text) return;

      // Add user message
      addMessage(text, 'user');
      aiInput.value = '';

      // Show typing indicator
      showTypingIndicator();

      var local = findLocalAnswer(text);
      if (local) {
        setTimeout(function () {
          removeTypingIndicator();
          addMessage(local.text + (DEBUG ? '  [FAQ score ' + local.score + ']' : ''), 'ai');
        }, 500 + Math.random() * 500);
      } else if (CHAT_ENDPOINT) {
        askRemote(text);
      } else {
        setTimeout(function () {
          removeTypingIndicator();
          addMessage(FALLBACK_TEXT, 'ai');
        }, 500 + Math.random() * 500);
      }
    });
  }

  // Xử lý khi click vào Gợi ý câu hỏi
  if (aiPrompts) {
    aiPrompts.addEventListener('click', function (e) {
      if (e.target.classList.contains('ai-prompt-chip')) {
        var question = e.target.textContent;
        aiInput.value = question;
        // Tự động submit
        aiForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
  }
})();
