# SkillLink - Web Client

SkillLink is a web platform for professional services that connects clients with specialized service providers. The web client is the user interface responsible for:

- **Authentication and registration** of users (clients and providers)
- **Search and discovery** of professional services
- **Display provider profiles** with work galleries
- **Review system** and ratings with reviewer email and profile photo
- **Real-time chat** between clients and providers
- **Service requests** personalized
- **Order and request management** of services
- **Admin panel** to manage services and users

### Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router Dom v7
- **UI Components**: Radix UI + Custom Components
- **Styling**: Tailwind CSS
- **Real-time Communication**: Socket.io
- **HTTP Client**: Native Fetch API
- **Notifications**: Sonner
- **Icons**: Lucide React

---

## 🚀 Installation and Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- Backend **services must be running** (see Services section)

### Step 1: Install Dependencies

```bash
cd apps/web-client
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root of the `apps/web-client/` project:

```env
# Server configuration
VITE_SERVER_IP=localhost

# If using a remote server, change localhost to your IP/domain:
# VITE_SERVER_IP=192.168.1.100
# VITE_SERVER_IP=api.skilllink.com
```

**Note**: Service ports are hardcoded in `src/constants/Config.ts`:
- API Gateway: `3000`
- User Service: `3001`
- Service Manager: `3002`
- Provider Service: `3003`
- Chat Service: `3004`
- Notification Service: `3006`

### Step 3: Required Services Structure

Make sure the following backend services are running:

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 3000 | Entry point for all services |
| User Service | 3001 | User management |
| Service Manager | 3002 | Service management |
| Provider Service | 3003 | Provider management |
| Chat Service | 3004 | Real-time messaging |
| Notification Service | 3006 | System notifications |
| Database | (SQL Server) | Main database |

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Compiled files will be saved in `dist/`

### Preview Production Build

```bash
npm run preview
```

### Linting and Validation

```bash
npm run lint
```

---

## 📁 Project Structure

```
src/
├── views/                      # Main pages
│   ├── Home.tsx               # Home page - service search
│   ├── login.tsx              # Login form
│   ├── register.tsx           # Registration form
│   ├── profile/               # User profile management
│   ├── provider/              # Provider details and gallery
│   ├── chat.tsx               # Real-time chat view
│   ├── my-requests.tsx        # User service requests
│   ├── search.tsx             # Advanced service search
│   ├── request-service.tsx    # Service request form
│   ├── review/                # Review system
│   ├── admin/                 # Admin panel
│   └── edit-client-profile.tsx # Client profile editing
│
├── components/                 # Reusable components
│   ├── ServiceGalleryView.tsx # Service image gallery
│   ├── ReviewItem.tsx         # Review display component
│   ├── ChatComponent.tsx      # Chat interface
│   └── [other components]
│
├── ui/                         # Basic UI components (shadcn/ui)
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── tabs.tsx
│   └── [other components]
│
├── context/                    # Context API for global state
│   └── AuthContext.tsx        # Authentication context
│
├── hooks/                      # Custom hooks
│   ├── useAuth.ts
│   └── [other hooks]
│
├── constants/                  # Global constants
│   └── Config.ts              # Service URLs configuration
│
├── utils/                      # Utility functions
│   ├── confirmToast.ts        # Visual confirmations
│   └── [other utilities]
│
├── App.tsx                     # Root component
├── main.tsx                    # Entry point
└── index.css / App.css        # Global styles
```

---

## 🔧 Additional Configuration

### Change Server URL (Open Field)

If you need to connect to a remote server instead of localhost, edit the `src/constants/Config.ts` file:

```typescript
// Option 1: Use environment variable
const SERVER_IP = import.meta.env.VITE_SERVER_IP || 'localhost';

