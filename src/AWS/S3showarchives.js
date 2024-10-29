import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';

const S3FileList = () => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        console.error('Erro ao listar objetos:', err.message || err);
        setLoading(false);
        return;
      }

      const files = data.Contents.map((object) => object.Key);
      setFileList(files);
      setLoading(false);
    });
  }, []);

  return (
    <div>
    {loading ? (
      <p>Carregando lista de arquivos...</p>
    ) : (
      <ul style={{ listStyleType: 'none', padding: 0 }}>
       

        
        {fileList.map((fileName) => (
          
          <li key={fileName} style={{ marginTop: '5%', display: 'flex', alignItems: 'center' }}>
            
            <img src={'/imgs/txt.png'} alt="Ícone do arquivo" style={{ width: '10%', marginRight: '3%' }} />
            {fileName.split('_').slice(2).join('_')} {/* Excluir nome e código do nome do arquivo */}
            <span style={{marginLeft:'10%',backgroundColor:'#05a1db',padding:'1%',fontSize:'bold',color:'white',borderRadius: '8px',}}>{fileName.split('_')[0]} </span>
          </li>
        ))}
      </ul>
    )}
  </div>
  );
};

export default S3FileList;
