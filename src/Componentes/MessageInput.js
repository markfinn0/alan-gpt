// src/components/MessageInput.js
import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
const MessageInput = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() !== '') {
      onSend(text, 'user');
      setText('');
    }
  };

  return (
    <div>
        <Container>
        <Form.Label htmlFor="inputPassword5">Como o Sensei pode te ajudar?</Form.Label>
      <Form.Control
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Form.Text id="passwordHelpBlock" muted>
        Your password must be 8-20 characters long, contain letters and numbers,
        and must not contain spaces, special characters, or emoji.
      </Form.Text>
      <button onClick={handleSend}>Enviar</button>
        </Container>

    </div>
  );
};

export default MessageInput;


