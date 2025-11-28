# Jansunwai Indore - AI-Powered Public Grievance Redressal System

A comprehensive digital platform designed to streamline and strengthen the Jansunwai (Public Grievance Redressal) mechanism for Indore Smart City. This system leverages cutting-edge AI technology to automate complaint routing, provide intelligent insights, and ensure efficient resolution of citizen grievances.

## 📋 Problem Statement

Indore has consistently led urban transformation efforts through digital governance and citizen engagement. One of the key pillars of participatory governance is Jansunwai, a platform for addressing citizen grievances and ensuring responsive administration. However, as the volume and complexity of urban services grow, the current Jansunwai system faces several procedural bottlenecks that hinder effective grievance resolution and timely feedback.

### Key Challenges

The current system faces the following challenges:

- **Misrouting of complaints** and manual escalation delays
- **No SLA-based tracking** or real-time monitoring by departments
- **Lack of integrated dashboard** for grievance lifecycle management
- **Weak feedback loop** from citizens post-resolution
- **Inadequate analytics** for pattern recognition and root-cause analysis
- **Limited accessibility**, especially for non-tech-savvy users
- **Poor integration** with existing municipal platforms

## 🎯 Solution Overview

Jansunwai Indore provides a scalable, user-friendly, and data-driven solution with the following capabilities:

- **AI-based complaint routing** for accurate department assignment
- **SLA enforcement** and real-time status tracking
- **Multilingual interfaces** (English/Hindi) for broader accessibility
- **Predictive analytics** and intelligent insights
- **Comprehensive dashboards** for all stakeholders
- **Platform integration** ready architecture

## ✨ Key Features

### 🤖 AI-Powered Capabilities

1. **Intelligent Complaint Routing**
   - Automatic analysis and categorization of complaints
   - Smart department assignment based on complaint content
   - Multi-provider AI support (OpenAI, Groq, Anthropic, Gemini, DeepInfra)
   - Language detection and processing

2. **AI-Powered Complaint Analysis**
   - Automatic title generation
   - Content validation and detail sufficiency checks
   - Urgency scoring (Low, Medium, High, Critical)
   - Intelligent suggestions for improvement

3. **Document & Media AI Analysis**
   - Automatic analysis of uploaded images, videos, and documents
   - Intelligent extraction of relevant information
   - Smart summaries for faster processing
   - Relevance checking for attachments

4. **Voice-to-Text Input**
   - Speech recognition for complaint submission
   - Support for Indian English (en-IN)
   - Real-time transcription with interim results
   - Accessibility enhancement for all users

5. **AI Assistant**
   - 24/7 chatbot for complaint drafting assistance
   - Multi-language support
   - Real-time guidance and support

6. **Predictive Analytics & Insights**
   - AI-driven dashboard insights
   - Pattern recognition and trend analysis
   - Department workload optimization
   - Root-cause analysis

### 👥 User Management

- **Multi-User Authentication System**
  - Citizen accounts (local + Google OAuth)
  - Department member accounts
  - Superadmin accounts
  - Session management with localStorage and cookies

- **Role-Based Access Control**
  - Separate dashboards for each user type
  - Protected routes and API endpoints
  - Secure authentication flows

### 📊 Dashboard & Analytics

1. **Citizen Dashboard**
   - Query creation and management
   - Real-time status tracking
   - Conversation threads with departments
   - Feedback submission
   - Map-based location selection

2. **Department Dashboard**
   - Query assignment and management
   - Status updates (Open → In Progress → Resolved)
   - Real-time statistics (Total, Open, In Progress, Resolved)
   - Search and filter capabilities
   - AI-generated summaries

3. **Superadmin Dashboard**
   - System-wide analytics
   - User and department management
   - Comprehensive reporting
   - AI-powered insights
   - Performance metrics

### 🌍 Accessibility Features

- **Multilingual Support**
  - English and Hindi interfaces
  - Dynamic language switching
  - Context-aware translations

