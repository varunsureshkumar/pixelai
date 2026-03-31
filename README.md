<div align="center">

```
██████╗ ██╗██╗  ██╗███████╗██╗      █████╗ ██╗
██╔══██╗██║╚██╗██╔╝██╔════╝██║     ██╔══██╗██║
██████╔╝██║ ╚███╔╝ █████╗  ██║     ███████║██║
██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║     ██╔══██║██║
██║     ██║██╔╝ ██╗███████╗███████╗██║  ██║██║
╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝
```

### *The fastest way to make your photos Instagram-ready.*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Version](https://img.shields.io/badge/Version-1.0.0_MVP-FF3C3C?style=flat-square)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-00D4AA?style=flat-square)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)
[![Status](https://img.shields.io/badge/Status-Active-FFB800?style=flat-square)]()

</div>

---

## ✨ What is PixelAI?

PixelAI is a **mobile-first photo editing web app** built for social media creators who want stunning, Instagram-ready photos in under 15 seconds — no learning curve required.

Inspired by VSCO and Snapseed, but faster and smarter. The core idea: **1-tap looks** that instantly apply a curated aesthetic to any photo, combined with full manual control for those who want to go deeper.

---

## 🚀 Live Demo

> Deploy your own instance in 60 seconds — see [Deployment](#-deployment) below.

---

## 📱 Screenshots

| Upload Screen | 1-Tap Looks | Filters | Adjustments |
|:---:|:---:|:---:|:---:|
| Drop or pick any photo | 6 signature looks | 16 filter presets | 8 fine-tune controls |

---

## 🎯 Core Features — V1 MVP

### 🌟 1-Tap Looks *(The Differentiator)*

Six curated signature aesthetics — apply instantly, look amazing immediately:

| Look | Vibe | Best For |
|---|---|---|
| 📸 **Instagram Ready** | Bright, punchy, vibrant | Daily posts, portraits |
| 🎬 **Cinematic** | Desaturated, high contrast, cool | Moody shots, drama |
| ✈️ **Travel Pop** | Warm, saturated, energetic | Landscapes, adventures |
| 🌙 **Night Glow** | Cool, dark vignette, sharp | Night shots, urban |
| 🌅 **Golden Hour** | Warm sepia tones, soft vignette | Sunsets, portraits |
| 🎭 **Moody** | Deep shadows, desaturated, faded | Artistic, editorial |

### 🎨 Filters (16 Presets)

`Original` `Vivid` `Cinema` `Golden` `Noir` `Matte` `Arctic` `Pop` `Fade` `Lomo` `Dreamy` `Travel` `Dusk` `Clarity` `Teal` `Retro`

Live preview thumbnails show your actual photo with each filter applied.

### ⚙️ Adjustments (8 Controls)

Fine-tune with precision using both a focused large slider and a compact all-in-one grid:

- ☀️ **Brightness** — Exposure control (-100 to +100)
- ◑ **Contrast** — Shadow/highlight separation
- ◈ **Saturation** — Colour intensity
- ♨️ **Warmth** — Cool blue → Warm sepia tone shift
- ✦ **Sharpness** — Edge definition and clarity
- ⊙ **Vignette** — Radial darkening effect
- ▣ **Fade** — Film-style wash/fade overlay
- ~ **Blur** — Gaussian softness

### ✦ Auto-Enhance (AI Preset)

One tap applies a balanced enhancement: `+8 brightness`, `+14 contrast`, `+20 saturation`, `+6 warmth`, `+28 sharpness`, `+8 vignette`.

### 📐 Transform Tools

- ↻ **Rotate** — 90° increments
- ↔ **Flip Horizontal**
- ↕ **Flip Vertical**
- All transforms baked into export

### T Text Overlays

- Custom text input with Enter key support
- Font size control (14px – 80px)
- 8 colour swatches
- Multiple overlays, individually deletable
- Rendered onto canvas at full resolution on export

### 📤 HD Export

Canvas-based export at full original resolution. Renders all filters, vignette, fade, transforms, and text overlays into a single high-quality JPEG (0.95 quality).

### ↩️ Undo / Redo

20-state history stack. Works with button clicks or keyboard shortcuts:

- `⌘Z` / `Ctrl+Z` — Undo
- `⌘⇧Z` / `Ctrl+Shift+Z` — Redo

### ⊿ Before / After

Hold the compare button to instantly toggle between original and edited view.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   PixelAI V1 MVP                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│   UI Layer (React)                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│   │  Looks   │  │ Filters  │  │   Adjustments    │ │
│   │  Panel   │  │  Panel   │  │     Panel        │ │
│   └──────────┘  └──────────┘  └──────────────────┘ │
│         │              │               │            │
│   ┌─────▼──────────────▼───────────────▼─────────┐ │
│   │          State Machine (useReducer)           │ │
│   │    Actions: LOAD / ADJ / FILTER / LOOK /     │ │
│   │    ENHANCE / ROTATE / FLIP / UNDO / REDO /   │ │
│   │    BEFORE / ADD_TEXT / REMOVE_TEXT / RESET   │ │
│   └──────────────────────────────────────────────┘ │
│         │                                           │
│   ┌─────▼──────────────────────────────────────┐   │
│   │       CSS Filter Pipeline (real-time)      │   │
│   │   brightness → contrast → saturate →       │   │
│   │   sepia/hue-rotate (warmth) → blur         │   │
│   └──────────────────────────────────────────────┘ │
│         │                                           │
│   ┌─────▼──────────────────────────────────────┐   │
│   │    Canvas Export (full resolution)         │   │
│   │    Applies: filter + transform + vignette  │   │
│   │    + fade overlay + text overlays          │   │
│   └──────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘

Future Layers (V2/V3):
┌────────────────┐  ┌────────────────┐  ┌───────────┐
│    Firebase    │  │  remove.bg API │  │ TF Lite   │
│  Auth+Storage  │  │  Object Remove │  │ On-device │
└────────────────┘  └────────────────┘  └───────────┘
```

---

## 🧰 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | React 18 (hooks) | Component model, state management |
| **State** | `useReducer` | Predictable state machine with history |
| **Image Processing** | CSS Filters + Canvas API | GPU-accelerated, zero dependencies |
| **Styling** | Inline CSS-in-JS | Zero config, co-located, no build step |
| **Typography** | Syne + DM Mono (Google Fonts) | Premium editorial feel |
| **Export** | HTML5 Canvas | Full-res rendering with all effects |
| **Deploy** | Vercel | Instant CI/CD from GitHub push |

**No external dependencies beyond React itself.**

---

## 🗂️ Project Structure

```
pixelai/
├── public/
│   └── index.html
├── src/
│   ├── App.js          ← Entry point (imports PixelAI)
│   ├── PixelAI.jsx     ← Entire app (single component)
│   └── index.js
├── package.json
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- [Git](https://git-scm.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/pixelai.git

# 2. Move into the project folder
cd pixelai

# 3. Install dependencies
npm install

# 4. Start the development server
npm start
```

The app opens automatically at `http://localhost:3000`.

### Test on iPhone (same WiFi)

```bash
# Find your computer's IP address
# Mac:
ipconfig getifaddr en0

# Windows:
ipconfig
# Look for "IPv4 Address"
```

Then open `http://YOUR_IP:3000` in Safari on your iPhone.

---

## 📦 Deployment

### Deploy to Vercel (Recommended — Free)

```bash
# Option A: One-click via GitHub
# 1. Push code to GitHub
# 2. Go to vercel.com → Import project → Select repo → Deploy
# Done. Live in ~60 seconds.

# Option B: Vercel CLI
npm i -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Drag the /build folder into netlify.com/drop
```

### Build for Production Locally

```bash
npm run build
# Output in /build folder — ready to serve from any static host
```

---

## 🗺️ Product Roadmap

### ✅ V1 — MVP (Weeks 0–6) — *You are here*

- [x] 1-Tap Looks (6 signature aesthetics)
- [x] 16 Filter presets with live thumbnails
- [x] 8 Adjustment controls (brightness, contrast, saturation, warmth, sharpness, vignette, fade, blur)
- [x] Auto-Enhance (AI preset)
- [x] Rotate & Flip transforms
- [x] Text overlays (custom text, size, colour)
- [x] Before/After compare toggle
- [x] Undo/Redo (20-state history + keyboard shortcuts)
- [x] HD JPEG export via Canvas
- [x] Mobile-first responsive UI

### 🔜 V2 — Growth (Weeks 6–12)

- [ ] Object removal (remove.bg API)
- [ ] Background blur (portrait mode)
- [ ] Custom presets — save your own look
- [ ] Selective brush editing
- [ ] Skin smooth + teeth whitening
- [ ] Stickers and story templates
- [ ] Cloud save with Firebase Auth (Google/Apple login)
- [ ] Smart filter suggestions ("Try this look")

### 🌟 V3 — Advanced / Monetization (Months 3–6)

- [ ] Background replacement
- [ ] Sky replacement
- [ ] Layers and blending modes
- [ ] Short video editing
- [ ] Batch editing (multiple photos)
- [ ] Freemium model — subscription or one-time unlock
- [ ] Share directly to Instagram / WhatsApp
- [ ] Expo / React Native — App Store submission

---

## 🎯 Target Users

**Primary:** Social media creators (16–35), Instagram/TikTok, want results in under 15 seconds.

**Secondary:** Casual everyday users (25–50), family/travel photos, need simplicity.

**Positioning:** *"The fastest way to make your photos Instagram-ready."*

---

## 🧠 Design Decisions

**Why CSS Filters, not Canvas pixel manipulation?**
CSS filters are GPU-accelerated by the browser — they update in real time as sliders move with zero lag. Canvas pixel manipulation is used only at export time (where speed doesn't matter) to bake in all effects at full resolution.

**Why `useReducer` instead of `useState`?**
The undo/redo history stack requires atomic state snapshots. `useReducer` gives a predictable state machine where every action produces a complete new state — exactly what's needed to push/pop history.

**Why a single `.jsx` file?**
V1 MVP philosophy: ship fast, validate the idea. A single file is easier to copy, deploy, and hand off. V2 will split into proper feature modules.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/object-removal`
3. Commit your changes: `git commit -m "Add object removal via remove.bg API"`
4. Push to the branch: `git push origin feature/object-removal`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ for creators who move fast.

**PixelAI** · V1 MVP · 2026

</div>
