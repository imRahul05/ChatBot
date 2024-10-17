import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { createClient } from '@supabase/supabase-js';
import { Moon, Sun } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChats(data);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats. Please try again later.');
    }
  };

  const createNewChat = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({ title: 'New Chat' })
        .select()
        .single();

      if (error) throw error;
      setChats([data, ...chats]);
      setCurrentChatId(data.id);
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError('Failed to create a new chat. Please try again.');
    }
  };

  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        chats={chats}
        selectChat={selectChat}
        createNewChat={createNewChat}
      />
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center">
          <button onClick={toggleSidebar} className="text-gray-600 dark:text-gray-300">
            {sidebarOpen ? '←' : '→'}
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI-Converso</h1>
          <button onClick={toggleDarkMode} className="text-gray-600 dark:text-gray-300">
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>
        {error ? (
          <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>
        ) : (
          <ChatArea
            darkMode={darkMode}
            currentChatId={currentChatId}
            supabase={supabase}
            createNewChat={createNewChat}
          />
        )}
      </div>
    </div>
  );
}

export default App;