- **Voice Input**
  - Speech-to-text for complaint submission
  - Browser-based Web Speech API

- **Mobile Responsive Design**
  - Optimized for all device sizes
  - Touch-friendly interface

### 📍 Location Services

- **Interactive Map Integration**
  - Leaflet.js map integration
  - Precise location selection
  - Address geocoding
  - Visual location representation

### 💬 Communication Features

- **Real-time Conversation Threads**
  - Threaded conversations between citizens and departments
  - Status-based conversation control
  - Message history tracking

- **Feedback System**
  - Post-resolution feedback collection
  - Rating system (1-5 stars)
  - Feedback analytics
  - AI-powered feedback insights

### 📎 File Management

- **Multi-file Attachments**
  - Support for images, videos, and documents
  - AI-powered analysis of attachments
  - Relevance checking
  - Secure file storage

### 🔍 Search & Filter

- **Advanced Search**
  - Full-text search across queries
  - Status filtering
  - Date range filtering
  - Department filtering
  - Urgency-based sorting

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.5.2 (App Router)
- **UI Library**: React 19.1.1
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Maps**: Leaflet.js & React Leaflet

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM

### AI & ML
- **LLM Providers**: 
  - OpenAI (GPT-4o-mini)
  - Groq (Llama 3.3 70B)
  - Anthropic (Claude 3.5 Sonnet)
  - Google Gemini
  - DeepInfra
- **Speech Recognition**: Web Speech API (webkitSpeechRecognition)

### Authentication
- **Local Auth**: Email/Password
- **OAuth**: Google OAuth 2.0
- **Session Management**: JWT tokens, localStorage, Cookies

### Other Libraries
- **Image Processing**: exifr
- **Markdown**: react-markdown
- **Environment**: dotenv

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database (local or cloud)
- API keys for AI providers (at least one):
  - OpenAI API key (optional)
  - Groq API key (optional)
  - Anthropic API key (optional)
  - Google Gemini API key (optional)
  - DeepInfra API key (optional)
- Google OAuth credentials (optional, for Google login)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd jansunwai-indore
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
MONGOURL=mongodb://localhost:27017/jansunwai
# or for MongoDB Atlas
# MONGOURL=mongodb+srv://username:password@cluster.mongodb.net/jansunwai

# AI Provider (choose at least one)
GROQ_API_KEY=your_groq_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here
# DEEPINFRA_API_KEY=your_deepinfra_api_key_here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 4: Database Setup

Ensure MongoDB is running. The application will automatically create collections when needed. You can optionally seed the database with initial data:

```bash
node seed.js
```

