// src/components/Message.js
import React from 'react';

const Message = ({ text, sender }) => {
  return (
    <div>
      <strong>{sender}: </strong>
      <span>{text}</span>
    </div>
  );
};

export default Message;
