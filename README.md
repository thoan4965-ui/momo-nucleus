# momo — Nucleus (Human Chromosome)

Trang web giáo dục Sinh học 12 — Hình 7.2 Nhiễm sắc thể. Kiến trúc: web tĩnh nhẹ (0 WebGL) + chat hybrid (FAQ local + LLM trên Colab).

**🌐 Bản public: https://thoan4965-ui.github.io/momo-nucleus/** (GitHub Pages, repo `thoan4965-ui/momo-nucleus`)

Cập nhật bản public sau khi sửa code:
```
python tools/build-dist.py
cd dist && git add -A && git commit -m "update" && git push
```

## Cấu trúc

```
index.html            — trang chính
css/styles.css        — toàn bộ CSS
js/                   — qa-database.js (100 câu FAQ) · chat.js (hybrid chat) · main.js · rotate-viewer.js · micro-interactions.js · fullscreen.js
assets/baked/         — sprite sheet 48 frame (WebP) + manifest — sinh bởi Colab bake, KHÔNG sửa tay
server/bake/          — colab_bake.ipynb + render_glb.py + composite.py (nhà máy render 3D → ảnh)
server/colab_chat.ipynb — Colab chat backend (Ollama + qwen2.5:7b + ngrok)
tools/                — harness đo hiệu năng (baseline.html, after.html, measure.js)
backup/               — bản gốc (4 html cũ + 2 GLB 80MB) — bất khả xâm phạm
plan/                 — PLAN.md + project_logbook.md
```

## Chạy local

```
cd D:\momo
python -m http.server 8000
```
Mở `http://localhost:8000/index.html`. Bắt buộc dùng HTTP server (không mở trực tiếp file:// — sprite/model sẽ không tải được).
Phone cùng mạng/hotspot: `http://<IP-LAN>:8000/index.html`.

## Bật chat AI (P6 — Colab backend)

1. Mở `server/colab_chat.ipynb` trên Colab → Runtime > **T4 GPU**
2. Colab Secrets (sidebar 🔑): thêm `NGROK_AUTHTOKEN` = authtoken ngrok (bật Notebook access)
3. **Run all** → chờ cell 4 in `PUBLIC URL` (dev domain cố định)
4. URL đó đã điền sẵn trong `js/chat.js` → `CHAT_ENDPOINT`. Nếu URL khác → sửa 1 dòng đó.
5. Colab tắt → chat tự rơi về FAQ local (trang không chết).

## Bake lại 3D (khi đổi model/style)

1. Upload `abc.glb` + `123.glb` + `server/bake/*.py` vào `MyDrive/momo/`
2. Mở `server/bake/colab_bake.ipynb` (T4) → Run all (~30 phút)
3. Tải `MyDrive/momo/baked/` về `assets/baked/`

## Bảo mật

- KHÔNG commit token/secret (ngrok authtoken chỉ nằm trong Colab Secrets)
- `backup/` + `*.glb` không nằm trong git (xem `.gitignore`)
