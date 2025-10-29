import { useState, useRef, useCallback } from 'react';
// FIX: Removed `LiveSession` as it is not an exported member of '@google/genai'.
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { ConversationState } from '../types';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { getComplexRoute, getRealtimeInfo, findAmenity, findNearbyPlaces, findNearbyPlacesWithCoords, getWeather, getPregnancyCommuteAdvice, getPregnancyMedicalInfo, getGeneralPregnancyInfo, getTravelCardInfo } from '../services/geminiService';

const SYSTEM_INSTRUCTION = `You are Access.ai, a warm, empathetic, and knowledgeable personal assistant for pregnant women. 
You are their comprehensive companion throughout the entire pregnancy journey - from first trimester to postpartum.

YOUR CORE PURPOSE:
You provide support across ALL aspects of pregnancy:
- Health & Medical: Symptoms, appointments, medical information (with disclaimers)
- Nutrition & Diet: Safe foods, meal planning, cravings, hydration
- Wellness & Mental Health: Stress relief, sleep, exercise, mood support
- Commute & Mobility: Safe travel, routes, amenities, accessibility
- Baby Preparation: Hospital bag, nursery, names, registry
- Education: Week-by-week info, classes, resources

YOUR PERSONALITY:
- Warm, supportive, and understanding
- Never judgmental or dismissive
- Celebrate milestones and acknowledge challenges
- Use encouraging language ("You're doing great!", "That's completely normal")
- Acknowledge discomforts with empathy (e.g., "I'm sorry you're feeling tired. That's so common in the first trimester.")

HOW YOU HELP:
1. Listen carefully to what the user needs
2. Use the appropriate tools to get accurate information
3. Provide clear, actionable guidance
4. Always be reassuring and supportive
5. Remind them to consult healthcare providers for medical decisions

AVAILABLE TOOLS:
**Commute & Mobility:**
- get_transport_route: Plan comfortable routes
- get_realtime_updates: Transit delays and updates
- find_amenity: Restrooms, seating at stations
- find_nearby_places: **AUTOMATICALLY uses user's GPS location** - just provide place type (hospital, pharmacy, etc.)
- get_weather: Weather forecasts
- get_travel_card_info: Travel card information
- request_seat_aid: Display seat request card
- show_route_map: Show route visualization

**Emergency Contacts:**
- show_emergency_contacts: Display emergency contacts screen
- call_emergency_contact: Initiate call to specific contact (partner, doctor, emergency)

**Health & Medical:**
- get_pregnancy_commute_advice: Safety tips for travel
- get_pregnancy_medical_info: Medical questions (includes disclaimer)
- get_general_pregnancy_info: General pregnancy advice
- get_week_by_week_info: Development info by week

**Nutrition & Diet:**
- check_food_safety: "Can I eat this?" questions
- get_meal_plan: Meal planning help
- get_nutrition_advice: Nutrition questions

**Baby Preparation:**
- get_hospital_bag_checklist: What to pack
- get_baby_name_suggestions: Name ideas
- get_nursery_advice: Nursery planning

**Wellness:**
- start_breathing_exercise: Guided breathing for stress
- get_exercise_advice: Safe exercises by trimester
- get_sleep_advice: Sleep tips and solutions

IMPORTANT RULES:
1. For medical questions, ALWAYS use get_pregnancy_medical_info (includes disclaimer)
2. Never diagnose or replace medical advice
3. If user seems distressed, offer breathing exercises
4. If asking about food safety, use check_food_safety tool
5. **CRITICAL: When user asks for nearby places (hospital, pharmacy, etc.), IMMEDIATELY call find_nearby_places with ONLY the place_type. DO NOT ask for their location - the tool gets it automatically!**
6. **After finding nearby places, list them with distances and practical details. A visual list will be shown automatically for the user to review.**
7. Don't hallucinate - if you don't know, say so and suggest consulting a doctor
8. Be conversational and natural, not robotic
9. **EMERGENCY CONTACTS: When user says "call my partner/spouse/husband/wife" use call_emergency_contact with contactType="partner". For "call my doctor/OB-GYN" use contactType="doctor". For "emergency/911" use contactType="emergency". DO NOT confuse these!**

EXAMPLE INTERACTIONS:
User: "Can I eat sushi?"
You: Use check_food_safety tool, then explain warmly

User: "I'm feeling anxious"
You: Acknowledge feelings, offer breathing exercise

User: "What's happening at week 20?"
You: Use get_week_by_week_info tool

User: "Where is the nearest hospital?"
You: Call find_nearby_places('hospital'), read results, then ask if they want to see it on a map

User: "Call my partner"
You: Call call_emergency_contact with contactType="partner" (NOT "emergency"!)

User: "I need to talk to my doctor"
You: Call call_emergency_contact with contactType="doctor"

User: "Emergency! Help!"
You: Call call_emergency_contact with contactType="emergency" (for 911 only!)

Remember: You're not just an assistant - you're a supportive companion on their pregnancy journey. Be kind, be helpful, be human.`;

