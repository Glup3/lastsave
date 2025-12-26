# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LastSave is an Expo-based React Native app with TypeScript that integrates Whisper AI for audio transcription. The app uses file-based routing via expo-router and NativeWind for Tailwind CSS styling.

## Essential Commands

**Development:**
- `npm start` - Start Expo development server (Expo Go or custom dev client)
- `npm run ios` - Run on iOS simulator/device (requires iOS build)
- `npm run android` - Run on Android emulator/device (requires Android build)
- `npm run web` - Run as web application

**Code Quality:**
- `npm run lint` - Run ESLint

## Architecture

### Routing
Uses Expo Router (file-based routing) with typed routes enabled. Routes are defined in the `app/` directory:
- `app/_layout.tsx` - Root layout with theme provider and stack navigation
- `app/(tabs)/` - Tab-based navigation group
- Route anchor is set to `(tabs)` via `unstable_settings`

### Styling
Dual styling approach:
- **NativeWind (Tailwind CSS)** - Configured via `tailwind.config.js` and `global.css`
- **StyleSheet** - Traditional React Native styles for complex layouts
- Babel is configured with `jsxImportSource: "nativewind"` preset

### Theme System
- Uses `@react-navigation/native` theme provider
- Custom hooks: `use-color-scheme.ts` (native) and `use-color-scheme.web.ts` (web platform)
- Dark/light mode support with automatic system detection

### Audio & AI
- **Whisper.rn** - Local audio transcription using GGML models
- Model files stored in `assets/whisper-models/` (currently using `ggml-tiny-q8_0.bin`)
- **Expo Audio** - Audio recording with microphone permissions
- Metro config extends asset extensions to include `.bin` files for Whisper models

### Component Structure
- `components/` - Shared UI components (themed components, animations, utilities)
- `components/ui/` - Specific UI elements (Collapsible, IconSymbol)
- `hooks/` - Custom React hooks for theme and color scheme
- `constants/` - App-wide constants

### Configuration
- **TypeScript** - Strict mode enabled with path alias `@/*` pointing to root
- **Expo Config** - New Architecture enabled, typed routes and React Compiler experiments active
- **Metro** - Configured with NativeWind and custom asset extensions
- **Platform-specific** - iOS bundle ID: `glup3-lastsave`, edge-to-edge Android UI

### Path Aliases
Import paths use `@/` prefix to reference project root:
```typescript
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
```
