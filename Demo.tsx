import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import MicrophoneButton from './components/MicrophoneButton';
import { ConversationState } from './types';
import { useLiveConversation } from './hooks/useLiveConversation';

// Lazy load heavy components - only load when needed
const BreathingExercise = lazy(() => import('./components/BreathingExercise'));
const RequestSeatCard = lazy(() => import('./components/RequestSeatCard'));
const RouteMap = lazy(() => import('./components/RouteMap'));
const PlacesList = lazy(() => import('./components/PlacesList'));
const EmergencyContactsCard = lazy(() => import('./components/EmergencyContactsCard').then(module => ({ default: module.EmergencyContactsCard })));
const LiveMap3D = lazy(() => import('./components/LiveMap3D'));

// Simple loading spinner for lazy components
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
  </div>
);

interface Transcription {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.IDLE);
  const [mapData, setMapData] = useState<{ placeType?: string; location?: any; places?: any[]; autoCall?: string } | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  
  const getCurrentMapData = () => mapData;
  
  const handleTranscription = useCallback((speaker: 'user' | 'ai', text: string) => {
    setTranscriptions(prev => [...prev, { speaker, text, timestamp: new Date() }]);
  }, []);
  
  const { startConversation, stopConversation } = useLiveConversation(
    setConversationState, 
    setMapData,
    getCurrentMapData,
    handleTranscription
  );

  const handleMicClick = () => {
    if (conversationState === ConversationState.IDLE) {
      setTranscriptions([]); // Clear transcriptions when starting new conversation
      startConversation();
    } else {
      stopConversation();
    }
  };

  const statusText = useMemo(() => {
    switch (conversationState) {
      case ConversationState.IDLE:
        return "Tap the microphone to begin";
      case ConversationState.LISTENING:
        return "Listening...";
      case ConversationState.PROCESSING:
        return "Thinking...";
      case ConversationState.SPEAKING:
        return "Speaking...";
      case ConversationState.BREATHING:
        return "Focus on your breath...";
      case ConversationState.DISPLAYING_CARD:
          return "Show this card to a passenger.";
      case ConversationState.SHOWING_MAP:
          return "Displaying your route map.";
      case ConversationState.SHOWING_PLACES_LIST:
        return "Here are the locations I found.";
      case ConversationState.SHOWING_LIVE_MAP:
        return "Showing locations on map.";
      case ConversationState.SHOWING_EMERGENCY_CONTACTS:
        return "Your emergency contacts.";
      default:
        return "";
    }
  }, [conversationState]);  const suggestionPrompts = [
    { text: "Can I eat sushi?", icon: "🥗", category: "Nutrition" },
    { text: "What's happening at week 20?", icon: "📚", category: "Education" },
    { text: "Help me relax", icon: "🧘", category: "Wellness" },
    { text: "What should I pack in my hospital bag?", icon: "👶", category: "Baby Prep" },
    { text: "Where is the nearest hospital?", icon: "🏥", category: "Health" },
    { text: "Plan a comfortable route", icon: "🚌", category: "Commute" },
  ];

  const mainClasses = useMemo(() => {
    let base = "w-full h-screen flex flex-col items-center justify-between p-4 sm:p-8 font-sans transition-all duration-1000";
    if (conversationState === ConversationState.LISTENING) {
      return `${base} bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 listening-glow`;
    }
    if (conversationState === ConversationState.BREATHING) {
        return `${base} calm-breathing-bg`;
    }
    return `${base} bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900`;
  }, [conversationState]);
  
  const isMainContentVisible = conversationState !== ConversationState.BREATHING && 
    conversationState !== ConversationState.DISPLAYING_CARD && 
    conversationState !== ConversationState.SHOWING_MAP && 
    conversationState !== ConversationState.SHOWING_PLACES_LIST &&
    conversationState !== ConversationState.SHOWING_EMERGENCY_CONTACTS &&
    conversationState !== ConversationState.SHOWING_LIVE_MAP;

  return (
    <main className={mainClasses}>
      {conversationState === ConversationState.BREATHING && (
        <Suspense fallback={<ComponentLoader />}>
          <BreathingExercise onFinish={() => stopConversation()} />
        </Suspense>
      )}
      {conversationState === ConversationState.DISPLAYING_CARD && (
        <Suspense fallback={<ComponentLoader />}>
          <RequestSeatCard onClose={() => stopConversation()} />
        </Suspense>
      )}
      {conversationState === ConversationState.SHOWING_MAP && (
        <Suspense fallback={<ComponentLoader />}>
          <RouteMap onClose={() => stopConversation()} />
        </Suspense>
      )}
      {conversationState === ConversationState.SHOWING_PLACES_LIST && mapData && mapData.places && (
        <Suspense fallback={<ComponentLoader />}>
          <PlacesList 
            places={mapData.places}
            placeType={mapData.placeType || 'places'}
            onClose={() => {
              setConversationState(ConversationState.LISTENING);
              setMapData(null);
            }}
            onShowMap={() => {
              setConversationState(ConversationState.SHOWING_LIVE_MAP);
            }}
          />
        </Suspense>
      )}
      {conversationState === ConversationState.SHOWING_EMERGENCY_CONTACTS && (
        <Suspense fallback={<ComponentLoader />}>
          <EmergencyContactsCard 
            autoCall={mapData?.autoCall}
            onClose={() => {
              setConversationState(ConversationState.LISTENING);
              setMapData(null);
            }}
          />
        </Suspense>
      )}
      {conversationState === ConversationState.SHOWING_LIVE_MAP && mapData && (
        <Suspense fallback={<ComponentLoader />}>
          <LiveMap3D
            location={mapData.location}
            places={mapData.places || []}
            onClose={() => {
              setConversationState(ConversationState.LISTENING);
              setMapData(null);
            }}
          />
        </Suspense>
      )}

      {isMainContentVisible && (
        <>
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="fixed top-4 left-4 z-50 px-4 py-2 bg-slate-800/50 backdrop-blur-xl text-slate-200 text-sm font-medium rounded-xl border border-slate-700/50 hover:bg-slate-800/70 hover:border-indigo-500/50 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
            Back to Home
          </button>

          <header className="text-center w-full pt-4 sm:pt-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-indigo-500/20">
                <span className="text-2xl sm:text-3xl">🤰</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                Access.ai
              </h1>
            </div>
            <p className="text-base sm:text-lg text-slate-300 font-medium">Your Personal Assistant for Pregnancy</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4 px-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full text-xs font-medium text-indigo-300 shadow-sm border border-slate-700/50">
                🥗 Nutrition
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full text-xs font-medium text-purple-300 shadow-sm border border-slate-700/50">
                🏥 Health
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full text-xs font-medium text-pink-300 shadow-sm border border-slate-700/50">
                🧘 Wellness
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full text-xs font-medium text-indigo-300 shadow-sm border border-slate-700/50">
                👶 Baby Prep
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full text-xs font-medium text-purple-300 shadow-sm border border-slate-700/50">
                🚌 Commute
              </span>
            </div>
          </header>
          
          <div className="flex-grow w-full flex flex-col items-center justify-center text-center transition-all duration-500 ease-in-out px-4">
            {/* Suggestions Box */}
            <div 
                className={`transition-all duration-500 ease-in-out w-full max-w-3xl ${conversationState === ConversationState.IDLE ? 'opacity-100 translate-y-0 mb-8' : 'opacity-0 -translate-y-4 h-0 mb-0'}`}
            >
                <div className={conversationState !== ConversationState.IDLE ? 'hidden' : ''}>
                    <h2 className="text-lg sm:text-xl text-slate-200 font-semibold mb-4 animate-slide-up">Try asking me...</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {suggestionPrompts.map((prompt, index) => (
                            <div 
                              key={index} 
                              className="group bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 text-left shadow-lg hover:shadow-2xl hover:bg-slate-800/70 transition-all duration-300 cursor-pointer border border-slate-700/50 hover:border-indigo-500/50 transform hover:-translate-y-1 animate-slide-up"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl flex-shrink-0 group-hover:scale-125 transition-transform duration-300">
                                    {prompt.icon}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-indigo-400 mb-1 group-hover:text-purple-400 transition-colors">{prompt.category}</p>
                                    <p className="text-sm text-slate-300 font-medium leading-snug">"{prompt.text}"</p>
                                  </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transcription Display */}
            {conversationState !== ConversationState.IDLE && transcriptions.length > 0 && (
              <div className="w-full max-w-2xl mb-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-4 max-h-64 overflow-y-auto border border-slate-700/50">
                <div className="space-y-3">
                  {transcriptions.map((t, index) => (
                    <div 
                      key={index} 
                      className={`flex ${t.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                          t.speaker === 'user' 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                            : 'bg-slate-700/70 text-slate-100 border border-slate-600/50'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1 opacity-80">
                          {t.speaker === 'user' ? 'You' : 'Access.ai'}
                        </p>
                        <p className="text-sm leading-relaxed">{t.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <MicrophoneButton 
              conversationState={conversationState} 
              onClick={handleMicClick} 
            />
          </div>

          <footer className="h-16 sm:h-20 flex items-center justify-center text-center px-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-slate-200 text-base sm:text-lg font-semibold transition-opacity duration-300">
                {statusText}
              </p>
              {conversationState === ConversationState.IDLE && (
                <p className="text-xs sm:text-sm text-slate-400">
                  Powered by Google Gemini AI
                </p>
              )}
            </div>
          </footer>
        </>
      )}
    </main>
  );
};

export default App;
