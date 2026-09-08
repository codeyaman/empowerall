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

## 🧠 AI Architecture: Advanced n8n Orchestration

The true technical depth of **EmpowerAll** lies in its intelligent backend routing and orchestration engine powered by **n8n**. By engineering discrete, node-based workflows rather than relying on a monolithic API, the application achieves high availability, scales efficiently, and gracefully handles complex AI pipelines. 

The global AI Chatbot acts as a smart router, checking the user's context and directing the prompt to specialized, purpose-built AI agents via decoupled webhooks.

### 1. ⚖️ Legal AI Agent (High-Availability LLM Chain)
*Provides custom, multi-chapter legal guidance.*
- **Trigger:** Context-aware `N8N_WEBHOOK_LEGAL` POST Request.
- **Processing:** Utilizes a `Basic LLM Chain` to process the legal query.
- **Fault Tolerance:** Employs an `OpenRouter Chat Model` as the primary engine, but critically implements a **Fallback Model** (`OpenRouter Chat Model1`) to guarantee 100% uptime. If the primary AI provider experiences latency or downtime, the system instantly routes to the fallback, ensuring a seamless user experience.

### 2. 🧠 Skills Chatbot (Self-Healing Output Pipeline)
*Acts as a specialized learning assistant providing structured educational roadmaps.*
- **Trigger:** `N8N_WEBHOOK_SKILLS` initialized from the Skill Courses module.
- **AI Engine:** Driven by advanced OpenRouter Chat Models.
- **Self-Correcting Architecture:** To prevent the frontend from crashing due to hallucinated or malformed JSON, this pipeline employs an **Auto-fixing Output Parser**. If the primary LLM returns an invalid schema, a dedicated secondary LLM automatically analyzes the error and repairs the data structure in real-time.
- **Strict Schema Enforcement:** Data is finally piped through a **Structured Output Parser** to guarantee absolute data integrity before the webhook responds.

### 3. 🎯 Contextual Quiz Generator (API Integration Pipeline)
*Automatically generates precise quizzes based on YouTube video context.*
- **Pre-processing:** Uses a `Code in JavaScript` node to sanitize the incoming payload and execute custom extraction logic.
- **External Integration:** Triggers a native `HTTP Request` node to securely fetch external metadata via the YouTube integration.
- **Core AI:** Employs the highly capable `Mistral Cloud Chat Model` to synthesize the fetched context into rigorous, multiple-choice assessments.
- **Output:** Synchronous delivery back to the client to dynamically render the interactive quiz UI.

### 4. 🧱 Structured Data Parser Pipeline
*Ensures complex UI components receive predictable, typed data structures.*
- **Validation Layer:** Across the workflows, a `Structured Output Parser` is deeply integrated into the LLM chains. This crucial architectural decision ensures highly unstructured AI responses are deterministically parsed into exact JSON schemas, enabling the rich UI components to render flawlessly without runtime errors.

### 🌟 Enterprise-Grade Engineering
This architecture demonstrates several advanced engineering principles that make it production-ready:
- **Resiliency & High Availability:** Multi-model fallbacks ensure the platform is immune to single-point API provider failures.
- **Self-Healing Systems:** Real-time auto-fixing parsers solve the industry-wide challenge of unpredictable LLM outputs breaking UI components.
- **Microservices Architecture:** Each feature is an isolated, serverless workflow. Adding new AI capabilities requires zero modifications to the core frontend application, proving a highly scalable and maintainable codebase.

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
