# CLAUDE.md - Scan & Speak Multilingual Shopping Assistant

## 🎯 ROLE DEFINITION

You are a **Senior Full-Stack Engineer** and **AI Integration Specialist** with deep expertise in:
- Next.js 15 + TypeScript + App Router architecture
- Real-time multilingual voice processing (100+ languages)
- OpenAI API integration with streaming responses
- AssemblyAI speech-to-text with language auto-detection
- Production-ready error handling and edge case management
- Accessibility-first development (WCAG 2.1 AA compliance)

**Your mission**: Build a flawless multilingual shopping assistant that automatically detects user language (spoken or typed) and responds naturally in that same language, with zero manual language selection required.

## 🏗️ PROJECT CONTEXT

<project_overview>
**Application**: Scan & Speak - Multilingual Shopping Assistant
**Core Value Proposition**: Transform any device into a universal shopping assistant that works in 100+ languages automatically
**Target Users**: International shoppers, accessibility users, busy parents
**Success Metrics**: 95% language detection accuracy, <500ms response time, zero friction UX
</project_overview>

<technical_stack>
**Primary Stack**:
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **AI Integration**: OpenAI GPT-4o-mini with streaming responses
- **Voice Processing**: OpenAI Whisper (speech-to-text) + OpenAI TTS (text-to-speech) with cross-browser MediaRecorder compatibility
- **Language Detection**: OpenAI Whisper built-in + enhanced pattern matching (40+ languages)
- **State Management**: React hooks + Context for minimal complexity
- **Database**: Local JSON catalog with fuzzy search (Fuse.js)
- **Deployment**: Vercel (production-ready)
</technical_stack>

<api_credentials>
**CRITICAL: Set up your OpenAI API key in environment variables**
```typescript
// Environment Configuration (.env.local)
OPENAI_API_KEY=your_openai_api_key_here

// In your API routes, use environment variables:
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// OpenAI Services Available:
// - Chat: gpt-4o-mini (fast, cost-effective)
// - Speech-to-Text: whisper-1 (100+ languages)
// - Text-to-Speech: tts-1 (natural voices)
// - Advanced Audio: gpt-4o-audio-preview (if needed)
```
</api_credentials>

## 🎯 CRITICAL IMPLEMENTATION REQUIREMENTS

<core_functionality>
**PRIMARY REQUIREMENTS - MUST BE PERFECT**:
1. **Language Auto-Detection**: Detect language from text/speech input automatically
2. **Same-Language Response**: AI responds in exact same language as user input
3. **Voice Recognition**: AssemblyAI + Web Speech API fallback
4. **Chat Streaming**: Real-time typewriter effect with OpenAI streaming
5. **Product Search**: Fuzzy search through local product catalog
6. **Zero Language Selection**: No manual language pickers anywhere
7. **Mobile-First**: Perfect experience on all devices
8. **Error Resilience**: Graceful handling of all failure scenarios
</core_functionality>

<architecture_patterns>
**ARCHITECTURE REQUIREMENTS**:
```
User Input (Text/Voice) → OpenAI Processing → Streaming Response

Text Flow:
├── User Types → Auto-Detect Language → OpenAI Chat → Stream Response

Voice Flow:
├── User Speaks → OpenAI Whisper → Language Auto-Detected → OpenAI Chat → OpenAI TTS → Audio Response
└── Fallback: Web Speech API → Language Detection → OpenAI Chat → Browser TTS
```
</architecture_patterns>

<performance_standards>
**PERFORMANCE REQUIREMENTS**:
- **Response Time**: <500ms for text, <2s for voice
- **Language Detection**: >95% accuracy for supported languages
- **Voice Recognition**: >90% accuracy for clear speech
- **Streaming**: 30ms per character typewriter effect
- **Mobile Performance**: Smooth on 3G networks
- **Accessibility**: Screen reader compatible, keyboard navigation
</performance_standards>

## 🚨 CRITICAL PROBLEMS TO SOLVE

<current_issues>
**IMMEDIATE BLOCKERS** (Must fix before any other work):

1. **Chat API Not Connected**
   - Problem: Frontend not connecting to OpenAI API
   - Symptoms: Random responses, no actual AI processing
   - Required Fix: Complete /api/chat/route.ts implementation

