import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { api } from '../services/api';

export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    try {
      const response = await api.get(`/chat/history/${user.user_id}?limit=20`);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const sendMessage = async (formData) => {
    try {
      setLoading(true);
      
      // Add user message to UI immediately if it's text
      const messageText = formData.get('message');
      const userId = formData.get('userId');
      const hasImage = formData.get('image') !== null && formData.get('image').size > 0;
      
      if (messageText) {
        const userMessage = {
          message_content: messageText,
          sender_type: 'user',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
      }

      // Validate inputs
      if (!userId) {
        throw new Error('ID utilisateur manquant');
      }

      if (!messageText && !hasImage) {
        throw new Error('Message ou image requis');
      }

      // Determine which endpoint to use and prepare data accordingly
      let response;
      if (hasImage) {
        // Validate image file
        const imageFile = formData.get('image');
        if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error('Image trop volumineuse (max 10MB)');
        }
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
          throw new Error('Format d\'image non supporté (JPEG, PNG, WebP uniquement)');
        }

        // Send as FormData for image uploads
        response = await api.post('/chat/message/image', formData);
      } else {
        // Send as JSON for text-only messages
        response = await api.post('/chat/message', {
          userId: userId,
          message: messageText
        });
      }

      if (response && response.success) {
        // Add AI response to UI
        const aiMessage = {
          message_content: response.response,
          sender_type: 'ai',
          timestamp: new Date().toISOString(),
          metadata: response.analysis
        };
        setMessages(prev => [...prev, aiMessage]);

        // Trigger dashboard refresh if meal was saved
        if (response.analysis && response.analysis.aliments && response.analysis.aliments.length > 0) {
          // Dispatch custom event to notify dashboard
          window.dispatchEvent(new CustomEvent('mealSaved', { 
            detail: { analysis: response.analysis } 
          }));
        }
      } else {
        throw new Error(response?.error || 'Réponse invalide du serveur');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Show specific error message
      let errorText = 'Désolé, une erreur est survenue. Veuillez réessayer.';
      
      if (error.message.includes('fetch')) {
        errorText = 'Problème de connexion. Vérifiez votre connexion internet.';
      } else if (error.message.includes('Image')) {
        errorText = error.message;
      } else if (error.message.includes('ID utilisateur')) {
        errorText = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.message.includes('OpenAI') || error.message.includes('API')) {
        errorText = 'Service d\'analyse temporairement indisponible. Réessayez dans quelques instants.';
      }
      
      const errorMessage = {
        message_content: errorText,
        sender_type: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    sendMessage,
    clearChat,
    refreshHistory: fetchChatHistory
  };
};
