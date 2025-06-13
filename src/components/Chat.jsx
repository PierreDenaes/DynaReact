import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';

const Chat = () => {
  const { user } = useAuth();
  const { messages, sendMessage, loading } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const formRef = useRef(null);
  const shouldAutoSubmit = useRef(false);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInputMessage(transcript);
        
        // If this is a final result, prepare for auto-submit
        if (event.results[0].isFinal && transcript.trim()) {
          shouldAutoSubmit.current = true;
          recognitionRef.current.stop();
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Auto-submit the message if there's content
        if (shouldAutoSubmit.current) {
          shouldAutoSubmit.current = false;
          setTimeout(() => {
            if (formRef.current) {
              formRef.current.requestSubmit();
            }
          }, 100);
        }
      };
    }

    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speak the AI response
  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender_type === 'ai') {
        speakText(lastMessage.message_content);
      }
    }
  }, [messages, voiceEnabled]);

  const speakText = async (text) => {
    if (!voiceEnabled) return;

    try {
      // Cancel any ongoing browser speech
      if (synthRef.current) {
        synthRef.current.cancel();
      }

      // Get auth token
      const token = localStorage.getItem('dynprot_token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Request TTS from OpenAI via server
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/chat/speech`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio element
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      
      // Play the audio
      await audio.play();
      console.log('Playing OpenAI TTS audio');

      // Clean up URL after playback
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });

    } catch (error) {
      console.error('TTS error:', error);
      // Fallback to browser TTS if available
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        synthRef.current.speak(utterance);
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() && !selectedImage) return;

    const formData = new FormData();
    formData.append('userId', user.user_id);
    formData.append('message', inputMessage);
    
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    // Stop any ongoing speech recognition
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    await sendMessage(formData);
    setInputMessage('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const quickSuggestions = [
    "Où j'en suis ?",
    "J'ai mangé du poulet",
    "Nouvel objectif 150g",
    "Conseils protéines"
  ];

  const handleQuickSuggestion = (suggestion) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🤖</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assistant DynProt</h2>
              <p className="text-sm text-gray-600">Votre coach personnel en protéines</p>
            </div>
          </div>
          {speechSupported && (
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
                  voiceEnabled 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={voiceEnabled ? 'Désactiver la voix' : 'Activer la voix'}
              >
                <span>{voiceEnabled ? '🔊' : '🔇'}</span>
                <span className="text-xs font-medium">
                  {voiceEnabled ? 'Son activé' : 'Son coupé'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Salut {user?.prenom} !
            </h3>
            <p className="text-gray-600 mb-4">
              Je suis là pour t'aider à suivre tes protéines. Tu peux :
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {[
                { icon: '📝', text: 'Décrire tes repas' },
                { icon: '📸', text: 'Envoyer des photos' },
                { icon: '📊', text: 'Voir tes progrès' },
                { icon: '🎯', text: 'Modifier tes objectifs' }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
            {speechSupported && (
              <p className="text-sm text-gray-500 mt-4">
                🎤 Utilisez le microphone pour parler à l'assistant
              </p>
            )}
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.message_content}</div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-1">
                <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full"></div>
                <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Suggestions rapides :</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickSuggestion(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview */}
      {selectedImage && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
            <div className="flex items-center">
              <div className="text-2xl mr-2">📷</div>
              <span className="text-sm text-gray-700">{selectedImage.name}</span>
            </div>
            <button
              onClick={() => {
                setSelectedImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Voice Recording Indicator */}
      {isListening && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex items-center justify-center bg-red-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">Écoute en cours...</span>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="border-t border-gray-200 p-4">
        <form ref={formRef} id="chat-form" onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            📷
          </button>

          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              disabled={loading}
            >
              🎤
            </button>
          )}

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Décris ton repas ou pose une question..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || (!inputMessage.trim() && !selectedImage)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
          >
            {loading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              '➤'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