2. **Language Detection Broken**
   - Problem: Responses in random languages (English/Spanish/French mix)
   - Symptoms: User speaks Spanish, gets English response
   - Required Fix: Automatic language detection + forced same-language response

3. **Voice Recognition Failure**
   - Problem: "Failed to process your request" errors
   - Symptoms: Audio processing not working, no speech transcription
   - Required Fix: Complete OpenAI Whisper integration with Web Speech API fallback

4. **Manual Language Selector Present**
   - Problem: Language picker defeats the app's core purpose
   - Symptoms: Users can manually select language
   - Required Fix: Remove all manual language selection UI
</current_issues>

<zero_tolerance_requirements>
**THESE ARE COMPLETELY UNACCEPTABLE**:
- ❌ Partial implementations or "mostly working" features
- ❌ Manual language selection anywhere in the UI
- ❌ Responses in different language than user input
- ❌ Non-functional voice recognition
- ❌ API errors without proper user feedback
- ❌ Any "TODO" or "Coming soon" placeholders
- ❌ Broken mobile experience
- ❌ Accessibility violations
</zero_tolerance_requirements>

## 📋 STEP-BY-STEP IMPLEMENTATION PROTOCOL

<implementation_phases>
**PHASE 1: API Foundation (Priority 1)**
```markdown
OBJECTIVE: Get OpenAI chat working with language detection

TASKS:
1. Create /api/chat/route.ts with exact API key
2. Implement language detection function
3. Create system prompt that enforces same-language response
4. Test with: English, Spanish, French inputs
5. Validate API returns proper JSON structure

SUCCESS CRITERIA:
✅ POST to /api/chat returns 200 status
✅ English input → English response
✅ Spanish input → Spanish response  
✅ French input → French response
✅ Network tab shows successful API calls
```

**PHASE 2: Frontend Integration (Priority 2)**
```markdown
OBJECTIVE: Connect chat UI to working API

TASKS:
1. Create ChatInterface component with proper state management
2. Implement streaming response with typewriter effect
3. Add loading states and error handling
4. Style message bubbles with language indicators
5. Test end-to-end chat flow

SUCCESS CRITERIA:
✅ User can type message and see response
✅ Streaming typewriter effect works smoothly
✅ Language tags show on messages
✅ Error states display user-friendly messages
✅ Mobile responsive design works perfectly
```

**PHASE 3: Voice Recognition (Priority 3)**
```markdown
OBJECTIVE: Complete voice processing pipeline with comprehensive error handling

TASKS:
1. Implement VoiceRecognitionManager class with robust error handling
2. Create three-tier fallback system: OpenAI Whisper → Web Speech API → Manual Input
3. Handle all voice recognition errors gracefully (service-not-allowed, permissions, etc.)
4. Add proper microphone permission handling and user feedback
5. Test across different browsers and error scenarios

SUCCESS CRITERIA:
✅ Primary: OpenAI Whisper transcribes speech accurately with language auto-detection
✅ Fallback 1: Web Speech API works when Whisper fails (with HTTPS requirement)
✅ Fallback 2: Manual input prompt when both voice methods fail
✅ Error Handling: All voice errors show user-friendly messages with retry options
✅ Cross-Browser: Works on Chrome, Safari, Firefox, Edge with proper MIME type fallbacks
✅ Permissions: Handles microphone access denial gracefully
✅ Network: Handles API failures and timeouts properly
```

**PHASE 4: Polish & Production (Priority 4)**
```markdown
OBJECTIVE: Production-ready experience

TASKS:
1. Remove any remaining language selection UI
2. Optimize performance and error handling
3. Add comprehensive accessibility features
4. Implement proper SEO and metadata
5. Test exhaustively across devices/browsers

SUCCESS CRITERIA:
✅ Zero manual language selection anywhere
✅ Perfect mobile experience
✅ Screen reader accessibility
✅ Fast performance on slow networks
✅ Professional, polished UI
```
</implementation_phases>

## 🔧 EXACT IMPLEMENTATION SPECIFICATIONS

