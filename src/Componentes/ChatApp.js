// src/components/ChatApp.js
import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);

  const addMessage = (text, sender) => {
    setMessages([...messages, { text, sender }]);
  };

  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={addMessage} />
    </div>
  );
};

export default ChatApp;
