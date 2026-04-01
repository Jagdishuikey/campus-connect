<![CDATA[<div align="center">

# 🎓 Campus Connect

**A full-stack social platform built for college students to connect, collaborate, and thrive on campus.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

[Live Demo](https://campus-connect-kohl.vercel.app) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Real-Time Features](#-real-time-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 About the Project

**Campus Connect** is a comprehensive campus networking platform that brings together students from the same college or university. It combines social networking, event management, group collaboration, and real-time messaging—all in one place. Whether you need to find PG accommodations near campus, report a lost item, or just share updates with classmates, Campus Connect has you covered.

---

## ✨ Features

### 🏠 Dashboard & Social Feed
- Create text and image posts with Cloudinary-powered media uploads
- Like and interact with posts from other students
- Real-time feed updates with newest-first ordering

### 💬 Connections & Real-Time Chat
- Discover and search for other campus users
- Send and manage connection requests (pending / accepted / rejected)
- **Real-time messaging** with Socket.IO — instant delivery, typing indicators, and online status
- Image sharing within conversations
- Toast notifications for incoming messages

### 📅 Events
- Create, edit, and delete campus events
- Browse all upcoming events with details
- RSVP / subscribe to events

### 👥 Groups & Clubs
- Create and manage campus groups or clubs
- Join and leave groups
- Group member management

### 🔍 Lost & Found
- Report lost or found items with images and descriptions
- Browse and filter reported items
- Mark items as resolved
- Image uploads via Cloudinary

### 🏘️ PG & Hostel Finder
- Interactive **map view** powered by React Leaflet
- Browse PGs, hostels, and flats near campus
- Filter by type (PG / Hostel / Flat), gender, and amenities
- Geolocation-based discovery — automatically detects your location
- Property details including price, rating, contact info, and amenities

### 👤 User Profiles
- Editable profile with name, bio, college, phone, and profile picture
- Cloudinary-hosted profile images
- View other users' profiles

### 🎨 UI/UX
- Dark/light theme toggle with context-based theming
- Responsive, modern design
- Toast notifications for actions and real-time events

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Redux Toolkit** | Global state management (auth, UI) |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **React Leaflet** | Interactive maps for PG/Hostel finder |
| **Socket.IO Client** | Real-time communication |
| **React Hot Toast** | Notification toasts |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose 9** | Database & ODM |
| **Socket.IO 4** | WebSocket server for real-time features |
| **JWT (jsonwebtoken)** | Authentication & authorization |
| **bcryptjs** | Password hashing |
| **Cloudinary** | Image storage & CDN |
| **Multer** | Multipart file upload handling |

---

## 🏗️ Architecture

```
┌────────────────────────┐       ┌────────────────────────┐
│     React Frontend     │       │    Express Backend      │
│  (Vite + Redux + S.IO) │◄─────►│  (REST API + Socket.IO)│
│   Vercel (Frontend)    │       │   Vercel (Backend)      │
└────────────────────────┘       └────────┬───────────────┘
                                          │
                                 ┌────────▼───────────────┐
                                 │   MongoDB Atlas         │
                                 │   (Database)            │
                                 └────────┬───────────────┘
                                          │
                                 ┌────────▼───────────────┐
                                 │   Cloudinary CDN        │
                                 │   (Image Storage)       │
                                 └────────────────────────┘
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Cloudinary** account ([free tier](https://cloudinary.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jagdishuikey/campus-connect.git
   cd campus-connect
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend/campus
   npm install
   ```

4. **Set up environment variables** — see [Environment Variables](#-environment-variables)

5. **Run the backend**
   ```bash
   cd backend
   npm run dev
   ```

6. **Run the frontend** (in a separate terminal)
   ```bash
   cd frontend/campus
   npm run dev
   ```

7. **Open in browser** — navigate to `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# MongoDB Connection String
MONGOURI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbName>

# Server
PORT=3000

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client URL (for CORS)
CLIENT_URL=https://your-frontend-url.vercel.app
```

### Frontend (`frontend/campus/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 📁 Project Structure

```
campus-connect/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js     # Signup, login, profile update
│   │   ├── postController.js     # CRUD posts, likes
│   │   ├── eventController.js    # CRUD events
│   │   ├── groupController.js    # CRUD groups, join/leave
│   │   ├── connectionController.js # Connections, messaging
│   │   ├── lostFoundController.js  # Lost & Found CRUD
│   │   └── pgController.js      # PG/Hostel listings
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── upload.js             # Multer file upload
│   ├── models/
│   │   ├── UserModel.js          # User schema
│   │   ├── PostModel.js          # Post schema
│   │   ├── EventModel.js         # Event schema
│   │   ├── GroupModel.js         # Group schema
│   │   ├── ConnectionModel.js    # Connection schema
│   │   ├── MessageModel.js       # Message schema
│   │   ├── LostAndFoundModel.js  # Lost & Found schema
│   │   └── PGModel.js            # PG/Hostel schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── connectionRoutes.js
│   │   ├── lostFoundRoutes.js
│   │   └── pgRoutes.js
│   ├── seed.js                   # Database seeder
│   ├── seedPGs.js                # PG/Hostel seeder
│   ├── server.js                 # Entry point + Socket.IO setup
│   └── package.json
│
├── frontend/
│   └── campus/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Auth.jsx          # Auth wrapper (login/signup toggle)
│       │   │   ├── Login.jsx         # Login form
│       │   │   ├── Signup.jsx        # Signup form
│       │   │   ├── Dashboard.jsx     # Main dashboard with nav + feed
│       │   │   ├── Activity.jsx      # Activity/post feed
│       │   │   ├── ClubCard.jsx      # Group/club card display
│       │   │   ├── ClubForm.jsx      # Group creation form
│       │   │   ├── EventCard.jsx     # Event card display
│       │   │   ├── EventForm.jsx     # Event creation form
│       │   │   ├── Poll.jsx          # Poll component
│       │   │   ├── ThemeContext.jsx   # Theme provider (dark/light)
│       │   │   └── ThemeToggle.jsx   # Theme toggle button
│       │   ├── pages/
│       │   │   ├── Connection.jsx    # Connections & chat page
│       │   │   ├── Events.jsx        # Events listing page
│       │   │   ├── Groups.jsx        # Groups listing page
│       │   │   ├── LostFound.jsx     # Lost & Found page
│       │   │   ├── Hostels.jsx       # PG/Hostel map page
│       │   │   └── ProfilePage.jsx   # User profile page
│       │   ├── services/
│       │   │   ├── api.js            # API service layer
│       │   │   └── socket.js         # Socket.IO client
│       │   ├── store/
│       │   │   ├── store.js          # Redux store config
│       │   │   ├── authSlice.js      # Auth state slice
│       │   │   └── uiSlice.js        # UI state slice (navigation)
│       │   ├── App.jsx               # Root component + routing
│       │   ├── App.css               # Global styles
│       │   └── main.jsx              # Vite entry point
│       └── package.json
│
├── .gitignore
└── README.md
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login with email & password |
| `POST` | `/api/auth/verify` | Verify JWT token |
| `POST` | `/api/auth/logout` | Logout |
| `PUT`  | `/api/auth/profile` | Update profile (name, bio, college, phone, image) |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts` | Get all posts |
| `POST` | `/api/posts` | Create a post (text + optional image) |
| `DELETE` | `/api/posts/:id` | Delete a post |
| `PUT` | `/api/posts/:id/like` | Like / unlike a post |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | Get all events |
| `POST` | `/api/events` | Create an event |
| `PUT` | `/api/events/:id` | Update an event |
| `DELETE` | `/api/events/:id` | Delete an event |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/groups` | Get all groups |
| `POST` | `/api/groups` | Create a group |
| `PUT` | `/api/groups/:id` | Update a group |
| `DELETE` | `/api/groups/:id` | Delete a group |
| `POST` | `/api/groups/:id/join` | Join a group |
| `POST` | `/api/groups/:id/leave` | Leave a group |

### Connections & Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/connections` | Get all connections |
| `GET` | `/api/connections/users?search=` | Search users |
| `POST` | `/api/connections` | Send connection request |
| `PUT` | `/api/connections/:id` | Accept / reject connection |
| `POST` | `/api/connections/messages` | Send a message (text + optional image) |
| `GET` | `/api/connections/messages/:userId` | Get message history |

### Lost & Found
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/lostfound` | Get all items |
| `POST` | `/api/lostfound` | Report a lost/found item |
| `PUT` | `/api/lostfound/:id` | Update an item |
| `DELETE` | `/api/lostfound/:id` | Delete an item |

### PG / Hostels
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/pgs` | Get all PG/Hostel listings |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health status |

---

## ⚡ Real-Time Features

Campus Connect uses **Socket.IO** for the following real-time capabilities:

| Event | Direction | Description |
|-------|-----------|-------------|
| `register` | Client → Server | Register user identity on connect |
| `send_message` | Client → Server | Send a direct message |
| `receive_message` | Server → Client | Receive a direct message |
| `typing` | Client → Server | Notify typing started |
| `user_typing` | Server → Client | Receive typing indicator |
| `stop_typing` | Client → Server | Notify typing stopped |
| `user_stop_typing` | Server → Client | Receive stop typing indicator |
| `connection_request` | Client → Server | Send connection request notification |
| `new_connection_request` | Server → Client | Receive connection request |
| `user_online` | Server → All | Broadcast user came online |
| `user_offline` | Server → All | Broadcast user went offline |

---

## 🚀 Deployment

The project is configured for deployment on **Vercel**:

- **Frontend**: Deploy the `frontend/campus` directory as a Vite project
- **Backend**: Deploy the `backend` directory as a serverless/Node.js project

### Quick Deploy

1. Push your code to GitHub
2. Import both `backend` and `frontend/campus` as separate Vercel projects
3. Set environment variables in Vercel dashboard
4. Update `CLIENT_URL` in backend to match your frontend's Vercel URL
5. Update `VITE_API_BASE_URL` in frontend to match your backend's Vercel URL

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ for campus communities everywhere**

⭐ Star this repo if you found it useful!

</div>
]]>
