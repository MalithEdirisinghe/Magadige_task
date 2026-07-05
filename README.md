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
| Google Sign-In | ✅ | ✅ Native |
| Real-time Task CRUD | ✅ Firestore onSnapshot | ✅ Firestore onSnapshot |
| **✦ AI Magic** (Gemini) | ✅ | ✅ |
| Swipe-to-Delete / Complete | — | ✅ Native Gesture |
| Progress Bar | ✅ | ✅ |
| Sub-task expansion | ✅ | ✅ |

---

## 🚀 Quick Start

### Web Frontend

```bash
cd web-frontend
# 1. Set your Firebase config in src/config/firebase.ts
# 2. Set your Gemini API key in src/services/gemini.ts
npm run dev
# Open http://localhost:5173
```

### Mobile Frontend

```bash
cd mobile-frontend
# 1. Set your Firebase config in src/config/firebase.ts
# 2. Set GOOGLE_WEB_CLIENT_ID in src/config/firebase.ts
# 3. Set your Gemini API key in src/services/gemini.ts
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
2. Replace `YOUR_GEMINI_API_KEY` in both `src/services/gemini.ts` files

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

```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
npm install @react-native-google-signin/google-signin
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
```

---

## 🏛 Architecture

```
Firebase Cloud Firestore (Real-time NoSQL DB)
         ↕ onSnapshot
    ┌────┴────┐
    │  Web    │   ←→   Google Gemini AI API
    │Frontend │              ↕
    └─────────┘      (AI Magic breakdown)
         ↕
    ┌────┴────┐
    │ Mobile  │   ←→   Google Gemini AI API
    │Frontend │
    └─────────┘
```

Both apps share the **same Firestore collection** (`tasks`), so any task added/modified on one platform reflects instantly on the other.