### Step 5: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Step 6: Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
jansunwai-indore/
├── app/
│   ├── about/                 # About page
│   ├── api/                   # API routes
│   │   ├── ai-assistant/      # AI chat assistant
│   │   ├── attachments/       # File upload and analysis
│   │   ├── auth/              # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── google/        # Google OAuth
│   │   │   └── department-login/
│   │   ├── conversations/     # Message threads
│   │   ├── dashboard-analysis/ # Analytics AI
│   │   ├── departments/       # Department management
│   │   ├── queries/           # Complaint management
│   │   ├── query-analysis/    # AI complaint routing
│   │   ├── superadmin/        # Admin routes
│   │   └── lib/               # Shared utilities
│   │       ├── ai/            # AI helper functions
│   │       ├── dbConnect.js   # Database connection
│   │       └── googleAuth.js  # OAuth utilities
│   ├── components/            # Reusable components
│   │   ├── FeedbackForm.js
│   │   ├── FeedbackDisplay.js
│   │   ├── Footer.js
│   │   ├── Map.js
│   │   └── Navbar.js
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.js     # Authentication state
│   │   └── LanguageContext.js # i18n support
│   ├── dashboard/             # Citizen dashboard
│   │   ├── components/
│   │   │   └── AttachmentAI.js
│   │   ├── MapAddressSelector.js
│   │   └── page.js
│   ├── department/            # Department dashboard
│   │   ├── dashboard/
│   │   └── login/
│   ├── superadmin/            # Superadmin dashboard
│   │   ├── login/
│   │   └── page.js
│   ├── login/                 # Login/Register page
│   ├── layout.js              # Root layout
│   ├── page.js                # Landing page
│   └── globals.css            # Global styles
├── models/                    # Mongoose models
│   └── index.js
├── public/                    # Static assets
│   └── upload/                # Uploaded files
├── package.json
├── next.config.mjs
├── README.md
└── .env.local                 # Environment variables (create this)
```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/login` - Citizen login
- `POST /api/auth/register` - Citizen registration
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/department-login` - Department member login
- `POST /api/superadmin/login` - Superadmin login

### Queries (Complaints)

- `GET /api/queries` - Get all queries (with filters)
- `POST /api/queries` - Create new query
- `GET /api/queries/[id]` - Get specific query
- `PUT /api/queries/[id]/status` - Update query status
- `POST /api/queries/[id]/conversations` - Add message to thread
- `POST /api/queries/[id]/feedback` - Submit feedback
- `GET /api/queries/top-urgent` - Get urgent queries

### Query Analysis

- `POST /api/query-analysis` - AI-powered complaint analysis and routing

### Attachments

- `POST /api/attachments/analyze` - Analyze uploaded files with AI
- `POST /api/attachments/check-relevance` - Check attachment relevance

### Analytics

- `POST /api/dashboard-analysis` - Generate AI insights for dashboards

### Users & Departments

- `GET /api/users` - Get all users
- `GET /api/users/[id]` - Get specific user
- `GET /api/departments` - Get all departments
- `GET /api/departments/[id]/queries` - Get department queries

## 🎮 Usage Guide

### For Citizens

1. **Registration/Login**
   - Register with email/password or use Google OAuth
   - Access your personalized dashboard

2. **Submit a Complaint**
   - Click "New Query"
   - Describe your issue (text or voice input)
   - Add location using map selector
   - Upload photos/videos/documents (optional)
   - AI will analyze and suggest the appropriate department
   - Review and submit

3. **Track Progress**
   - View all your queries in the dashboard
   - See real-time status updates
   - Communicate with departments via message threads
   - Submit feedback after resolution

### For Department Members

1. **Login**
   - Use department credentials to access dashboard

2. **Manage Queries**
   - View assigned queries
   - Filter by status (Open, In Progress, Resolved)
   - Use search to find specific queries
   - Review AI-generated summaries

3. **Respond to Complaints**
   - Open query details
   - Review complaint and attachments
   - Update status as work progresses
   - Communicate with citizens via threads
   - Mark as resolved when complete

### For Superadmins

1. **Access Admin Dashboard**
   - Login with superadmin credentials
   - View system-wide analytics

2. **Monitor Performance**
   - Track resolution rates
   - Analyze department workloads
   - Review AI-generated insights
   - Export reports

3. **Manage System**
   - View all users and queries
   - Monitor system health
   - Generate comprehensive reports

## 🔒 Security Features

- Password authentication (with plans for hashing)
- JWT token-based sessions
- OAuth 2.0 integration
- Protected API routes
- Input validation
- File upload security
- CORS configuration

## 🌐 Multilingual Support

The platform supports English and Hindi. Users can switch languages at any time using the language selector in the navigation bar. All UI elements, messages, and content are translated dynamically.

## 📈 Future Enhancements

- SLA-based tracking and automated escalations
- SMS/Email notifications
- Mobile app (iOS/Android)
- Integration with existing municipal systems
- Advanced analytics and reporting
- API for third-party integrations
- Password hashing implementation
- Rate limiting and security hardening

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is developed for Indore Smart City. Please contact the project maintainers for licensing information.

## 👥 Support

For support and queries, please contact the development team or open an issue in the repository.

## 🙏 Acknowledgments

- Indore Smart City for the problem statement and requirements
- All AI providers for their services
- Open-source community for amazing tools and libraries

---

**Built with ❤️ for Indore Smart City**