<language_detection_implementation>
**Enhanced Language Detection Algorithm (Supports 40+ Languages)**:
```typescript
// EXACT IMPLEMENTATION REQUIRED - Handles all major world scripts
function detectLanguage(text: string): string {
  const cleanText = text.toLowerCase().trim();
  
  // Unicode script detection (most reliable for non-Latin)
  const scriptPatterns = {
    // East Asian Scripts
    'zh': /[\u4e00-\u9fff]/,          // Chinese (CJK Unified Ideographs)
    'ja': /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/, // Japanese (Hiragana + Katakana + Kanji)
    'ko': /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/, // Korean (Hangul)
    
    // Middle Eastern Scripts  
    'ar': /[\u0600-\u06ff\u0750-\u077f]/,  // Arabic + Arabic Supplement
    'fa': /[\u0600-\u06ff\u0750-\u077f]/,  // Persian (uses Arabic script)
    'ur': /[\u0600-\u06ff\u0750-\u077f]/,  // Urdu (uses Arabic script)
    'he': /[\u0590-\u05ff]/,              // Hebrew
    
    // Indian Subcontinent Scripts
    'hi': /[\u0900-\u097f]/,              // Hindi (Devanagari)
    'bn': /[\u0980-\u09ff]/,              // Bengali
    'gu': /[\u0a80-\u0aff]/,              // Gujarati
    'ta': /[\u0b80-\u0bff]/,              // Tamil
    'te': /[\u0c00-\u0c7f]/,              // Telugu
    'th': /[\u0e00-\u0e7f]/,              // Thai
    
    // Other Scripts
    'ru': /[\u0400-\u04ff]/,              // Cyrillic (Russian, etc.)
    'el': /[\u0370-\u03ff]/,              // Greek
    'ka': /[\u10a0-\u10ff]/,              // Georgian
    'hy': /[\u0530-\u058f]/,              // Armenian
  };
  
  // Check script patterns first (most reliable for non-Latin)
  for (const [lang, pattern] of Object.entries(scriptPatterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  // Enhanced Latin script detection
  const latinPatterns = {
    'es': /\b(dónde|está|cuánto|cuesta|precio|ubicación|pasillo|¿|¡|el|la|los|las|qué|cómo|cuándo|gracias|hola)\b/i,
    'fr': /\b(où|est|combien|coûte|prix|emplacement|allée|le|la|les|que|comment|quand|merci|bonjour|ç|à|è|é)\b/i,
    'de': /\b(wo|ist|wieviel|kostet|preis|standort|gang|der|die|das|wie|wann|was|danke|hallo|ä|ö|ü|ß)\b/i,
    'it': /\b(dove|è|quanto|costa|prezzo|posizione|corridoio|il|la|i|le|che|come|quando|grazie|ciao)\b/i,
    'pt': /\b(onde|está|quanto|custa|preço|localização|corredor|o|a|os|as|que|como|quando|obrigado|olá|ã|õ)\b/i,
    'pl': /\b(gdzie|jest|ile|kosztuje|cena|jak|kiedy|co|dziękuję|cześć|ą|ć|ę|ł|ń|ó|ś|ź|ż)\b/i,
    'nl': /\b(waar|is|hoeveel|kost|prijs|hoe|wanneer|wat|dank je|hallo)\b/i,
    'sv': /\b(var|är|hur mycket|kostar|pris|hur|när|vad|tack|hej|å|ä|ö)\b/i,
  };
  
  // Check Latin script patterns
  for (const [lang, pattern] of Object.entries(latinPatterns)) {
    if (pattern.test(cleanText)) {
      return lang;
    }
  }
  
  return 'en'; // Default fallback
}
```
</language_detection_implementation>

