import React from 'react';
import { MessageSquare, Compass, Settings, PlusCircle } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  darkMode: boolean;
  chats: any[];
  selectChat: (chatId: string) => void;
  createNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, darkMode, chats, selectChat, createNewChat }) => {
  const sidebarItems = [
    { icon: <MessageSquare size={20} />, text: 'AI-Converso' },
    { icon: <Compass size={20} />, text: 'Explore' },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-0'
      } transition-all duration-300 ease-in-out overflow-hidden bg-gray-900 text-white flex flex-col`}
    >
      <div className="p-4">
        <button onClick={toggleSidebar} className="text-white mb-4">
          {isOpen ? '←' : '→'}
        </button>
        {sidebarItems.map((item, index) => (
          <div key={index} className="flex items-center mb-4 cursor-pointer hover:bg-gray-800 p-2 rounded">
            {item.icon}
            <span className="ml-2">{item.text}</span>
          </div>
        ))}
        <button
          onClick={createNewChat}
          className="w-full flex items-center justify-center p-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
        >
          <PlusCircle size={20} className="mr-2" />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-2">Recent Chats</h3>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className="mb-2 cursor-pointer hover:bg-gray-800 p-2 rounded text-sm"
            >
              {chat.title}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center cursor-pointer hover:bg-gray-800 p-2 rounded">
          <Settings size={20} />
          <span className="ml-2">Settings</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;