// Configuration secrets — Fill in your own keys before running
// Copy this file to config.local.js and add your real keys there.
// config.local.js is gitignored and will override this file.
window.CONFIG = {
  YOUTUBE_API_KEY: 'YOUR_YOUTUBE_API_KEY',
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  // N8N Webhook URLs for specific AI chatbots
  N8N_WEBHOOK_HOME: '',
  N8N_WEBHOOK_LEGAL: 'YOUR_N8N_WEBHOOK_LEGAL',
  N8N_WEBHOOK_SKILLS: 'YOUR_N8N_WEBHOOK_SKILLS',
  N8N_WEBHOOK_VOICE: 'YOUR_N8N_WEBHOOK_VOICE',
  N8N_WEBHOOK_QUIZ: 'YOUR_N8N_WEBHOOK_QUIZ',
  FIREBASE_CONFIG: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  }
};
