# Dokan Baki Manager

A simple, efficient web application for shop owners to manage customer dues (Baki) and payments. Built with React, Tailwind CSS, and Firebase.

## 🚀 Features
- **Secure Login**: Shop owner authentication.
- **Dashboard**: Overview of all customers and total market due.
- **Customer Management**: Add, Edit, and Delete customer profiles.
- **Baki Tracking**: Record dues and payments with dates.
- **Real-time**: Instant updates using Firebase Firestore.

## 🛠️ Step-by-Step Configuration Guide

To run this project, you need to set up a free Firebase project. Follow these steps carefully:

### Phase 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"**.
3. Name it `dokan-baki-manager` (or anything you like).
4. Disable "Google Analytics" (not needed for this MVP) and click **"Create project"**.
5. Wait for it to finish and click **"Continue"**.

### Phase 2: Register the App
1. On the project overview page, look for the **</>** icon (Web) under "Get started by adding Firebase to your app".
2. Register app nickname: `Dokan Web`.
3. **Uncheck** "Also set up Firebase Hosting" (we will do this later if needed).
4. Click **"Register app"**.
5. You will see a code block with `firebaseConfig`. **Keep this page open** or copy the values inside `const firebaseConfig = { ... }`.

### Phase 3: Enable Authentication
1. Go to **Build > Authentication** in the left sidebar.
2. Click **"Get Started"**.
3. Select **"Email/Password"** from the Sign-in providers.
4. Enable the **"Email/Password"** switch.
5. Click **"Save"**.
6. (Optional) Go to the **"Users"** tab and click "Add user" to create your login credentials (e.g., `admin@shop.com` / `123456`). This will be your login for the app.

### Phase 4: Enable Database (Firestore)
1. Go to **Build > Firestore Database** in the left sidebar.
2. Click **"Create Database"**.
3. Choose a location (e.g., `asia-southeast1` or default).
4. **Important**: Select **"Start in test mode"**.
   - *Note: Test mode allows anyone with the code to read/write for 30 days. For production, you will need to update security rules.*
5. Click **"Create"**.

### Phase 5: Connect to Code
1. In your project folder (`d:\CODINGS\BAKI KHATA`), create a new file named `.env`.
2. Open `.env` and fill it with the keys you got in Phase 2. Use the format below:

```env
VITE_FIREBASE_API_KEY=your_api_key_from_firebase
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Phase 6: Run the App
1. Open your terminal in the project folder.
2. Run `npm run dev`.
3. Open the link shown (e.g., `http://localhost:5173`).
4. Login with the user you created in Phase 3.

## 📦 Tech Stack
- **Frontend**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Backend**: Firebase Auth & Firestore
- **Icons**: Lucide React
