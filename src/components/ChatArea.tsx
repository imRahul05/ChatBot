import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface ChatAreaProps {
  darkMode: boolean;
  currentChatId: string | null;
  supabase: any;
  createNewChat: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ darkMode, currentChatId, supabase, createNewChat }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    if (currentChatId) {
      fetchChatHistory(currentChatId);
    } else {
      setChatHistory([]);
    }
  }, [currentChatId]);

  const fetchChatHistory = async (chatId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatHistory(data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Failed to load chat history. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        let chatId = currentChatId;
        if (!chatId) {
          await createNewChat();
          chatId = currentChatId;
        }

        // Save user message
        const { data: userData, error: userError } = await supabase
          .from('chat_messages')
          .insert({ chat_id: chatId, content: message, is_user: true })
          .select();

        if (userError) throw userError;

        setMessage('');
        setChatHistory([...chatHistory, userData[0]]);

        // Get AI response using Google Gemini API
        const aiResponse = await getAIResponse(message);

        // Save AI response
        const { data: aiData, error: aiError } = await supabase
          .from('chat_messages')
          .insert({ chat_id: chatId, content: aiResponse, is_user: false })
          .select();

        if (aiError) throw aiError;

        setChatHistory([...chatHistory, userData[0], aiData[0]]);
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message. Please try again.');
      }
    }
  };

  const getAIResponse = async (userMessage) => {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    try {
      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  };

  const handleEditMessage = async (messageId) => {
    if (editedContent.trim() !== '') {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .update({ content: editedContent })
          .eq('id', messageId)
          .select();

        if (error) throw error;

        setChatHistory(chatHistory.map(msg => 
          msg.id === messageId ? { ...msg, content: editedContent } : msg
        ));
        setEditingMessageId(null);
        setEditedContent('');
      } catch (err) {
        console.error('Error updating message:', err);
        setError('Failed to update message. Please try again.');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-700">
      <div className="flex-1 overflow-y-auto p-4">
        {chatHistory.map((chat) => (
          <div
            key={chat.id}
            className={`mb-4 ${
              chat.is_user ? 'text-right' : 'text-left'
            }`}
          >
            {editingMessageId === chat.id ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                <button
                  onClick={() => handleEditMessage(chat.id)}
                  className="ml-2 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <div
                className={`inline-block p-2 rounded-lg ${
                  chat.is_user
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white'
                }`}
                onClick={() => {
                  if (chat.is_user) {
                    setEditingMessageId(chat.id);
                    setEditedContent(chat.content);
                  }
                }}
              >
                {chat.content}
              </div>
            )}
          </div>
        ))}
        {error && (
          <div className="text-center text-red-500 mt-4">{error}</div>
        )}
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Message AI-Converso..."
            className="flex-1 p-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 rounded-r-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;