# 🔍 RepoWise AI
### AI-Powered GitHub Repository Analyzer

> Paste any GitHub URL — RepoWise AI explains the entire codebase in minutes using RAG, Vector Embeddings, and Gemini AI.

![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Node](https://img.shields.io/badge/Node.js-Express-green)
![AI](https://img.shields.io/badge/AI-Gemini%202.0-blue)
![DB](https://img.shields.io/badge/VectorDB-Pinecone-purple)

---

## 🚀 What is RepoWise AI?

RepoWise AI is a full-stack AI-powered tool that helps developers **understand any GitHub repository quickly**.

Instead of spending hours reading code — just paste the GitHub URL and get:
- A complete AI-generated summary of what the project does
- File-by-file explanations
- Architecture and API flow
- Security vulnerabilities
- Dependency graph
- Chat with the codebase using natural language

---

## ✅ Features (Completed)

| Feature | Description | Status |
|--------|-------------|--------|
| **Auth System** | Register, Login, OTP Email Verify, Forgot Password | ✅ Done |
| **GitHub Repo Add** | Add any public GitHub repo via URL | ✅ Done |
| **AI Analysis** | Summary, Architecture, Folder Structure, API Flow, Tech Stack | ✅ Done |
| **File Summaries** | AI explains every file individually | ✅ Done |
| **File Search** | Search files by name or content | ✅ Done |
| **Vector Embeddings** | Files converted to 768-dim vectors using Gemini + stored in Pinecone | ✅ Done |
| **AI Request Logs** | Every AI call tracked with tokens, model, status | ✅ Done |
| **Usage Tracking** | Credits, total requests, plan type tracked per user | ✅ Done |

---

## 🔄 Features (In Progress)

| Feature | Description | Status |
|--------|-------------|--------|
| **Dependency Graph** | Visualize file-to-file import relationships using Regex parsing | 🔄 Building |
| **Chat with Repo** | Ask anything about the codebase — RAG-powered answers using Pinecone | 🔄 Building |
| **Security Scan** | AI detects vulnerabilities, hardcoded secrets, missing validations | 🔄 Building |
| **Commit History** | AI analyzes Git commits and explains what changed and why | 🔄 Building |
| **Team Collaboration** | Invite team members, assign roles (Admin/Member/Viewer) | 🔄 Building |
| **Subscription & Credits** | Free/Pro/Enterprise plans with Stripe payment integration | 🔄 Building |
| **Frontend** | React-based UI for all features | 🔄 Building |

---

## 🧠 How It Works

```
1. User adds a GitHub repo URL
      ↓
2. GitHub API (Octokit) fetches all files recursively
      ↓
3. Gemini AI analyzes the full codebase
   → Summary, Architecture, API Flow, Tech Stack
      ↓
4. Each file gets an individual AI summary
      ↓
5. Files are chunked + converted to 768-dim vectors
   → Stored in Pinecone Vector DB
      ↓
6. User can:
   → Chat with repo (RAG-powered)
   → Search files semantically
   → View dependency graph
   → Run security scan
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Use |
|-----------|-----|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JWT + Cookies | Authentication |
| Nodemailer | OTP email verification |
| Octokit | GitHub API integration |

### AI & Vector
| Technology | Use |
|-----------|-----|
| Gemini 2.0 Flash | AI analysis, file summaries, security scan |
| Gemini Embedding Model | Convert file content to 768-dim vectors |
| Pinecone | Vector database for semantic search |
| RAG Pipeline | Retrieval Augmented Generation for chat |
| LangChain | Document chunking + Pinecone integration |

### Frontend *(In Progress)*
| Technology | Use |
|-----------|-----|
| React | UI framework |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Axios | API calls |

---

## 📁 Project Structure

```
repowise-ai/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js        ✅
│   │   ├── repo.controller.js        ✅
│   │   ├── analysis.controller.js    ✅
│   │   ├── file.controller.js        ✅
│   │   ├── ai.controller.js          ✅
│   │   ├── dependency.controller.js  🔄
│   │   ├── chat.controller.js        🔄
│   │   ├── security.controller.js    🔄
│   │   ├── commit.controller.js      🔄
│   │   ├── team.controller.js        🔄
│   │   ├── subscription.controller.js 🔄
│   │   └── notification.controller.js 🔄
│   ├── models/
│   │   ├── auth.model.js             ✅
│   │   ├── repo.model.js             ✅
│   │   ├── analysis.model.js         ✅
│   │   ├── file.model.js             ✅
│   │   ├── AIRequest.model.js        ✅
│   │   └── dependency.model.js       🔄
│   ├── routes/
│   ├── middleware/
│   └── index.js
└── frontend/                         🔄
```

---

## ⚙️ Environment Variables

```env
# Server
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# Email (OTP)
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

# GitHub
GITHUB_TOKEN=your_github_token

# AI
GEMINI_API_KEY=your_gemini_api_key

# Vector DB
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
```

---

## 🏃 Getting Started

```bash
# Clone the repo
git clone https://github.com/harshit-oli/repowise.git

# Install backend dependencies
cd backend
npm install

# Add .env file (see above)

# Start backend
npm run dev
```

---

## 📊 API Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verifyRegisterOtp` | Verify OTP |
| POST | `/api/repo/add` | Add GitHub repo |
| GET | `/api/repo/getRepos` | Get all repos |
| POST | `/api/analysis/start/:repoId` | Start AI analysis |
| GET | `/api/analysis/get/:repoId` | Get analysis result |
| POST | `/api/file/generateSummaries/:repoId` | Generate file summaries |
| POST | `/api/file/generateEmbeddings/:repoId` | Generate vector embeddings |
| GET | `/api/file/search/:repoId` | Search files |
| GET | `/api/ai/logs` | Get AI request logs |
| GET | `/api/ai/usage` | Get usage & credits |

---

## 🎯 Why RepoWise AI?

| Problem | Solution |
|---------|----------|
| New developer joins a team → spends weeks understanding codebase | RepoWise explains it in minutes |
| Open source contribution → hard to find where to start | File summaries + dependency graph shows the structure |
| Code review → hard to understand unfamiliar code | AI explains any file instantly |
| Security audit → manual and time-consuming | Automated AI security scan |

---

## 🔮 Roadmap

- [x] Authentication system
- [x] GitHub repo integration
- [x] AI-powered analysis
- [x] File summaries + embeddings
- [ ] RAG-powered chat
- [ ] Dependency graph visualization
- [ ] Security vulnerability scanner
- [ ] Commit history analysis
- [ ] Team collaboration
- [ ] Stripe subscription
- [ ] Frontend (React)
- [ ] Deploy to production

---

## 👨‍💻 Built By

**Harshit** — Building RepoWise AI solo as a full-stack AI project.

> *"Maine ye project isliye banaya kyunki main khud naye codebases samajhne mein bahut time waste karta tha."*

---

## 📄 License

MIT License — feel free to use and contribute!
