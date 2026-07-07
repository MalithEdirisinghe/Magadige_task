# Magadige Smart Task Manager

> **Magadige Future Creators Recruitment — Stage 2 Assignment**

An AI-powered Smart Task Management Platform with real-time sync across Web and Mobile.

---

## 🏗 Project Structure

```
magadige-smart-taskmanager/
├── web-frontend/          # React.js SPA (Vite + TypeScript + Tailwind CSS)
└── mobile-frontend/       # Pure React Native CLI (TypeScript)
```

---

## ✨ Features

| Feature | Web | Mobile |
|---|---|---|
| Email/Password Auth | ✅ | ✅ |
| Google Sign-In | ✅ (Official Logo) | ✅ Native (Official Logo) |
| Forgot Password Reset | ✅ | ✅ |
| Password Visibility Toggle | ✅ (Lucide Eye) | ✅ (High-Res Icons) |
| Real-time Task CRUD | ✅ Firestore onSnapshot | ✅ Firestore onSnapshot |
| **✦ AI Magic** (Gemini) | ✅ (gemini-2.5-flash) | ✅ (gemini-2.5-flash) |
| Swipe-to-Delete / Complete | — | ✅ Native Gesture |
| Delete Task Confirmation | ✅ (Browser alert) | ✅ (Animated Native Prompt) |
| Progress Bar | ✅ | ✅ |
| Sub-task expansion | ✅ | ✅ |
| **⏱️ Pomodoro Focus Timer** | ✅ (Presets + Custom) | ✅ (Presets + Custom Modal) |
| **🔊 Timer Beep & Vibration** | ✅ (Web Audio Synth) | ✅ (Success Vibe + Beep.wav) |
| **⚠️ Smart Priority Highlights** | ✅ (Sinhala & Eng Keywords) | ✅ (Sinhala & Eng Keywords) |

---

## ⭐ Stage 2 Premium Enhancements

Here are the advanced upgrades added to improve the overall UX and design:

1. **Smart Priority Task Detection:**
   - Real-time keyword scanning automatically tags a task as `⚠️ Urgent` if it contains high-priority keywords (e.g. `urgent`, `asap`, `tomorrow`, `critical`, `flight`, `tickets`).
   - Includes **Sinhalese localization** support (e.g. ඉක්මන්/`ikman`, හෙට/`heta`, අද/`ada`).
   - Web: Renders a glowing red border, red glassmorphic tint, and a pulsing alert tag.
   - Mobile: Highlights the task card with a red-themed `cardUrgent` border and background style.
2. **Pomodoro Focus Timer (Countdowns):**
   - Clicking focus launches a beautiful sticky countdown bar.
   - Web: Prompt allows customized focus minutes. Completion triggers a synthesized double-beep beep alarm built entirely offline using the browser's HTML5 **Web Audio API**.
   - Mobile: Opens a custom selection Modal with quick preset pills (`15m`, `25m`, `45m`, `60m`) or numeric typing input. Completion triggers a tactile success vibration and plays a local `beep.wav` file using `react-native-sound-player`.
3. **Password Security Upgrades:**
   - Password reset/forgot-password triggers Firebase password reset email flow.
   - Secure text inputs render a visibility eye/eye-off toggle (high-density, crisp vector eye image files used on mobile to prevent scaling degradation).
4. **Haptic Feedback (Mobile):**
   - Integrates tactile `impactLight` feedback on completing tasks via swipe gestures and when pressing the AI breakdown button.
5. **Delete Confirmation Flow:**
   - Prevents accidental deletions with confirmations. Web triggers standard prompt, while Mobile triggers native Alert. Cancel smoothly spring-animates the card back to center.

---

## 🚀 Quick Start

### Web Frontend

```bash
cd web-frontend
# 1. Set your Firebase config in src/config/firebase.ts
# 2. Create web-frontend/.env and add VITE_GEMINI_API_KEY=YOUR_KEY
npm run dev
# Open http://localhost:5173
```

### Mobile Frontend

```bash
cd mobile-frontend
# 1. Set your Firebase config in src/config/firebase.ts
# 2. Set GOOGLE_WEB_CLIENT_ID in src/config/firebase.ts
# 3. Create mobile-frontend/src/config/env.ts (from env.example.ts) and add your key
# 4. Add google-services.json to android/app/
npm install
npx react-native run-android
```

---

## 🔧 Required Setup

### Firebase
1. Create a project at https://console.firebase.google.com
2. Enable **Authentication** → Email/Password + Google
3. Enable **Firestore Database** (start in test mode)
4. Add a **Web app** → copy config to `web-frontend/src/config/firebase.ts`
5. Add an **Android app** → download `google-services.json` → place in `mobile-frontend/android/app/`

### Gemini API Key
1. Get a free API key at https://aistudio.google.com/app/apikey
2. Configure the keys in local config files (they are ignored by Git):
   - **Web App:** Create `web-frontend/.env` file and define `VITE_GEMINI_API_KEY=your_key_here`
   - **Mobile App:** Create `mobile-frontend/src/config/env.ts` (using `env.example.ts` as a template) and define `export const GEMINI_API_KEY = 'your_key_here';`

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 📱 Mobile Dependencies

Installed community modules:
* **Firebase:** `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`
* **Google Auth:** `@react-native-google-signin/google-signin`
* **Navigation:** `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`
* **Tactility & Media:** `react-native-haptic-feedback`, `react-native-sound-player`

---

## 🏛 Architecture

```
Firebase Cloud Firestore (Real-time NoSQL DB)
         ↕ onSnapshot
    ┌────┴────┐
    │  Web    │   ←→   Google Gemini AI API (gemini-2.5-flash)
    │Frontend │              ↕
    └─────────┘      (AI Magic breakdown)
         ↕
    ┌────┴────┐
    │ Mobile  │   ←→   Google Gemini AI API (gemini-2.5-flash)
    │Frontend │
    └─────────┘
```

Both apps share the **same Firestore collection** (`tasks`), so any task added/modified on one platform reflects instantly on the other.
