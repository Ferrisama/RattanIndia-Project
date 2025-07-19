# Revolt Motors Voice Assistant

A real-time conversational voice interface built with the Gemini Live API, replicating the functionality of the Revolt Motors chatbot with enhanced features.

## Features

-  **Real-time Voice Interaction**: Low-latency voice communication with Gemini Live API
-  **Interruption Support**: Users can interrupt the AI while speaking
-  **Multi-language Support**: Supports various languages through Gemini's capabilities
-  **Server-to-Server Architecture**: Uses WebSocket connections for optimal performance
-  **Revolt Motors Focused**: AI assistant specifically trained on Revolt Motors information
-  **Responsive UI**: Clean, modern interface with audio visualization
-  **Mobile Friendly**: Works on both desktop and mobile devices

## Technical Architecture

### Backend (Node.js/Express)
- **WebSocket Server**: Socket.IO for real-time client communication
- **Gemini Live Integration**: Direct WebSocket connection to Gemini Live API
- **Audio Processing**: Handles PCM audio encoding/decoding
- **Session Management**: Manages multiple concurrent voice sessions

### Frontend (HTML/CSS/JavaScript)
- **Voice Recording**: MediaRecorder API for high-quality audio capture
- **Real-time Communication**: Socket.IO client for bidirectional messaging
- **Audio Visualization**: Dynamic visual feedback during recording/playback
- **Responsive Design**: Modern UI with glassmorphism effects

## Quick Start

### 1. Prerequisites
- Node.js (>=16.0.0)
- NPM or Yarn
- Modern web browser with microphone access

### 2. Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a free account
3. Navigate to "Get API Key"
4. Create a new API key
5. Copy the key for configuration

### 3. Installation
```bash
# Clone the repository
git clone <repository-url>
cd revolt-motors-voice-assistant

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env file and add your Gemini API key
```

### 4. Configuration
Edit the `.env` file:
```bash
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-2.0-flash-live-001
PORT=3000
NODE_ENV=development
```

### 5. Run the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 6. Access the Application
Open your browser and go to: `http://localhost:3001`

## Model Selection Guide

### For Development & Testing
- **gemini-2.0-flash-live-001**: Higher rate limits, good for extensive testing
- **gemini-live-2.5-flash-preview**: Alternative with good performance

### For Production
- **gemini-2.5-flash-preview-native-audio-dialog**: Optimal audio quality but strict rate limits

## Usage Instructions

### Voice Interaction
1. **Grant Microphone Permission**: Allow browser access to your microphone
2. **Hold to Speak**: Click and hold the microphone button while speaking
3. **Release to Send**: Release the button to send your audio message
4. **Listen to Response**: The AI will respond with both text and audio

### Controls
- **🎤 Microphone Button**: Hold to record your voice message
- **⏸ Stop Button**: Interrupt the AI while it's speaking
- ** End Button**: Terminate the current voice session

### Keyboard Shortcuts
- **Spacebar**: Hold to record (same as microphone button)

## System Instructions

The AI assistant is configured with comprehensive knowledge about Revolt Motors:

### Core Topics Covered
- **Product Information**: RV400, RV1, RV1+ specifications and features
- **Booking & Sales**: Purchase process, pricing, financing options
- **Service & Support**: Maintenance, warranty, troubleshooting
- **Technical Details**: Battery technology, charging infrastructure
- **Company Information**: Dealership locations, test rides, contact details

### Conversation Style
- Natural, conversational tone optimized for voice interaction
- Concise responses suitable for audio delivery
- Enthusiastic about electric mobility and Revolt Motors
- Redirects off-topic questions back to Revolt Motors

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Test Gemini Connection
```
GET /api/test-gemini
```
Verifies API key configuration and model settings.

## WebSocket Events

### Client to Server
- `start-voice-session`: Initialize new voice session
- `send-audio`: Send audio data to AI
- `send-text`: Send text message to AI
- `interrupt-ai`: Interrupt AI response
- `end-voice-session`: Terminate session

### Server to Client
- `voice-session-ready`: Session initialized successfully
- `audio-response`: AI audio response
- `text-response`: AI text response
- `turn-complete`: AI finished speaking
- `voice-error`: Error occurred

## Performance Optimizations

### Low Latency Features
- **Direct WebSocket Connection**: Eliminates HTTP overhead
- **Efficient Audio Encoding**: Optimized PCM format
- **Streaming Responses**: Real-time audio playback
- **Connection Pooling**: Reuse WebSocket connections

### Resource Management
- **Memory Efficient**: Proper cleanup of audio resources
- **Connection Limits**: Prevents server overload
- **Error Recovery**: Graceful handling of network issues

## Troubleshooting

### Common Issues

**Microphone Not Working**
- Ensure browser permissions are granted
- Check microphone hardware and drivers
- Try refreshing the page

**High Latency**
- Check internet connection quality
- Verify server location and load
- Consider switching to development model

**API Rate Limits**
- Switch to development model for testing
- Monitor usage in Google AI Studio
- Implement request queuing if needed

**Audio Quality Issues**
- Ensure quiet environment for recording
- Check browser audio settings
- Verify microphone quality

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## Production Deployment

### Environment Setup
1. Use production Gemini model
2. Set appropriate rate limiting
3. Configure HTTPS for secure WebSocket connections
4. Set up proper error logging and monitoring

### Security Considerations
- Validate all WebSocket messages
- Implement rate limiting per user
- Use environment variables for sensitive data
- Regular security updates for dependencies

### Scaling Considerations
- Use load balancer for multiple server instances
- Implement Redis for session management
- Consider CDN for static assets
- Monitor resource usage and optimize accordingly

## Development Notes

### Testing Strategy
- Use development models for extensive testing
- Test interruption functionality thoroughly
- Verify multi-language support
- Test mobile responsiveness

### Code Structure
- Modular design for easy maintenance
- Clear separation of concerns
- Comprehensive error handling
- Detailed logging for debugging

## License

MIT License - See LICENSE file for details.

## Support

For issues related to:
- **Gemini API**: Check [Google AI Studio Documentation](https://aistudio.google.com/)
- **Application Issues**: Create an issue in the repository
- **Revolt Motors Information**: Visit [Revolt Motors Website](https://www.revoltmotors.com/)

---

**Note**: This implementation focuses on replicating the core functionality of the Revolt Motors voice assistant while providing a foundation for further customization and enhancement.
