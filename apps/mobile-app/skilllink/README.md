# SkillLink Mobile Application

A React Native mobile application built with Expo for connecting service providers with clients.

## Prerequisites

Before running the application, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **Docker Desktop**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Ensure Docker is running before starting the application

3. **Expo Go App** (on your mobile device)
   - **iOS**: Download from the App Store
   - **Android**: Download from Google Play Store

## Installation and Setup

### Step 1: Navigate to the Mobile App Directory

```bash
cd /Users/macbookpro/Desktop/Aplicaciones\ Globales/SkillLinkApp/skilllink-project/apps/mobile-app/skilllink
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install Expo and all required dependencies for the mobile application.

### Step 3: Start Backend Services

Ensure Docker Desktop is running, then start the backend services:

```bash
cd ../../../
docker-compose up -d
```

Verify that all services are running:

```bash
docker-compose ps
```

### Step 4: Return to Mobile App Directory

```bash
cd apps/mobile-app/skilllink
```

## Running the Application

### Step 1: Start Expo Development Server

```bash
npx expo start -c
```

The `-c` flag clears the cache to ensure a fresh start.

### Step 2: Open with Expo Go

Once the development server starts, you'll see a QR code in the terminal.

1. **Press `s`** in the terminal to switch to Expo Go mode
2. **Open your phone's camera app**
3. **Scan the QR code** displayed in the terminal
4. **Tap the notification** that appears on your phone
5. **Select "Open with Expo Go"**

The application will load on your mobile device.

## Quick Start Summary

```bash
# 1. Navigate to mobile app folder
cd apps/mobile-app/skilllink

# 2. Install dependencies (first time only)
npm install

# 3. Ensure Docker is running (in project root)
docker-compose up -d

# 4. Start Expo (in mobile app folder)
npx expo start -c

# 5. Press 's' for Expo Go
# 6. Scan QR code with phone camera
# 7. Open with Expo Go app
```

## Troubleshooting

### Issue: Cannot connect to backend services

**Solution:**
- Verify Docker containers are running: `docker-compose ps`
- Ensure all services are healthy
- Restart services if needed: `docker-compose restart`

### Issue: Expo server won't start

**Solution:**
```bash
# Clear Metro bundler cache
npx expo start -c

# Or clear all caches
rm -rf node_modules
npm install
npx expo start -c
```

### Issue: QR code doesn't work

**Solution:**
- Press `s` to switch to Expo Go mode
- Ensure your phone and computer are on the same WiFi network
- Try using the connection option in the Expo Go app manually

### Issue: App crashes on load

**Solution:**
- Verify all backend services are running
- Check that Docker containers are healthy
- Clear Expo cache: `npx expo start -c`

## Available Commands

- `npm start` - Start Expo development server
- `npx expo start -c` - Start with cache clearing (recommended)
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator (macOS only)

## Project Structure

```
skilllink/
├── app/              # Application screens (Expo Router)
├── assets/           # Images and static files
├── components/       # Reusable components
├── constants/        # Configuration constants
├── app.json          # Expo configuration
└── package.json      # Dependencies
```

## Requirements Summary

- ✅ Node.js (v18+)
- ✅ Docker Desktop (running)
- ✅ Expo Go app (on mobile device)
- ✅ Same WiFi network (phone and computer)

## Support

For issues or questions, please refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

---

**Version:** 1.0.0  
**Last Updated:** February 2026
