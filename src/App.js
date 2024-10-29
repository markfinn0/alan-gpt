import React, { useState, useEffect } from 'react';
import { Container, Navbar, Button, Offcanvas, Form } from 'react-bootstrap';
import S3Uploader from './AWS/S3uploader';
import S3list from './AWS/S3showarchives';
import S3list_tochat from './AWS/S3showarchives_tochat';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatApp from './CHAT-GPT/gpt_reader'; // Certifique-se de corrigir o caminho
import AWS from 'aws-sdk';
import { BsArrowDownSquareFill } from "react-icons/bs";

function BasicExample() {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [fileContent, setFileContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [user_name, setUser_name] = useState('');
  const [isValidCode, setIsValidCode] = useState(false);
  const [isContextSelected, setIsContextSelected] = useState(false);
  
  const handleShowOffcanvas = () => setShowOffcanvas(true);
  const handleCloseOffcanvas = () => setShowOffcanvas(false);

  const handleShowModal = () => {
    // Reset attempts when opening modal
    setAttempts(0);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleFileNameChange = (selectedFileName) => {
    setFileName(selectedFileName);
  };

  const handleDeleteFile = async (code, fileName) => {
    const success = await deleteFileFromS3(code, fileName);

    if (success) {
      alert('Arquivo excluído com sucesso.');
      window.location.reload();
    } else {
      alert('Arquivo não encontrado ou erro ao excluir.');
    }
  };

  const deleteFileFromS3 = async (code, fileName) => {
    const accessKeyId = '';
    const secretAccessKey = '';
    const region = 'sa-east-1';
    const bucketName = 'poc-gpt-site';

    AWS.config.update({
      accessKeyId,
      secretAccessKey,
      region,
    });

    const s3 = new AWS.S3();

    try {
      // Get the list of objects in the bucket
      const data = await s3.listObjectsV2({ Bucket: bucketName }).promise();

      // Find the object with the provided file name in the key
      const objectToDelete = data.Contents.find((object) => {
        const objectKey = object.Key || '';
        const fileNameParts = objectKey.split('_');
        const objectFileName = fileNameParts[2]; // Get the third part (file name)
        const objectUserCode = fileNameParts[1]; // Get the second part (user code)
        return objectFileName === fileName.split('_')[2] && objectUserCode != code; // Compare file names and codes
      });

      if (objectToDelete) {
        // Print the object to be deleted in the console
        console.log('Object to delete:', objectToDelete);

        // Delete the object
        await s3.deleteObject({ Bucket: bucketName, Key: objectToDelete.Key }).promise();
        console.log('File deleted successfully.');
        window.location.reload();
        return true;
      } else {
        console.log('File not found or codes do not match.');
        return false; // Return false if no corresponding object is found or codes do not match
      }
    } catch (error) {
      console.error('Error deleting file from S3:', error.message || error);
      return false;
    }
  };

  const handleCheckCode = async () => {
    const isValidCode = await checkCodeInS3(verificationCode);
  
    if (isValidCode) {
      alert('Código válido! Contexto enviado para o Alan! Converse com ele!');
      setAttempts(0);
  
      const content = await getFileContentFromS3(fileName);
      setFileContent(content);
  
      // Baixa o conteúdo do arquivo e o envia como contexto para o ChatApp
      const fileText = await getFileContentFromS3(fileName);
  
      setUser_name(fileName.split('_')[0]);
  
      // Adiciona mensagem somente se o código for válido
      setMessages([...messages, { content: fileText, role: 'assistant' }]);
  
      // Atualiza o estado isContextSelected apenas se o código for válido
      setIsContextSelected(true);
    } else {
      setAttempts((prevAttempts) => prevAttempts + 1);
  
      if (attempts === 2) {
        handleCloseModal();
        await handleDeleteFile(verificationCode, fileName);
      } else {
        alert(`Código inválido! Você tem mais ${2 - attempts} tentativas.`);
      }
    }
  
    setIsValidCode(isValidCode);
  };

  const checkCodeInS3 = async (code) => {
    const accessKeyId = '';
    const secretAccessKey = '';
    const region = 'sa-east-1';
    const bucketName = 'poc-gpt-site';

    AWS.config.update({
      accessKeyId,
      secretAccessKey,
      region,
    });

    const s3 = new AWS.S3();

    try {
      // Get the list of objects in the bucket
      const data = await s3.listObjectsV2({ Bucket: bucketName }).promise();

      // Check if any object has a key that ends with the provided code
      const isValidCode = data.Contents.some((object) => {
        const objectKey = object.Key || '';
        const fileNameParts = objectKey.split('_');
        const objectFileName = fileNameParts[2]; // Get the third part (file name)
        const objectUserCode = fileNameParts[1]; // Get the second part (user code)
        return objectFileName === fileName.split('_')[2] && objectUserCode === code;

      });

      return isValidCode;
    } catch (error) {
      console.error('Erro ao verificar código no S3:', error.message || error);
      return false;
    }
  };
  const getFileContentFromS3 = async (fileName) => {
    const content = await getFileContentFromS3Function(fileName);
    return content;
  };

  const getFileContentFromS3Function = async (fileName) => {
    const accessKeyId = '';
    const secretAccessKey = '';
    const region = 'sa-east-1';
    const bucketName = 'poc-gpt-site';

    AWS.config.update({
      accessKeyId,
      secretAccessKey,
      region,
    });

    const s3 = new AWS.S3();

    try {
      const data = await s3.getObject({ Bucket: bucketName, Key: fileName }).promise();
      return data.Body.toString('utf-8');
    } catch (error) {
      console.error('Error getting file content from S3:', error.message || error);
      return '';
    }
  };

  
  return (
    <>
    <Navbar expand="sm" style={{backgroundColor: '#3a3a3a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0%'}}>
  <Button variant="primary" onClick={handleShowOffcanvas} style={{ backgroundColor: '#f1f1f1', border: 'none' ,marginLeft:'1%'}}>
    <BsArrowDownSquareFill style={{ backgroundColor: '#f1f1f1',color:'#3a3a3a',fontSize: '140%'}}/>
  </Button>
  <Navbar.Brand className="text-center" style={{
    color: 'white',
    margin: 'auto',
  }}>
    <img src={'/imgs/logo.png'} alt="Ícone do arquivo" style={{ width: '15%' }} />
  </Navbar.Brand>
</Navbar>

  
    <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Menu de Importação de Contexto</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body style={{ position: 'relative' }}>
        <div>Esses são os contextos upados pelos usuários disponíveis para o Alan aprender.</div>
        <div style={{ maxHeight: '80%', overflow: 'auto', marginTop: '5%' }}>
          <S3list />
        </div>
        <div style={{ position: 'absolute', bottom: '2%', left: '50%', transform: 'translateX(-50%)' }}>
          <Button variant="primary" onClick={handleShowModal} style={{ backgroundColor: '#3a3a3a', border: 'none' }}>
            Insira seu Contexto
          </Button>
          <S3Uploader showModal={showModal} handleCloseModal={handleCloseModal} onSuccess={handleCheckCode} />
        </div>
      </Offcanvas.Body>
      <div style={{ backgroundColor: '#3a3a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '5%' }}>
        <p style={{ color: 'white' }}>&copy; {new Date().getFullYear()} Desenvolvido por Marcus Vinicius</p>
      </div>
    </Offcanvas>
    <div style={{ display: 'flex', flexDirection: 'row', marginTop: '2%'}}>
  {/* Coluna da Esquerda */}
  <div style={{ display: 'flex', flexDirection: 'column', width: '15%', marginLeft: '1%' }}>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3302036671994916"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style={{display:'block'}}
     data-ad-client="ca-pub-3302036671994916"
     data-ad-slot="4663332374"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
  </div>

  {/* Coluna do Meio (Bloco Principal) */}
  <div style={{ display: 'flex', flexDirection: 'column', width: '80%', marginLeft: '1%', marginRight: '1%' }}>
    <Container style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2%' }}>
      <S3list_tochat onSelect={handleFileNameChange} />
      <Form.Control type="text" placeholder="Codigo Arquivo" value={verificationCode} onChange={handleVerificationCodeChange} style={{ marginLeft: '5%', width: '50%' }} />
      <Button variant="primary" onClick={handleCheckCode} style={{ backgroundColor: '#5dc3eb', border: 'none', fontSize: '80%', width: '30%', marginLeft: '5%' }}>
        Verificar Código
      </Button>
    </Container>

    <Container style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      {isContextSelected && (
        <ChatApp messages={messages} setMessages={setMessages} user_name={user_name} style={{ bottom: '2%' }} />
      )}
    </Container>
  </div>

  {/* Coluna da Direita */}
  <div style={{ display: 'flex', flexDirection: 'column', width: '15%', marginRight: '1%' }}>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3302036671994916"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style={{display:'block'}}
     data-ad-client="ca-pub-3302036671994916"
     data-ad-slot="5628929680"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
  </div>
</div>

  </>
  

  );
}

export default BasicExample;