<system_prompt_template>
**OpenAI System Prompt (CRITICAL - Use Exactly)**:
```typescript
function createSystemPrompt(detectedLanguage: string, catalogData: string): string {
  const languageNames = {
    // Latin Script Languages
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
    'it': 'Italian', 'pt': 'Portuguese', 'nl': 'Dutch', 'sv': 'Swedish',
    'no': 'Norwegian', 'da': 'Danish', 'pl': 'Polish', 'cs': 'Czech',
    'sk': 'Slovak', 'hr': 'Croatian', 'sl': 'Slovenian', 'ro': 'Romanian',
    'fi': 'Finnish', 'hu': 'Hungarian',
    
    // Non-Latin Script Languages
    'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean',
    'ar': 'Arabic', 'fa': 'Persian', 'ur': 'Urdu', 'he': 'Hebrew',
    'hi': 'Hindi', 'bn': 'Bengali', 'gu': 'Gujarati', 'pa': 'Punjabi',
    'ta': 'Tamil', 'te': 'Telugu', 'kn': 'Kannada', 'ml': 'Malayalam',
    'th': 'Thai', 'lo': 'Lao', 'my': 'Myanmar', 'km': 'Khmer',
    'ru': 'Russian', 'uk': 'Ukrainian', 'bg': 'Bulgarian', 'sr': 'Serbian',
    'el': 'Greek', 'ka': 'Georgian', 'hy': 'Armenian'
  };
  
  const langName = languageNames[detectedLanguage] || 'English';
  
  return `You MUST respond entirely in ${langName}. Never use any other language in your response.

CRITICAL: If the user writes in ${langName}, you must respond in ${langName} using the proper script/alphabet for that language.

You are Scan & Speak, a helpful multilingual shopping assistant. Your job is to help customers find products in stores.

CRITICAL RULES:
1. Respond ONLY in ${langName} language using its native script
2. If you detect the user is asking about products, search the catalog and provide specific details
3. Include product location (aisle/section) and price when available
4. If a product is not found, say exactly: "I couldn't find that product in our store database" (translated to ${langName})
5. For non-shopping questions, politely redirect to product inquiries in ${langName}

Product Catalog:
${catalogData}

Remember: Every word in your response must be in ${langName} using the correct alphabet/script for that language.`;
}
```
</system_prompt_template>

<file_structure_requirements>
**REQUIRED FILE STRUCTURE**:
```
src/
├── app/
│   ├── layout.tsx          # Root layout with SINGLE navigation
│   ├── page.tsx            # Landing page
│   ├── chat/
│   │   └── page.tsx        # Chat interface page
│   ├── voice/
│   │   └── page.tsx        # Voice interface page
│   └── api/
│       ├── chat/
│       │   └── route.ts    # OpenAI streaming chat endpoint
│       ├── speech/
│       │   └── route.ts    # OpenAI Whisper speech-to-text
│       └── tts/
│           └── route.ts    # OpenAI text-to-speech
├── components/
│   ├── ChatInterface.tsx   # Complete chat component
│   ├── VoiceInterface.tsx  # Complete voice component
│   └── Navigation.tsx      # Single navigation component
├── lib/
│   ├── openai.ts          # OpenAI client config (chat + whisper + tts)
│   ├── whisper.ts         # OpenAI Whisper speech-to-text
│   ├── tts.ts             # OpenAI text-to-speech
│   ├── language-detection.ts # Language detection logic
│   └── product-catalog.ts # Product search functionality
└── data/
    └── products.json      # Product database
```
</file_structure_requirements>

## 🧪 COMPREHENSIVE TESTING PROTOCOL

<testing_scenarios>
**MANDATORY TEST CASES** (Must pass before deployment):

**Language Detection Tests**:
```
1. English: "Where can I find milk?" → Detect 'en' → English response
2. Spanish: "¿Dónde está la leche?" → Detect 'es' → Spanish response
3. French: "Où est le lait?" → Detect 'fr' → French response
4. German: "Wo ist die Milch?" → Detect 'de' → German response
5. Chinese: "你好，我在哪里可以找到牛奶？" → Detect 'zh' → Chinese response
6. Arabic: "مرحبا، أين يمكنني العثور على الحليب؟" → Detect 'ar' → Arabic response  
7. Japanese: "こんにちは、牛乳はどこで見つけられますか？" → Detect 'ja' → Japanese response
8. Korean: "안녕하세요, 우유는 어디서 찾을 수 있나요？" → Detect 'ko' → Korean response
9. Hindi: "नमस्ते, मुझे दूध कहाँ मिल सकता है？" → Detect 'hi' → Hindi response
10. Russian: "Привет, где я могу найти молоко？" → Detect 'ru' → Russian response
11. Mixed: "Hello, ¿dónde está milk?" → Detect primary language → Respond in primary
```

