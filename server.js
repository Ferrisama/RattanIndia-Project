const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { WebSocket } = require("ws");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Store active connections
const activeConnections = new Map();

// Gemini Live API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-live-001";

// System instructions for Revolt Motors
const SYSTEM_INSTRUCTIONS = `You are Rev, the AI assistant for Revolt Motors, India's leading electric motorcycle company. Your role is to help customers with:

1. Information about Revolt electric motorcycles (RV400, RV1, RV1+)
2. Booking and purchasing processes
3. Service and maintenance queries
4. Technical specifications and features
5. Pricing and financing options
6. Charging infrastructure and battery information
7. Dealership locations and test rides

Key information about Revolt Motors:
- Founded to revolutionize urban mobility with smart electric motorcycles
- Flagship models: RV400 (premium), RV1 series (affordable)
- Features: AI-enabled, connected motorcycles with mobile app integration
- Swappable battery technology for convenient charging
- Pan-India presence with experience centers and service networks

Always be helpful, enthusiastic about electric mobility, and focus on Revolt Motors products and services. If asked about competitors or unrelated topics, politely redirect the conversation back to Revolt Motors. Keep responses concise and conversational for voice interaction.`;

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("start-voice-session", async (data) => {
    console.log("Starting voice session for:", socket.id);

    try {
      // Initialize Gemini Live connection
      const geminiWs = new WebSocket(
        `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`
      );

      // Store the connection
      activeConnections.set(socket.id, {
        geminiWs,
        socket,
        sessionActive: true,
      });

      geminiWs.on("open", () => {
        console.log("Gemini WebSocket connected");

        // Send initial configuration
        const setupMessage = {
          setup: {
            model: `models/${GEMINI_MODEL}`,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede",
                  },
                },
              },
            },
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTIONS }],
            },
          },
        };

        geminiWs.send(JSON.stringify(setupMessage));
        socket.emit("voice-session-ready");
      });

      geminiWs.on("message", (data) => {
        try {
          const message = JSON.parse(data);

          if (message.serverContent) {
            // Handle different types of server content
            if (message.serverContent.modelTurn) {
              const turn = message.serverContent.modelTurn;

              // Handle audio response
              if (turn.parts) {
                turn.parts.forEach((part) => {
                  if (
                    part.inlineData &&
                    part.inlineData.mimeType === "audio/pcm"
                  ) {
                    socket.emit("audio-response", {
                      audio: part.inlineData.data,
                      mimeType: part.inlineData.mimeType,
                    });
                  }

                  if (part.text) {
                    socket.emit("text-response", {
                      text: part.text,
                    });
                  }
                });
              }
            }

            if (message.serverContent.turnComplete) {
              socket.emit("turn-complete");
            }
          }

          if (message.setupComplete) {
            console.log("Gemini setup complete");
            socket.emit("setup-complete");
          }
        } catch (error) {
          console.error("Error parsing Gemini message:", error);
        }
      });

      geminiWs.on("error", (error) => {
        console.error("Gemini WebSocket error:", error);
        socket.emit("voice-error", { error: "Connection error" });
      });

      geminiWs.on("close", () => {
        console.log("Gemini WebSocket closed");
        activeConnections.delete(socket.id);
      });
    } catch (error) {
      console.error("Error starting voice session:", error);
      socket.emit("voice-error", { error: "Failed to start voice session" });
    }
  });

  socket.on("send-audio", (data) => {
    const connection = activeConnections.get(socket.id);
    if (connection && connection.geminiWs.readyState === WebSocket.OPEN) {
      const audioMessage = {
        clientContent: {
          turns: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "audio/pcm",
                    data: data.audio,
                  },
                },
              ],
            },
          ],
          turnComplete: true,
        },
      };

      connection.geminiWs.send(JSON.stringify(audioMessage));
    }
  });

  socket.on("send-text", (data) => {
    const connection = activeConnections.get(socket.id);
    if (connection && connection.geminiWs.readyState === WebSocket.OPEN) {
      const textMessage = {
        clientContent: {
          turns: [
            {
              role: "user",
              parts: [
                {
                  text: data.text,
                },
              ],
            },
          ],
          turnComplete: true,
        },
      };

      connection.geminiWs.send(JSON.stringify(textMessage));
    }
  });

  socket.on("interrupt-ai", () => {
    console.log("AI interrupted by user:", socket.id);
    const connection = activeConnections.get(socket.id);
    if (connection && connection.geminiWs.readyState === WebSocket.OPEN) {
      // Send interrupt signal to Gemini
      const interruptMessage = {
        clientContent: {
          turns: [],
          turnComplete: true,
        },
      };
      connection.geminiWs.send(JSON.stringify(interruptMessage));
    }
  });

  socket.on("end-voice-session", () => {
    console.log("Ending voice session for:", socket.id);
    const connection = activeConnections.get(socket.id);
    if (connection) {
      connection.sessionActive = false;
      if (connection.geminiWs.readyState === WebSocket.OPEN) {
        connection.geminiWs.close();
      }
      activeConnections.delete(socket.id);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const connection = activeConnections.get(socket.id);
    if (connection) {
      if (connection.geminiWs.readyState === WebSocket.OPEN) {
        connection.geminiWs.close();
      }
      activeConnections.delete(socket.id);
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API endpoint to test Gemini connection
app.get("/api/test-gemini", (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  res.json({
    status: "API key configured",
    model: GEMINI_MODEL,
    websocketEndpoint: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY.substring(
      0,
      10
    )}...`,
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Gemini Model: ${GEMINI_MODEL}`);
  console.log(`API Key configured: ${GEMINI_API_KEY ? "Yes" : "No"}`);
});
