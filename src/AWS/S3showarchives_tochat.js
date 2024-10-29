import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import Form from 'react-bootstrap/Form';

const S3FileList = ({ onSelect }) => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFileList = async () => {
    try {
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

      const params = {
        Bucket: bucketName,
      };

      const data = await s3.listObjectsV2(params).promise();

      const files = data.Contents.map((object) => object.Key);
      setFileList(files);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao listar objetos:', error.message || error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileList();
  }, []); // Chama ao montar o componente

  const formatFileName = (fileName) => {
    // Extrai o nome e o código do arquivo
    const [name, code, ...rest] = fileName.split('_');

    // Junta o restante do nome (o que pode conter "_") e retorna
    return rest.join('_');
  };

  const handleFileSelect = (event) => {
    const selectedFileName = event.target.value;
    onSelect(selectedFileName);
  };

  return (
    <Form.Select aria-label="Lista de Arquivos" onChange={handleFileSelect}>
      <option>Selecione um arquivo</option>
      {fileList.map((fileName) => (
        <option key={fileName} value={fileName}>
          {"Usuário: "+fileName.split('_')[0]+" Arquivo:"+fileName.split('_')[2]}
        </option>
      ))}
    </Form.Select>
  );
};

export default S3FileList;