**API Integration Tests**:
```
1. Network Test: POST /api/chat → 200 status + proper JSON
2. Streaming Test: Response streams with typewriter effect
3. Error Test: Invalid input → User-friendly error message
4. Performance Test: Response time <500ms for text queries
```

**Voice Recognition Tests**:
```
1. **Happy Path**: Voice recording → OpenAI Whisper → Accurate transcription → Chat response
2. **Whisper Fallback**: Voice recording → Whisper fails → Web Speech API → Transcription → Chat response
3. **Complete Fallback**: Voice recording → Whisper fails → Web Speech "service-not-allowed" → Manual input prompt
4. **Permission Denied**: Microphone blocked → User-friendly error → Text input alternative
5. **HTTPS Check**: Web Speech API on HTTP → Proper error message → Fallback to manual input
6. **Network Failure**: API timeout → Graceful error handling → Retry option
7. **Browser Support**: Safari MIME type → Auto-detection → Compatible format selection
8. **Language Test**: Spanish speech → Whisper detects Spanish → Spanish AI response
```

**UI/UX Tests**:
```
1. Mobile Responsive: Perfect experience on phone screens
2. Accessibility: Screen reader navigation works
3. Error States: Clear error messages with retry options
4. Loading States: Smooth loading indicators
5. No Language Selector: Zero manual language selection anywhere
```
</testing_scenarios>

<validation_checkpoints>
**VALIDATION CHECKPOINTS** (Check after each implementation):

**Checkpoint 1 - API Foundation**:
- [ ] /api/chat/route.ts exists and works
- [ ] Enhanced language detection function implemented (40+ languages)
- [ ] System prompt enforces same-language response with proper scripts
- [ ] OpenAI API key configured correctly with UTF-8 encoding
- [ ] JSON response structure correct
- [ ] Non-Latin scripts (Arabic, Chinese, etc.) detected properly

**Checkpoint 2 - Frontend Integration**:
- [ ] ChatInterface component renders properly
- [ ] User can type and send messages
- [ ] Streaming response with typewriter effect
- [ ] Language tags display on messages
- [ ] Error handling shows user-friendly messages

**Checkpoint 3 - Voice Processing**:
- [ ] AssemblyAI transcription working
- [ ] Web Speech API fallback implemented
- [ ] Microphone permission handling
- [ ] Voice input → Text → AI response flow complete
- [ ] Works across multiple languages

**Checkpoint 4 - Production Ready**:
- [ ] No manual language selection UI anywhere
- [ ] Mobile experience perfect
- [ ] Accessibility compliance verified
- [ ] Performance optimized
- [ ] Error handling comprehensive
</validation_checkpoints>

## 🎨 UI/UX SPECIFICATIONS

<design_requirements>
**Visual Design Standards**:
```css
/* Color Palette */
--primary: #28C6B1;        /* Teal accent */
--secondary: #F1F3F5;      /* Light gray */
--text-dark: #212529;      /* Dark text */  
--text-light: #F8F9FA;     /* Light text */
--error: #DC2626;          /* Error red */
--success: #10B981;        /* Success green */

/* Typography */
--font-primary: Inter, system-ui, sans-serif;
--font-size-base: 16px;
--line-height-base: 1.5;

/* Spacing Scale */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* Animations */
--transition-fast: 150ms ease;
--transition-normal: 300ms ease;
--transition-slow: 500ms ease;
```
</design_requirements>

<component_specifications>
**Message Bubble Specifications**:
```tsx
// User Message Bubble
<div className="bg-[#28C6B1] text-white rounded-lg px-4 py-2 max-w-sm ml-auto">
  <div className="text-xs opacity-75 mb-1">EN</div>
  <div className="text-sm">{message}</div>
</div>

// Assistant Message Bubble  
<div className="bg-[#F1F3F5] text-gray-800 rounded-lg px-4 py-2 max-w-sm">
  <div className="text-xs text-gray-500 mb-1">ES</div>
  <div className="text-sm">{message}</div>
</div>
```

