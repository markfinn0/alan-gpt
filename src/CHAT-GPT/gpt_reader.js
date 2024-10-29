import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Navbar, Button, Offcanvas, Form, Spinner } from 'react-bootstrap';

const Message = ({ text, sender, user_name }) => {
  const messageStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: sender === 'assistant' ? 'flex-start' : 'flex-end',
  };

  const nameStyle = {
    marginBottom: '4px',
    marginLeft: '8px',
    marginRight: '8px',
    color: sender === 'assistant' ? '#2196F3' : '#4CAF50', // Cor diferente para Alan e User
  };

  const boxStyle = {
    backgroundColor: sender === 'assistant' ? '#f4f4f4' : '#f0f8ff', // Cor diferente para Alan e User
    borderRadius: '8px',
    padding: '8px',
    marginBottom: '8px',
  };

  return (
    <div style={messageStyle}>
      <strong style={nameStyle}>
        {sender === 'assistant' ? 'Alan' : (sender === 'user' ? user_name : sender)}
      </strong>
      <div style={boxStyle}>
        {text}
      </div>
    </div>
  );
};

const ChatApp = ({ messages, setMessages, user_name }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  

  const handleSend = async () => {
    if (text.trim() === '') return;

    setLoading(true);

    try {
      const userMessage = { content: text, role: 'user' };
      const updatedMessages = [...messages, userMessage];

      const apiKey = '';

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: updatedMessages,
        }),
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
      const data = await response.json();

      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        setMessages([...updatedMessages, { content: data.choices[0].message.content, role: 'assistant' }]);
      } else {
        console.error('Resposta inválida do modelo:', data);
      }

      setText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', height: '75vh'}}>
      <Container style={{ overflow: 'auto', flex: 1 }}>
      <div>
      {messages
        .filter((message, index) => (index > 0))
        .map((message, index) => (
          <Message key={index} text={message.content} sender={message.role} user_name={user_name} />
        ))}
    </div>
        {loading && (
          <div style={{ textAlign: 'center' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <span> Aguardando resposta do Alan...</span>
          </div>
        )}
      </Container>

      <Form.Label htmlFor="inputPassword5" style={{ marginTop: '1%', marginLeft: '1%' }}>
        Como o Alan pode te ajudar?
      </Form.Label>
      <Container style={{ display: 'flex', flexDirection: 'row' }}>
        <Form.Control type="text" value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1, marginRight: '2%' }} />
        <Button variant="primary" onClick={handleSend} style={{ backgroundColor: '#3a3a3a', border: 'none' }}>
          Enviar
        </Button>
      </Container>

      <Form.Text id="passwordHelpBlock" muted style={{ marginLeft: '1%' }}>
        Converse com o Alan sobre o contexto disponibilizado.
      </Form.Text>
    </Container>
  );
};

export default ChatApp;
