# Access.ai - Project Overview

## What is Access.ai?

A voice-activated AI assistant designed specifically for pregnant women to help with:
- 🚌 Safe and comfortable commuting
- 💊 Health and wellness information
- 🧘 Stress management and relaxation
- 🗺️ Navigation and route planning

## Technology Stack

- **Frontend:** React 19 + TypeScript + Vite
- **AI:** Google Gemini 2.5 (Flash & Pro)
- **Styling:** Tailwind CSS
- **Audio:** Web Audio API + Speech Synthesis

## Key Features

### 1. Voice Interaction
-Real-time voice conversation with AI using Gemini's native audio capabilities.
- Enable "Multilinguistic" based on user  preferences

### 2. Smart Tools
- Route planning with comfort prioritization
- Real-time transit updates
- Find nearby hospitals, pharmacies
- Weather information
- Health advice with medical disclaimers

### 3. Wellness Features
- Guided breathing exercises
- Seat request card display
- Route map visualization

### 4. Safety First
- Medical disclaimers on health info
- Emergency facility locator
- Commute safety tips
### 5. Text interaction
- Enable text interaction in conjunction with the voice interaction dependng with the state of the user.

## Architecture

```
User Voice Input
    ↓
Web Audio API (capture)
    ↓
Gemini Live API (process)
    ↓
Function Calling (tools)
    ↓
Response (audio/text)
    ↓
UI Update
```

## File Structure

### Components (`components/`)
- `BreathingExercise.tsx` - Guided breathing UI
- `MicrophoneButton.tsx` - Voice input button
- `RequestSeatCard.tsx` - Seat request display
- `RouteMap.tsx` - Route visualization

### Hooks (`hooks/`)
- `useLiveConversation.ts` - Manages Gemini Live API connection

### Services (`services/`)
- `geminiService.ts` - All AI tool implementations

### Utils (`utils/`)
- `audioUtils.ts` - Audio encoding/decoding helpers

## How It Works

1. **User speaks** → Microphone captures audio
2. **Audio sent** → Gemini Live API processes
3. **AI decides** → Calls appropriate tools if needed
4. **Tools execute** → Get routes, health info, etc.
5. **Response generated** → AI creates helpful reply
6. **User hears** → Audio played back + UI updates

## Development Workflow

1. Clone repo
2. Install dependencies: `npm install`
3. Add API key to `.env.local`
4. Run: `npm run dev`
5. Open: `http://localhost:3000`

## For Hackathon Demo

### Key Talking Points
- AI-powered personal assistant for pregnant women
- Voice-first, hands-free interaction
- Comprehensive support beyond just commuting
- Powered by Google Gemini AI
- Real-time function calling for dynamic responses

### Demo Flow
1. Show landing screen
2. Tap microphone
3. Ask: "Where is the nearest hospital?"
4. Show: "Help me relax" (breathing exercise)
5. Ask: "Show me a map of my route"
6. Explain the AI architecture

## Future Enhancements

- [ ] User authentication
- [ ] Saved preferences
- [ ] Appointment reminders
- [ ] Nutrition tracking
- [ ] Mobile app (Flutter)
- [ ] Offline mode
- [ ] Multi-language support