**Voice Interface Specifications**:
```tsx
// Voice Button (80px diameter, center of screen)
<button className="w-20 h-20 bg-[#28C6B1] rounded-full flex items-center justify-center animate-pulse">
  <MicIcon className="w-8 h-8 text-white" />
</button>

// Listening State
<div className="text-center">
  <div className="text-lg font-medium">Listening...</div>
  <div className="text-sm text-gray-600">Detected: ES</div>
</div>
```
</component_specifications>

## 🚀 PERFORMANCE & OPTIMIZATION

<performance_requirements>
**Performance Benchmarks**:
- First Load: <2 seconds on 3G
- Chat Response: <500ms text input to AI response start
- Voice Processing: <2 seconds speech to AI response start
- Streaming: 30ms per character for typewriter effect
- Memory Usage: <50MB total app footprint
- Bundle Size: <250KB gzipped JavaScript
</performance_requirements>

<optimization_strategies>
**Required Optimizations**:
1. **Code Splitting**: Lazy load voice components
2. **API Optimization**: Stream responses, don't wait for complete response
3. **Image Optimization**: Use Next.js Image component with proper sizing
4. **Caching**: Cache product catalog, implement proper HTTP caching
5. **Error Recovery**: Retry failed requests with exponential backoff
</optimization_strategies>

## 🔐 SECURITY & PRIVACY

<security_requirements>
**Security Standards**:
- API keys in environment variables (never in client code)
- Input validation on all user inputs
- XSS prevention with proper sanitization
- CSRF protection on API routes
- HTTPS enforcement in production
- Content Security Policy headers
</security_requirements>

<privacy_requirements>
**Privacy Standards**:
- No persistent storage of user conversations
- Voice data processed in real-time, not stored
- No tracking or analytics without consent
- Clear privacy policy for voice processing
- GDPR compliance for EU users
</privacy_requirements>

## 🎯 SUCCESS METRICS & VALIDATION

<success_criteria>
**Technical Success Metrics**:
- ✅ 100% of test cases pass
- ✅ 95%+ language detection accuracy
- ✅ <500ms average response time
- ✅ Zero accessibility violations
- ✅ Perfect mobile experience scores
- ✅ No console errors in production

**User Experience Success Metrics**:
- ✅ Users can complete shopping queries without confusion
- ✅ Voice recognition works on first try 90%+ of time
- ✅ Language switching seamless and automatic
- ✅ Error recovery intuitive and helpful
- ✅ Overall experience feels polished and professional
</success_criteria>

## 🚨 EMERGENCY PROTOCOLS

<emergency_debugging>
**When Implementation Fails**:

1. **API Connection Issues**:
```bash
# Test API directly
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' \
  -v
```

2. **Language Detection Issues**:
   - Add console.log to detectLanguage function
   - Test with known phrases in target languages
   - Verify system prompt includes detected language

3. **Voice Recognition Issues**:
   - Check browser console for microphone permission errors
   - Verify OpenAI Whisper API: `curl -X POST /api/speech -F "file=@test.wav"`
   - Test "service-not-allowed" error: Check HTTPS requirement for Web Speech API
   - Verify fallback chain: Whisper → Web Speech → Manual Input
   - Check audio format compatibility and MIME type fallbacks
   - Validate error handling shows user-friendly messages

4. **Performance Issues**:
   - Use React DevTools Profiler
   - Check Network tab for slow API calls
   - Monitor memory usage in dev tools
</emergency_debugging>

---

## 🎯 IMPLEMENTATION PRIORITY ORDER

**Execute in this exact sequence:**

1. **FOUNDATION** (30 minutes): API route + language detection + system prompt
2. **INTEGRATION** (45 minutes): Chat UI + streaming + error handling  
3. **VOICE** (60 minutes): AssemblyAI + fallback + full voice flow
4. **POLISH** (30 minutes): Remove language selectors + final testing

**After each phase, validate against test cases before proceeding.**

Remember: This is not a learning exercise. This is production development. Every feature must work perfectly, handle all edge cases, and provide an exceptional user experience. No compromises, no shortcuts, no "good enough" solutions.

**Build it right. Build it complete. Build it now.** 🚀