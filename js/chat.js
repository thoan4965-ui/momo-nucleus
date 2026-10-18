/* chat.js — AI chat hybrid: FAQ 100 cau local (offline) -> neu miss thi goi backend Ollama /api/chat.
   Cau hinh: dien CHAT_ENDPOINT (URL ngrok https, KHONG kem dau "/" cuoi). De '' = chi dung FAQ local.
   Backend: Colab T4 + Ollama qwen2.5:7b (xem server/colab_chat.ipynb). KHONG dat token/secret o day. */
(function () {
  'use strict';

  var CHAT_ENDPOINT = 'https://demanding-harddisk-hatbox.ngrok-free.dev'; // dev domain co dinh (P6)
  var BACKUP_ENDPOINT = 'https://momo-glm-proxy.thoan4965.workers.dev'; // Cloudflare Worker + GLM 4.7 (du phong khi Colab tat)
  var MODEL = 'qwen2.5:7b';
  var REMOTE_TIMEOUT_MS = 60000;
  var SYSTEM_PROMPT = 'Bạn là trợ lý học tập của trang "Nucleus — Nhiễm sắc thể" cho học sinh lớp 12 (chương trình Việt Nam). LĨNH VỰC GỐC: sinh học — nhiễm sắc thể, nguyên phân, giảm phân, đột biến NST, gen - DNA, di truyền học; câu hỏi thuộc lĩnh vực này phải trả lời chính xác, bám sát kiến thức phổ thông. MỞ RỘNG (quan trọng): với câu hỏi ngoài môn sinh (toán, lý, hóa, tin học, văn, kỹ năng học tập, đời sống...), KHÔNG được xin lỗi, KHÔNG được từ chối, KHÔNG được nói câu hỏi không thuộc sinh học — hãy trả lời trực tiếp, đầy đủ, thân thiện như một gia sư đa môn; khi thấy tự nhiên hãy liên hệ nhẹ về góc nhìn sinh học, nhưng đừng gượng ép. QUY TẮC NGÔN NGỮ (bắt buộc): 1) Luôn trả lời 100% bằng tiếng Việt có dấu. 2) TUYỆT ĐỐI không viết chữ Hán hoặc tiếng Trung, dù chỉ một ký tự — nếu sắp viết ký tự tiếng Trung hãy dừng lại và viết lại bằng tiếng Việt. 3) Không trả lời bằng tiếng Anh — chỉ giữ nguyên viết tắt khoa học phổ biến (DNA, NST, RNA). Trả lời ngắn gọn, chính xác, dễ hiểu, phù hợp học sinh lớp 12. Nếu không chắc chắn, nói rõ là không chắc chắn.';
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

  function hasCJK(s) {
    return /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff]/.test(s || '');
  }
  function stripCJK(s) {
    return (s || '').replace(/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff]+/g, ' ')
      .replace(/\s{2,}/g, ' ').trim();
  }

  // Goi backend Ollama — tra ve Promise<string> noi dung
  function callModel(text, extraNote) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, REMOTE_TIMEOUT_MS);
    var msgs = [{ role: 'system', content: SYSTEM_PROMPT }];
    if (extraNote) msgs.push({ role: 'system', content: extraNote });
    msgs.push({ role: 'user', content: text + '\n\n(Trả lời bằng tiếng Việt có dấu. Không dùng chữ Hán.)' });

    return fetch(CHAT_ENDPOINT + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: msgs,
        options: { temperature: 0.4, num_predict: 500 }
      }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      clearTimeout(timer);
      return (data && data.message && data.message.content) ? data.message.content.trim() : '';
    });
  }

  var CJK_RETRY_NOTE = 'Lần trả lời trước bị lẫn chữ Hán/tiếng Trung. Viết lại HOÀN TOÀN bằng tiếng Việt có dấu; TUYỆT ĐỐI không một ký tự Hán.';

  // Tang 1 (chinh): Colab Qwen qua ngrok — kem guard CJK (retry + loc)
  function askPrimary(text) {
    return callModel(text, null).then(function (a) {
      if (a && !hasCJK(a)) return a;
      return callModel(text, CJK_RETRY_NOTE)
        .then(function (b) { return hasCJK(b) ? stripCJK(b) : b; })
        .catch(function () { return stripCJK(a); });
    });
  }

  // Tang 2 (du phong): Cloudflare Worker + GLM 4.7 — worker da guard CJK server-side,
  // client loc them 1 lan nua cho chac.
  function askBackup(text) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, REMOTE_TIMEOUT_MS);
    return fetch(BACKUP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error('backup HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      clearTimeout(timer);
      if (!d || !d.answer) throw new Error('backup empty');
      var a = String(d.answer).trim();
      return hasCJK(a) ? stripCJK(a) : a;
    });
  }

  function askRemote(text) {
    var chain = (CHAT_ENDPOINT ? askPrimary(text) : Promise.reject(new Error('no primary')));
    chain.catch(function () {
      if (!BACKUP_ENDPOINT) throw new Error('no backup');
      console.info('[chat] primary failed -> dung GLM backup');
      return askBackup(text);
    })
      .then(function (final) {
        removeTypingIndicator();
        addMessage(final || REMOTE_ERROR_TEXT, 'ai');
      })
      .catch(function () {
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
