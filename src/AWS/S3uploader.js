import React, { useState } from 'react';
import AWS from 'aws-sdk';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const S3Uploader = ({ showModal, handleCloseModal }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Verificar a extensão do arquivo
    if (file && file.name.endsWith('.txt')) {
      setSelectedFile(file);
    } else {
      alert('Selecione um arquivo com extensão .txt');
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
  
    // Restringir o nome do arquivo a no máximo 20 caracteres
    if (newName.length <= 20) {
      // Substituir caracteres indesejados apenas no nome do usuário
      const sanitizedName = newName.replace(/[_Çç]/g, ''); // Remover "_" e "Ç" do nome
      setName(sanitizedName);
    } else {
      alert('O nome do arquivo deve ter no máximo 20 caracteres.');
    }
  };
  
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
  
    // Substituir caracteres indesejados
    const sanitizedCode = newCode.replace(/[_Çç]/g, ''); // Remover "_" e "Ç" do código
    setCode(sanitizedCode);
  };

  const handleUpload = async () => {
    if (!selectedFile || !name || !code) {
      alert('Preencha todos os campos antes de fazer o upload.');
      return;
    }
  
    // Verificar se o nome ou código contém "_" ou "Ç"
    if (name.includes('_') || name.includes('Ç') || name.includes('ç') || code.includes('_') || code.includes('Ç') || code.includes('ç')) {
      alert('O nome do arquivo e código não devem conter "_" ou "Ç".');
      return;
    }
  
    setUploading(true);
  
  
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
  
    // Adicionar nome e código ao nome do arquivo
    const fileName = `${name}_${code}_${selectedFile.name.replace(/_/g, ' ')}`;
  
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: selectedFile,
    };
  
    try {
      if (selectedFile.size > 5 * 1024 * 1024) {
        await uploadMultipart(s3, params);
      } else {
        await s3.upload(params).promise();
      }
      alert('Upload bem-sucedido!');
      // Recarregar a página após o upload bem-sucedido
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer upload:', error.message || error);
      alert('Erro ao fazer upload. Verifique o console para mais detalhes.');
    } finally {
      setUploading(false);
    }
  };
  

  const uploadMultipart = async (s3, params) => {
    const { name, size } = selectedFile;
    const uploadId = (await s3.createMultipartUpload(params).promise()).UploadId;
    const partSize = 5 * 1024 * 1024;

    try {
      const numParts = Math.ceil(size / partSize);
      const parts = [];

      for (let i = 0; i < numParts; i++) {
        const start = i * partSize;
        const end = Math.min(start + partSize, size);

        const partParams = {
          Body: selectedFile.slice(start, end),
          Bucket: params.Bucket,
          Key: params.Key,
          PartNumber: i + 1,
          UploadId: uploadId,
        };

        const data = await s3.uploadPart(partParams).promise();
        parts.push({ ETag: data.ETag, PartNumber: i + 1 });
      }

      await s3.completeMultipartUpload({
        Bucket: params.Bucket,
        Key: params.Key,
        MultipartUpload: { Parts: parts },
        UploadId: uploadId,
      }).promise();
    } catch (error) {
      console.error('Erro ao fazer upload multipartido:', error.message || error);
      await s3.abortMultipartUpload({
        Bucket: params.Bucket,
        Key: params.Key,
        UploadId: uploadId,
      }).promise();
      throw error;
    }
  };

  return (
    <Modal show={showModal} animation={false}>
      <Modal.Header>
        <Modal.Title>Upload de Arquivo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formName">
            <Form.Label style={{marginTop:'2%'}}>Nome</Form.Label>
            <Form.Control type="text" placeholder="Digite seu nome" onChange={handleNameChange} />
          </Form.Group>
          <Form.Group controlId="formCode">
            <Form.Label style={{marginTop:'2%'}}>Código</Form.Label>
            <Form.Control type="text" placeholder="Digite seu código" onChange={handleCodeChange} />
          </Form.Group>
        </Form>
        <input type="file" onChange={handleFileChange} accept=".txt" style={{marginTop:'5%'}} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleUpload} disabled={uploading} style={{backgroundColor:'#5dc3eb', border:'none'}}>
          Upload
        </Button>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default S3Uploader;
