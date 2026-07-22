# EmpowerAll 🌍

> **EmpowerAll** is a comprehensive, AI-powered community platform designed to democratize legal education, foster skill development, and amplify community voices. Built with modern web technologies and supercharged by **n8n Webhook Automations**, it serves as an interactive hub for personal growth and social empowerment.

🌐 **Live Demo:** [https://empowerall-102a7.web.app](https://empowerall-102a7.web.app)

---

## ✨ Key Features & Pillars

### 1. ⚖️ Know Your Rights (AI Legal Advisor)
- Interactive, beautifully rendered cards for fundamental legal rights.
- **Dynamic AI Generation:** Users can type a query, and the AI generates a customized, multi-chapter legal guidance module on the fly.
- Tracks mastery and visually updates progress bars.

### 2. 📚 Skill Courses (Smart Learning)
- Integrates directly with the **YouTube Data API** to instantly fetch high-quality playlists and tutorials.
- Allows users to search for any topic (e.g., "Python for Beginners") and automatically creates a structured course.
- **AI-Powered Quizzes:** Automatically generates contextual quizzes based on the course material using backend n8n webhooks.

### 3. 🗣️ Raise Your Voice
- A community storytelling platform where users can post their experiences, challenges, and stories anonymously or publicly.
- Supports rich text, dynamic tags, and image uploads.

### 4. 🤝 Act of Kindness
- A social feed dedicated to highlighting positive actions within the community.
- Encourages engagement and inspires others to contribute positively to society.

---

## 🤖 The Brain: n8n Webhook Architecture

The true magic of **EmpowerAll** lies in its intelligent backend routing powered by **n8n**. Instead of relying on a monolithic API structure, the platform uses context-aware webhooks to deliver specialized AI capabilities based on the user's current page.

**How it works:**
The global AI Chatbot intelligently checks the `window.location.hash` and routes the user's prompt to specialized n8n workflows:

1. **`N8N_WEBHOOK_LEGAL`**: Triggered on the *Know Your Rights* page. It acts as a legal advisor, structuring its JSON response into chapters and modules, which the frontend automatically parses and renders as an interactive learning modal.
2. **`N8N_WEBHOOK_SKILLS`**: Triggered on the *Skill Courses* page. It acts as a specialized learning assistant, providing structured educational insights and study roadmaps.
3. **`N8N_WEBHOOK_VOICE`**: Triggered on community pages to help users draft well-articulated stories and posts.
4. **`N8N_WEBHOOK_QUIZ`**: Triggered dynamically when a user completes a YouTube course, passing the video context to generate a highly specific, multiple-choice quiz.
5. **Support Ticket Flow**: On the Home page, the chatbot converts into a triage system, allowing users to submit *Problems, Queries, or Feedback* directly to the support team without invoking the LLMs unnecessarily.

---

## 🛠️ Technology Stack

- **Frontend:** Vanilla HTML5, CSS3 (with Custom Properties for Light/Dark mode), and JavaScript.
- **Authentication:** **Firebase Authentication** (Email & Password + Google Sign-In Provider).
- **Hosting:** **Firebase Hosting**.
- **Backend Automations:** **n8n** (Node-based automations managing LLM orchestration).
- **External APIs:** YouTube Data API v3 (for course curation).
- **Data Persistence:** LocalStorage (for offline-first capabilities) securely tied to the authenticated Firebase User ID.

---

## 🚀 Local Setup & Installation

If you want to run EmpowerAll locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/codeyaman/empowerall.git
cd empowerall
```

### 2. Configure Secrets
The repository comes with a sanitized `config.js` template. You must create your own local configuration file:
1. Create a file named `config.local.js` in the root directory.
2. Copy the structure from `config.js` into `config.local.js`.
3. Fill in your actual `YOUTUBE_API_KEY`, `GOOGLE_CLIENT_ID`, and your active **n8n Webhook URLs**.

*(Note: `config.local.js` is included in `.gitignore` to prevent your keys from leaking).*

### 3. Firebase Setup (Optional)
If you wish to deploy your own instance:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy --only hosting`

### 4. Run the app
Simply serve the directory using any local web server. For example:
```bash
npx serve .
# or
python3 -m http.server 8000
```

---

## 🎨 UI/UX Highlights
- **Glassmorphism & Micro-animations:** Premium, fluid interactions that make the platform feel alive.
- **Scroll Reveal Architecture:** Content fades and slides in dynamically as the user scrolls, retaining engagement.
- **Contextual Modals:** Large, distraction-free overlays for taking AI-generated courses and reading community stories.

---

*Built with ❤️ to empower communities everywhere.*
