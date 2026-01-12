# Wedflow - Wedding Planning App

## Overview

Wedflow is a comprehensive wedding planning mobile application designed for Scandinavian couples. Built with Expo/React Native for cross-platform mobile and web support, it helps couples organize their wedding day by managing schedules, guests, table seating, speeches, budgets, and vendor coordination.

The app follows a "Dark Elegance" design aesthetic with rich black backgrounds (#1A1A1A) and antique gold accents (#C9A962), creating a sophisticated, premium feel appropriate for wedding planning.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Expo SDK 54 with React Native 0.81.5 (New Architecture enabled)
- **Navigation**: React Navigation v7 with nested stack and tab navigators
  - Root Stack Navigator → Main Tab Navigator → Feature Stack Navigators (Planning, Inspiration, Guests, Profile)
- **State Management**: TanStack React Query for server state, React useState for local state
- **Animations**: React Native Reanimated for smooth, performant animations
- **Styling**: StyleSheet API with centralized theme constants (Colors, Spacing, Typography, BorderRadius)

### Data Layer
- **Local Storage**: AsyncStorage for client-side persistence of wedding data, guests, schedules, budgets
- **Schema Definition**: Drizzle ORM with PostgreSQL dialect (schema in `shared/schema.ts`)
- **Validation**: Zod schemas generated from Drizzle schema using drizzle-zod

### Backend Architecture
- **Server**: Express.js with TypeScript (runs via tsx in development)
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Current Endpoints**: Weather API proxy to YR.no (Norwegian Meteorological Institute)
- **Storage Pattern**: In-memory storage class (`MemStorage`) with interface for future database integration

### Project Structure
```
client/           # React Native/Expo frontend
  ├── components/ # Reusable UI components (Button, Card, ThemedText, etc.)
  ├── screens/    # Screen components for each feature
  ├── navigation/ # Navigator configurations
  ├── hooks/      # Custom hooks (useTheme, useScreenOptions)
  ├── lib/        # Utilities (storage, query-client, types)
  └── constants/  # Theme definitions
server/           # Express backend
shared/           # Shared types and Drizzle schema
```

### Key Design Decisions
- **Path Aliases**: Uses `@/` for client code and `@shared/` for shared code via babel module-resolver
- **Theming**: Automatic dark/light mode support with system preference detection
- **Localization**: Norwegian (Bokmål) language throughout the UI
- **Platform Support**: iOS, Android, and Web with platform-specific adaptations

## External Dependencies

### APIs & Services
- **YR.no Weather API**: Norwegian Meteorological Institute API for wedding day weather forecasts (proxied through backend to handle CORS and caching)

### Database
- **PostgreSQL**: Configured via Drizzle ORM, expects `DATABASE_URL` environment variable
- **Drizzle Kit**: For schema migrations (`drizzle-kit push`)

### Key Libraries
- **expo-haptics**: Tactile feedback for user interactions
- **expo-blur/expo-glass-effect**: iOS-style blur effects for navigation
- **react-native-keyboard-controller**: Enhanced keyboard handling
- **react-native-gesture-handler**: Touch gesture support

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `EXPO_PUBLIC_DOMAIN`: API server domain for client requests
- `REPLIT_DEV_DOMAIN`: Development domain (auto-set by Replit)