// Option 2: Hardcode for development
// const SERVER_IP = '192.168.1.100'; // Your local IP
// const SERVER_IP = 'api.skilllink.com'; // Your remote domain
```

Or set the environment variable:

```bash
VITE_SERVER_IP=your-ip-or-domain npm run dev
```

### Real-time Chat Configuration

Chat uses Socket.io. Make sure the Chat Service is running on port 3004:

```typescript
// src/constants/Config.ts
CHAT_SERVICE_URL: `http://${SERVER_IP}:3004`
```

---

## 🔐 Authentication Flow

1. **Registration**: New user registers with email and password
2. **Login**: Credentials are sent to Auth Service (port 3000)
3. **JWT Token**: Received and stored in localStorage
4. **Authorization**: Token is included in headers of subsequent requests
5. **Logout**: Token is removed from localStorage

```typescript
// Tokens are automatically stored in:
localStorage.setItem('token', jwtToken);
localStorage.setItem('user', JSON.stringify(userData));
```

---

## 📡 Main Endpoints Used

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - New user registration

### Services
- `GET /api/v1/services` - Get all services
- `GET /api/v1/services/{id}` - Get service details
- `GET /api/v1/providers/{id}/services` - Get provider's services
- `POST /api/v1/services` - Create new service

### Providers
- `GET /api/v1/providers` - List all providers
- `GET /api/v1/providers/{id}` - Get provider details
- `GET /api/v1/providers/{id}/services` - Get provider's services
- `GET /api/v1/providers/{id}/reviews` - Get provider reviews

### Users
- `GET /api/v1/users/{id}` - Get user data
- `PUT /api/v1/users/{id}` - Update user
- `GET /api/v1/users/{id}/profile` - Get user profile

### Reviews
- `GET /api/v1/reviews` - Get all reviews
- `POST /api/v1/reviews` - Create new review
- `GET /api/v1/providers/{id}/reviews` - Get provider reviews

### Gallery
- `GET /api/v1/gallery/service/{serviceId}` - Get service images
- `POST /api/v1/gallery` - Upload image
- `DELETE /api/v1/gallery/{galleryId}` - Delete image

---

## 🐛 Common Troubleshooting

### Problem: "Cannot find module" or import errors

**Solution**: Make sure all services are installed and paths in `tsconfig.json` are correct.

```bash
npm install
npm run lint --fix
```

### Problem: Services not loading / "Network error"

**Check**:
1. Is the API Gateway running on port 3000?
2. Is the `VITE_SERVER_IP` variable configured correctly?
3. Is CORS enabled on backend services?

```bash
# Check connectivity
curl http://localhost:3000/api/v1/health
```

### Problem: Gallery images not loading

**Check**:
1. URLs come from Cloudinary
2. The `/api/v1/gallery/service/{serviceId}` endpoint returns valid data
3. CORS are configured correctly

### Problem: Chat not connecting

**Check**:
1. Socket.io server is running on port 3004
2. `CHAT_SERVICE_URL` is correct in Config.ts
3. No CORS conflicts

---

## 📊 Features by View

### 🏠 Home.tsx
- Service search with filters
- Service grid listing
- Navigation to provider details

### 🔍 Search.tsx
- Advanced search with multiple filters
- Filter by category, price, rating
- Result sorting

### 👤 Profile.tsx
- Active user profile view
- Service requests made
- Transaction history

### 🏢 Provider Detail (`provider/ProviderDetail.tsx`)
- Detailed provider information
- **Tabs**:
  - **Services**: List of offered services
  - **Reviews**: Ratings and comments with reviewer photo
  - **Gallery**: Images of completed work
  - **About**: Description and contact

### 💬 Chat.tsx
- Real-time messaging with Socket.io
- Conversation history
- New message notifications

### ⭐ Review System
- Review display with `ReviewItem.tsx` component
- Shows reviewer email and profile photo
- Star rating
- Review date

### 📋 My Requests
- Service requests created by user
- Request status
- Conversation history

### ⚙️ Admin Panel
- User management
- Service management
- Content approval

---

## 🎨 Styling System

The project uses **Tailwind CSS** with custom configuration:

```
tailwind.config.js       # Theme and color configuration
postcss.config.js        # Post-processing pipeline
src/index.css           # Global styles
src/App.css             # App-specific styles
```

### Main Colors:
- **Primary**: Blue (used in buttons and accents)
- **Secondary**: Gray (neutral backgrounds)
- **Success**: Green (successful actions)
- **Warning**: Amber (warnings)
- **Error**: Red (errors)

---

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build
npm run build            # Compile TypeScript and generate build
npm run preview          # Preview build locally

# Code Quality
npm run lint             # Run ESLint to validate code
npm run lint --fix       # Automatically fix linting issues
```

---

## 🌐 Available Environment Variables

```env
# Server configuration
VITE_SERVER_IP=localhost        # IP or domain of backend server

# Examples:
# VITE_SERVER_IP=192.168.1.100  # Local IP
# VITE_SERVER_IP=api.skilllink.com  # Remote domain
```

---

## 🔄 Service Request Flow

1. User searches for service on Home
2. Views details on Provider Detail
3. Clicks "Request service"
4. Completes request form
5. System notifies provider via email and real-time
6. Provider accepts/rejects request
7. If accepted, chat channel opens
8. Upon completion, user can leave review

---

## 🚀 Deployment

### For production:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Serve static files** (dist/) with a web server:
   - Nginx
   - Apache
   - Vercel
   - Netlify
   - Any static hosting

3. **Configure environment variables for production**:
   ```env
   VITE_SERVER_IP=api.skilllink.com
   ```

4. **Rebuild with production environment variables**:
   ```bash
   VITE_SERVER_IP=api.skilllink.com npm run build
   ```

---

## 📞 Support

For issues or questions:
1. Check browser console (F12) for errors
2. Review backend service logs
3. Ensure all services are running
4. Clear browser cache and localStorage if needed

---

## 📝 Development Notes

- Project is configured with **TypeScript strict mode**
- Uses **ESLint** to maintain code quality
- Components follow **React Hooks** patterns
- **Error handling** is implemented in all API calls
- Review data loads asynchronously to avoid blocking
- Profile images are fetched from the user API using the `reviewerId`

---

**Last Updated**: February 2026  
**Version**: 0.0.0 (In Development)