const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'get_transport_route',
        description: 'Get a public transport route from an origin to a destination, focusing on comfort for a pregnant person.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                origin: { type: Type.STRING, description: 'The starting point of the journey.' },
                destination: { type: Type.STRING, description: 'The final destination.' },
            },
            required: ['origin', 'destination'],
        },
    },
    {
        name: 'get_realtime_updates',
        description: 'Get real-time updates, such as delays or schedule changes, for a specific transport line or route.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'The user\'s query about delays, e.g., "delays on the Red Line"' },
            },
            required: ['query'],
        },
    },
    {
        name: 'find_amenity',
        description: 'Find amenities like restrooms or seating areas at a specific public transport stop or station.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                amenity: { type: Type.STRING, description: 'The type of amenity to find, e.g., "restroom" or "seating".' },
                location: { type: Type.STRING, description: 'The stop or station to search at, e.g., "Central Station".' },
            },
            required: ['amenity', 'location'],
        },
    },
    {
        name: 'find_nearby_places',
        description: 'Find nearby facilities like hospitals, restaurants, or pharmacies. This tool automatically uses the user\'s current GPS location, so you do NOT need to ask where they are. Just call this tool with the place type.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                place_type: { type: Type.STRING, description: 'The type of place to search for, e.g., "hospital", "restaurant", "pharmacy".' },
            },
            required: ['place_type'],
        },
    },
    {
        name: 'get_weather',
        description: 'Gets the current weather forecast for a specific location or area.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                location: { type: Type.STRING, description: 'The location to get the weather for, e.g., "Central Station" or "downtown".' },
            },
            required: ['location'],
        },
    },
    {
        name: 'get_pregnancy_commute_advice',
        description: 'Provides safety, comfort, or health tips for pregnant commuters.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                topic: { type: Type.STRING, description: 'The topic the user is asking about, e.g., "safety", "comfort", "health", or a specific concern like "feeling dizzy".' },
            },
            required: ['topic'],
        },
    },
    {
        name: 'get_pregnancy_medical_info',
        description: 'Provides general, non-diagnostic information about pregnancy-related medical topics. Always advises users to consult a doctor.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'The user\'s medical or health-related question, e.g., "what are signs of Braxton Hicks?" or "is it normal to feel tired".' },
            },
            required: ['query'],
        },
    },
    {
        name: 'get_general_pregnancy_info',
        description: 'Provides helpful, non-medical information and advice on general pregnancy topics such as nutrition, exercise, and well-being.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'The user\'s general question about pregnancy, e.g., "what are some healthy snacks?" or "safe exercises for second trimester".' },
            },
            required: ['query'],
        },
    },
    {
        name: 'get_travel_card_info',
        description: 'Provides information about public transport travel cards, including their benefits and how to purchase them.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'The user\'s question about travel cards, e.g., "benefits", "where to buy", "how to get one".' },
            },
            required: ['query'],
        },
    },
     {
        name: 'start_breathing_exercise',
        description: 'Initiates a guided breathing exercise UI for the user to help them relax or calm down.',
        parameters: { type: Type.OBJECT, properties: {} },
    },
    {
        name: 'request_seat_aid',
        description: 'Displays a full-screen message on the user\'s device to help them request a seat from other passengers.',
        parameters: { type: Type.OBJECT, properties: {} },
    },
    {
        name: 'show_route_map',
        description: 'Displays a static map of the current transport route on the screen. Call this if the user asks to see the map.',
        parameters: { type: Type.OBJECT, properties: {} },
    },
    {
        name: 'show_live_map',
        description: 'Display an interactive 3D map showing nearby places. Use after calling find_nearby_places to visualize the results.',
        parameters: { type: Type.OBJECT, properties: {} },
    },
    
    // NUTRITION & DIET TOOLS
    {
        name: 'check_food_safety',
        description: 'Check if a specific food is safe to eat during pregnancy. Use this when user asks "Can I eat [food]?"',
        parameters: {
            type: Type.OBJECT,
            properties: {
                food: { type: Type.STRING, description: 'The food item to check, e.g., "sushi", "soft cheese", "coffee"' },
            },
            required: ['food'],
        },
    },
    {
        name: 'get_meal_plan',
        description: 'Generate a nutritious meal plan for pregnancy based on preferences or dietary needs.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                preferences: { type: Type.STRING, description: 'Dietary preferences or restrictions, e.g., "vegetarian", "high protein", "first trimester nausea"' },
            },
            required: ['preferences'],
        },
    },
    {
        name: 'get_nutrition_advice',
        description: 'Get nutrition advice for pregnancy-related questions about vitamins, supplements, or dietary concerns.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'The nutrition question, e.g., "how much calcium do I need?", "best foods for iron"' },
            },
            required: ['query'],
        },
    },
    
    // EMERGENCY CONTACT TOOLS
    {
        name: 'show_emergency_contacts',
        description: 'Display emergency contacts screen. Use when user needs to call someone urgently (partner, doctor, emergency services).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                autoCall: { 
                    type: Type.STRING, 
                    description: 'Optional: automatically call a specific contact. Use EXACTLY: "partner" for spouse/husband/wife, "doctor" for OB/GYN, "emergency" for 911, "family" for family member. Leave empty to just show contacts.' 
                },
            },
        },
    },
    {
        name: 'call_emergency_contact',
        description: 'Initiate a call to a specific emergency contact. Use when user explicitly says "call my [person]". IMPORTANT: Match the user\'s request to the correct contact type.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                contactType: { 
                    type: Type.STRING, 
                    description: 'The contact to call - use EXACTLY one of: "partner" (for spouse/husband/wife/partner), "doctor" (for OB/GYN/physician), "emergency" (for 911/emergency services ONLY), "family" (for family member)' 
                },
            },
            required: ['contactType'],
        },
    },
    
    // BABY PREPARATION TOOLS
    {
        name: 'get_hospital_bag_checklist',
        description: 'Provide a comprehensive hospital bag checklist for labor and delivery.',
        parameters: { type: Type.OBJECT, properties: {} },
    },
    {
        name: 'get_baby_name_suggestions',
        description: 'Suggest baby names based on preferences like style, origin, or meaning.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                preferences: { type: Type.STRING, description: 'Name preferences, e.g., "classic names", "nature-inspired", "short names", "biblical names"' },
            },
            required: ['preferences'],
        },
    },
    {
        name: 'get_nursery_advice',
        description: 'Provide advice on nursery planning, setup, essentials, or safety.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'The nursery question, e.g., "essential items", "budget setup", "safety tips"' },
            },
            required: ['query'],
        },
    },
    
    // WELLNESS & EXERCISE TOOLS
    {
        name: 'get_exercise_advice',
        description: 'Provide safe exercise recommendations for pregnancy based on trimester and fitness level.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                trimester: { type: Type.STRING, description: 'Which trimester: "first trimester", "second trimester", or "third trimester"' },
                query: { type: Type.STRING, description: 'The exercise question, e.g., "safe workouts", "yoga poses", "can I run?"' },
            },
            required: ['trimester', 'query'],
        },
    },
    {
        name: 'get_sleep_advice',
        description: 'Provide tips for better sleep during pregnancy based on specific sleep issues.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                issue: { type: Type.STRING, description: 'The sleep problem, e.g., "can\'t get comfortable", "insomnia", "frequent urination"' },
            },
            required: ['issue'],
        },
    },
    
    // WEEK-BY-WEEK INFORMATION
    {
        name: 'get_week_by_week_info',
        description: 'Get detailed information about a specific week of pregnancy including baby development and mom\'s changes.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                week: { type: Type.NUMBER, description: 'The pregnancy week number (1-42)' },
            },
            required: ['week'],
        },
    },
];


