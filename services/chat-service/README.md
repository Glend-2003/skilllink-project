# Chat Service

This microservice handles real-time chat functionality for the SkillLink platform. It manages conversations, messages, and WebSocket connections using Socket.IO. It is built using Node.js and Express.

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Real-time Communication:** Socket.IO
- **Database:** MySQL (with mysql2)
- **Other:** CORS, dotenv

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (version 14 or higher)
- npm or yarn
- MySQL Server

### 2. Installation & Restore
Navigate to the project directory and install the dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory with the following variables:
```
PORT=3002
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=skilllink_db
```

### 4. Database Setup
Ensure your MySQL database is running and the `skilllink_db` database exists. The service will automatically create the necessary tables (`messages`, `conversations`, `users`).

### 5. Run the Application
Start the chat service:
```bash
npm start
```

The service will run on `http://localhost:3002` by default.

## API Endpoints
- WebSocket events:
  - `join_chat`: Join a conversation
  - `send_message`: Send a message
  - `receive_message`: Receive messages in real-time
  - `previous_messages`: Load conversation history

## Testing
Use the provided `test-chat.js` script to test the chat functionality:
```bash
node test-chat.js
```