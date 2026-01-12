# Wedflow - Wedding Planning App

## Overview

Wedflow by Norwedfilm is a comprehensive wedding planning mobile application designed for Scandinavian couples. Built with Expo/React Native for cross-platform mobile and web support, it helps couples organize their wedding day by managing schedules, guests, table seating, speeches, budgets, and vendor coordination.

The app follows a "Dark Elegance" design aesthetic with rich black backgrounds (#1A1A1A) and antique gold accents (#C9A962), creating a sophisticated, premium feel appropriate for wedding planning.

## Key Features

### For Couples
- **Schedule & Timeline**: Plan your wedding day with detailed schedules and visual timeline
- **Guest Management**: Track guests, RSVPs, dietary requirements, and table seating
- **Budget Tracking**: Monitor spending with category breakdowns and scenario planning
- **Vendor Marketplace**: Browse and contact Scandinavian wedding vendors
- **Messaging System**: Chat directly with vendors through the app
- **Offers & Quotes**: Receive and accept/decline structured price quotes from vendors
- **Delivery Access**: Retrieve photos/videos from photographers with access codes
- **Weather Forecast**: Check wedding day weather from YR.no
- **Reminders & Notifications**: Get timely reminders for important tasks
- **Partner Collaboration**: Share access with your partner
- **Inspiration Gallery**: Browse vendor-curated wedding inspiration

### For Vendors
- **Vendor Dashboard**: Manage deliveries, inspirations, products, offers, and messages
- **Product Catalog**: Create and manage product listings with pricing, units, and lead times
- **Quote System**: Send structured offers to couples with line items and expiration dates
- **Delivery System**: Upload and share media files with access code protection
- **Inspiration Submissions**: Submit photos/videos for the inspiration gallery (admin approval required)
- **Messaging**: Communicate directly with couples

### Admin Features
- **Vendor Approval**: Review and approve vendor registrations
- **Inspiration Moderation**: Approve/reject vendor-submitted inspiration content
- **Granular Permissions**: Control what vendors can access and do

## User Preferences

Preferred communication style: Simple, everyday language (Norwegian Bokmål).

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
- **Database**: PostgreSQL with Drizzle ORM for vendors, couples, messages, offers, products, and more
- **Schema Definition**: Drizzle ORM with PostgreSQL dialect (schema in `shared/schema.ts`)
- **Validation**: Zod schemas generated from Drizzle schema using drizzle-zod

### Backend Architecture
- **Server**: Express.js with TypeScript (runs via tsx in development)
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Authentication**: Separate session systems for couples (email-based) and vendors (email/password)
- **Storage Pattern**: PostgreSQL database with in-memory session caching

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