export const useLiveConversation = (
    setConversationState: (state: ConversationState) => void,
    setMapData?: (data: { placeType?: string; location?: any; places?: any[] } | null) => void,
    getCurrentMapData?: () => { placeType?: string; location?: any; places?: any[] } | null,
    onTranscription?: (speaker: 'user' | 'ai', text: string) => void
) => {
    // FIX: The `LiveSession` type is not exported from `@google/genai`. Using `Promise<any>` as a workaround.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    const pendingMessageRef = useRef<string | null>(null); // Queue for messages sent before session opens

    const stopAudioPlayback = useCallback(() => {
        outputAudioContextRef.current?.resume();
        audioSourcesRef.current.forEach(source => {
            source.stop();
        });
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    }, []);

    const stopConversation = useCallback(async () => {
        setConversationState(ConversationState.IDLE);
        stopAudioPlayback();

        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.close();
            sessionPromiseRef.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }

        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;

        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;

    }, [setConversationState, stopAudioPlayback]);

    const startConversation = useCallback(async () => {
        setConversationState(ConversationState.LISTENING);
        
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                console.error('GEMINI_API_KEY is not set in environment variables');
                alert('API Key is missing. Please check your .env.local file has GEMINI_API_KEY set.');
                setConversationState(ConversationState.IDLE);
                return;
            }
            
            const ai = new GoogleGenAI({ apiKey });
            
            // FIX: Added type assertion to handle vendor-prefixed webkitAudioContext for broader browser compatibility.
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContextRef.current.createGain();
            outputNode.connect(outputAudioContextRef.current.destination);

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    responseModalities: [Modality.AUDIO],
                    tools: [{ functionDeclarations }],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
                callbacks: {
                    onopen: async () => {
                        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                        // FIX: Added type assertion to handle vendor-prefixed webkitAudioContext for broader browser compatibility.
                        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createPcmBlob(inputData);
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Capture user transcription
                        const userTranscript = message.serverContent?.turnComplete;
                        if (userTranscript && onTranscription) {
                            const userText = message.serverContent?.modelTurn?.parts?.find(p => p.text)?.text;
                            if (userText) {
                                onTranscription('user', userText);
                            }
                        }

                        if (message.serverContent?.interrupted) {
                            stopAudioPlayback();
                        }
                        
                        if (message.toolCall) {
                            // Client-side tools that change UI state directly
                            const clientToolCall = message.toolCall.functionCalls.find(fc => 
                                fc.name === 'start_breathing_exercise' || 
                                fc.name === 'request_seat_aid' || 
                                fc.name === 'show_route_map' ||
                                fc.name === 'show_live_map' ||
                                fc.name === 'show_emergency_contacts' ||
                                fc.name === 'call_emergency_contact'
                            );
                            if (clientToolCall) {
                                if (clientToolCall.name === 'start_breathing_exercise') {
                                    setConversationState(ConversationState.BREATHING);
                                } else if (clientToolCall.name === 'request_seat_aid') {
                                    setConversationState(ConversationState.DISPLAYING_CARD);
                                } else if (clientToolCall.name === 'show_route_map') {
                                    setConversationState(ConversationState.SHOWING_MAP);
                                } else if (clientToolCall.name === 'show_live_map') {
                                    // Show 3D map with current location and places
                                    const currentData = getCurrentMapData?.() || {};
                                    if (setMapData && currentData.places) {
                                        setMapData(currentData);
                                    }
                                    setConversationState(ConversationState.SHOWING_LIVE_MAP);
                                } else if (clientToolCall.name === 'show_emergency_contacts' || clientToolCall.name === 'call_emergency_contact') {
                                    // Store auto-call parameter if provided
                                    const autoCall = clientToolCall.name === 'call_emergency_contact' 
                                        ? (clientToolCall.args?.contactType as string)
                                        : (clientToolCall.args?.autoCall as string | undefined);
                                    
                                    if (setMapData) {
                                        setMapData({ autoCall } as any);
                                    }
                                    setConversationState(ConversationState.SHOWING_EMERGENCY_CONTACTS);
                                }
                                if(scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
                                return;
                            }


                            setConversationState(ConversationState.PROCESSING);
                            for (const fc of message.toolCall.functionCalls) {
                                let result = "I'm sorry, I couldn't process that request.";
                                try {
                                    // FIX: Cast function call arguments from 'unknown' to 'string' to match service function signatures.
                                    if (fc.name === 'get_transport_route') {
                                        result = await getComplexRoute(`From ${fc.args.origin as string} to ${fc.args.destination as string}`);
                                    } else if (fc.name === 'get_realtime_updates') {
                                        result = await getRealtimeInfo(fc.args.query as string);
                                    } else if (fc.name === 'find_amenity') {
                                        result = await findAmenity(fc.args.amenity as string, fc.args.location as string);
                                    } else if (fc.name === 'find_nearby_places') {
                                        const placesData = await findNearbyPlacesWithCoords(fc.args.place_type as string, 'current location');
                                        result = placesData.message;
                                        if (setMapData && placesData.places.length > 0) {
                                            setMapData({ 
                                                placeType: fc.args.place_type as string,
                                                places: placesData.places.map(p => ({ 
                                                    lat: p.lat, 
                                                    lng: p.lng, 
                                                    name: p.name,
                                                    distance: p.distance
                                                }))
                                            });
                                            setTimeout(() => {
                                                setConversationState(ConversationState.SHOWING_PLACES_LIST);
                                            }, 1000);
                                        }
                                    } else if (fc.name === 'get_weather') {
                                        result = await getWeather(fc.args.location as string);
                                    } else if (fc.name === 'get_pregnancy_commute_advice') {
                                        result = await getPregnancyCommuteAdvice(fc.args.topic as string);
                                    } else if (fc.name === 'get_pregnancy_medical_info') {
                                        result = await getPregnancyMedicalInfo(fc.args.query as string);
                                    } else if (fc.name === 'get_general_pregnancy_info') {
                                        result = await getGeneralPregnancyInfo(fc.args.query as string);
                                    } else if (fc.name === 'get_travel_card_info') {
                                        result = await getTravelCardInfo(fc.args.query as string);
                                    }
                                    // Nutrition tools
                                    else if (fc.name === 'check_food_safety') {
                                        const { checkFoodSafety } = await import('../services/geminiService');
                                        result = await checkFoodSafety(fc.args.food as string);
                                    } else if (fc.name === 'get_meal_plan') {
                                        const { getMealPlan } = await import('../services/geminiService');
                                        result = await getMealPlan(fc.args.preferences as string);
                                    } else if (fc.name === 'get_nutrition_advice') {
                                        const { getNutritionAdvice } = await import('../services/geminiService');
                                        result = await getNutritionAdvice(fc.args.query as string);
                                    }
                                    // Baby preparation tools
                                    else if (fc.name === 'get_hospital_bag_checklist') {
                                        const { getHospitalBagChecklist } = await import('../services/geminiService');
                                        result = await getHospitalBagChecklist();
                                    } else if (fc.name === 'get_baby_name_suggestions') {
                                        const { getBabyNameSuggestions } = await import('../services/geminiService');
                                        result = await getBabyNameSuggestions(fc.args.preferences as string);
                                    } else if (fc.name === 'get_nursery_advice') {
                                        const { getNurseryAdvice } = await import('../services/geminiService');
                                        result = await getNurseryAdvice(fc.args.query as string);
                                    }
                                    // Wellness tools
                                    else if (fc.name === 'get_exercise_advice') {
                                        const { getExerciseAdvice } = await import('../services/geminiService');
                                        result = await getExerciseAdvice(fc.args.trimester as string, fc.args.query as string);
                                    } else if (fc.name === 'get_sleep_advice') {
                                        const { getSleepAdvice } = await import('../services/geminiService');
                                        result = await getSleepAdvice(fc.args.issue as string);
                                    }
                                    // Week-by-week info
                                    else if (fc.name === 'get_week_by_week_info') {
                                        const { getWeekByWeekInfo } = await import('../services/geminiService');
                                        result = await getWeekByWeekInfo(fc.args.week as number);
                                    }
                                } catch (e) {
                                    console.error("Tool execution error:", e);
                                }
                                
                                const session = await sessionPromiseRef.current;
                                session?.sendToolResponse({
                                    functionResponses: { id: fc.id, name: fc.name, response: { result } }
                                });
                            }
                        }

                        // Handle text responses
                        const textResponse = message.serverContent?.modelTurn?.parts?.find(part => part.text);
                        if (textResponse?.text) {
                            if (onTranscription) {
                                onTranscription('ai', textResponse.text);
                            }
                            // For text-only responses, go back to listening after a brief delay
                            setTimeout(() => {
                                setConversationState(ConversationState.LISTENING);
                            }, 100);
                        }

                        // Handle audio responses
                        const audioDataB64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioDataB64) {
                            // Capture AI transcription from audio response
                            const aiText = message.serverContent?.modelTurn?.parts?.find(p => p.text)?.text;
                            if (aiText && onTranscription) {
                                onTranscription('ai', aiText);
                            }

                            if (outputAudioContextRef.current) {
                                setConversationState(ConversationState.SPEAKING);
                                const audioContext = outputAudioContextRef.current;
                                audioContext.resume();
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);

                                const audioBuffer = await decodeAudioData(decode(audioDataB64), audioContext, 24000, 1);
                                const source = audioContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputNode);
                                source.start(nextStartTimeRef.current);

                                nextStartTimeRef.current += audioBuffer.duration;
                                audioSourcesRef.current.add(source);
                                source.onended = () => {
                                    audioSourcesRef.current.delete(source);
                                    if (audioSourcesRef.current.size === 0) {
                                        setConversationState(ConversationState.LISTENING);
                                    }
                                };
                            }
                        }
                    },
                    onclose: () => {
                        stopConversation();
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        stopConversation();
                    },
                }
            });

        } catch (error) {
            console.error("Failed to start conversation:", error);
            setConversationState(ConversationState.IDLE);
        }
    }, [setConversationState, stopConversation, stopAudioPlayback]);

    const startTextOnlyConversation = useCallback(async () => {
        setConversationState(ConversationState.LISTENING);
        
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                console.error('GEMINI_API_KEY is not set in environment variables');
                alert('API Key is missing. Please check your .env.local file has GEMINI_API_KEY set.');
                setConversationState(ConversationState.IDLE);
                return;
            }
            
            const ai = new GoogleGenAI({ apiKey });

            // Use audio model but without audio config - it will work with text
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    // Don't specify responseModalities - let it default to both
                    tools: [{ functionDeclarations }],
                },
                callbacks: {
                    onopen: () => {
                        // Send any pending message
                        if (pendingMessageRef.current) {
                            const message = pendingMessageRef.current;
                            pendingMessageRef.current = null;
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput([{ text: message }]);
                                setConversationState(ConversationState.PROCESSING);
                            });
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.interrupted) {
                            stopAudioPlayback();
                        }
                        
                        if (message.toolCall) {
                            // Client-side tools that change UI state directly
                            const clientToolCall = message.toolCall.functionCalls.find(fc => 
                                fc.name === 'start_breathing_exercise' || 
                                fc.name === 'request_seat_aid' || 
                                fc.name === 'show_route_map' ||
                                fc.name === 'show_live_map' ||
                                fc.name === 'show_emergency_contacts' ||
                                fc.name === 'call_emergency_contact'
                            );
                            if (clientToolCall) {
                                if (clientToolCall.name === 'start_breathing_exercise') {
                                    setConversationState(ConversationState.BREATHING);
                                } else if (clientToolCall.name === 'request_seat_aid') {
                                    setConversationState(ConversationState.DISPLAYING_CARD);
                                } else if (clientToolCall.name === 'show_route_map') {
                                    setConversationState(ConversationState.SHOWING_MAP);
                                } else if (clientToolCall.name === 'show_live_map') {
                                    const currentData = getCurrentMapData?.() || {};
                                    if (setMapData && currentData.places) {
                                        setMapData(currentData);
                                    }
                                    setConversationState(ConversationState.SHOWING_LIVE_MAP);
                                } else if (clientToolCall.name === 'show_emergency_contacts' || clientToolCall.name === 'call_emergency_contact') {
                                    const autoCall = clientToolCall.name === 'call_emergency_contact' 
                                        ? (clientToolCall.args?.contactType as string)
                                        : (clientToolCall.args?.autoCall as string | undefined);
                                    
                                    if (setMapData) {
                                        setMapData({ autoCall } as any);
                                    }
                                    setConversationState(ConversationState.SHOWING_EMERGENCY_CONTACTS);
                                }
                                return;
                            }

                            setConversationState(ConversationState.PROCESSING);
                            for (const fc of message.toolCall.functionCalls) {
                                let result = null;
                                try {
                                    if (fc.name === 'get_complex_route') {
                                        result = await getComplexRoute(fc.args.origin as string, fc.args.destination as string);
                                    } else if (fc.name === 'get_realtime_info') {
                                        result = await getRealtimeInfo(fc.args.stopId as string);
                                    } else if (fc.name === 'find_amenity') {
                                        result = await findAmenity(fc.args.amenityType as string, fc.args.location as string);
                                    } else if (fc.name === 'find_nearby_places') {
                                        result = await findNearbyPlaces(fc.args.placeType as string, fc.args.location as string);
                                    } else if (fc.name === 'find_nearby_places_with_coords') {
                                        result = await findNearbyPlacesWithCoords(fc.args.placeType as string, fc.args.latitude as number, fc.args.longitude as number, fc.args.radius as number);
                                    } else if (fc.name === 'get_weather') {
                                        result = await getWeather(fc.args.location as string);
                                    } else if (fc.name === 'get_pregnancy_commute_advice') {
                                        result = await getPregnancyCommuteAdvice(fc.args.scenario as string);
                                    }
                                    // Health tools
                                    else if (fc.name === 'get_pregnancy_medical_info') {
                                        result = await getPregnancyMedicalInfo(fc.args.query as string);
                                    } else if (fc.name === 'get_general_pregnancy_info') {
                                        result = await getGeneralPregnancyInfo(fc.args.query as string);
                                    } else if (fc.name === 'get_travel_card_info') {
                                        result = await getTravelCardInfo(fc.args.query as string);
                                    }
                                    // Nutrition tools
                                    else if (fc.name === 'check_food_safety') {
                                        const { checkFoodSafety } = await import('../services/geminiService');
                                        result = await checkFoodSafety(fc.args.foodName as string, fc.args.trimester as string);
                                    } else if (fc.name === 'get_meal_plan') {
                                        const { getMealPlan } = await import('../services/geminiService');
                                        result = await getMealPlan(fc.args.trimester as string, fc.args.preferences as string);
                                    } else if (fc.name === 'get_nutrition_info') {
                                        const { getNutritionInfo } = await import('../services/geminiService');
                                        result = await getNutritionInfo(fc.args.topic as string);
                                    }
                                    // Education tools
                                    else if (fc.name === 'search_pregnancy_classes') {
                                        const { searchPregnancyClasses } = await import('../services/geminiService');
                                        result = await searchPregnancyClasses(fc.args.location as string, fc.args.classType as string);
                                    } else if (fc.name === 'get_pregnancy_resource') {
                                        const { getPregnancyResource } = await import('../services/geminiService');
                                        result = await getPregnancyResource(fc.args.topic as string);
                                    }
                                    // Baby prep tools
                                    else if (fc.name === 'get_hospital_bag_checklist') {
                                        const { getHospitalBagChecklist } = await import('../services/geminiService');
                                        result = await getHospitalBagChecklist();
                                    } else if (fc.name === 'get_baby_name_suggestions') {
                                        const { getBabyNameSuggestions } = await import('../services/geminiService');
                                        result = await getBabyNameSuggestions(fc.args.preferences as string);
                                    } else if (fc.name === 'get_nursery_advice') {
                                        const { getNurseryAdvice } = await import('../services/geminiService');
                                        result = await getNurseryAdvice(fc.args.query as string);
                                    }
                                    // Wellness tools
                                    else if (fc.name === 'get_exercise_advice') {
                                        const { getExerciseAdvice } = await import('../services/geminiService');
                                        result = await getExerciseAdvice(fc.args.trimester as string, fc.args.query as string);
                                    } else if (fc.name === 'get_sleep_advice') {
                                        const { getSleepAdvice } = await import('../services/geminiService');
                                        result = await getSleepAdvice(fc.args.issue as string);
                                    }
                                    // Week-by-week info
                                    else if (fc.name === 'get_week_by_week_info') {
                                        const { getWeekByWeekInfo } = await import('../services/geminiService');
                                        result = await getWeekByWeekInfo(fc.args.week as number);
                                    }
                                } catch (e) {
                                    console.error("Tool execution error:", e);
                                }
                                
                                const session = await sessionPromiseRef.current;
                                session?.sendToolResponse({
                                    functionResponses: { id: fc.id, name: fc.name, response: { result } }
                                });
                            }
                        }

                        // Handle text responses
                        const textResponse = message.serverContent?.modelTurn?.parts?.find(part => part.text);
                        if (textResponse?.text) {
                            if (onTranscription) {
                                onTranscription('ai', textResponse.text);
                            }
                            // For text-only responses, go back to listening after a brief delay
                            setTimeout(() => {
                                setConversationState(ConversationState.LISTENING);
                            }, 100);
                        }
                    },
                    onclose: () => {
                        stopConversation();
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        stopConversation();
                    },
                }
            });

        } catch (error) {
            console.error("Failed to start text conversation:", error);
            setConversationState(ConversationState.IDLE);
        }
    }, [setConversationState, stopConversation, stopAudioPlayback, setMapData, getCurrentMapData]);

    const sendTextMessage = useCallback(async (text: string) => {
        if (!sessionPromiseRef.current) {
            // Queue the message to be sent when session opens
            pendingMessageRef.current = text;
            return;
        }

        try {
            const session = await sessionPromiseRef.current;
            session.sendRealtimeInput([{ text }]);
            setConversationState(ConversationState.PROCESSING);
        } catch (error) {
            console.error("Failed to send text message:", error);
        }
    }, [setConversationState]);

    return { startConversation, startTextOnlyConversation, stopConversation, sendTextMessage };
};