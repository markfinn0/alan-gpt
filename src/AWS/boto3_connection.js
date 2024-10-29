const AWS = require('aws-sdk');

// Configurações
const accessKeyId = '';
const secretAccessKey = '';
const region = 'sa-east-1';
const bucketName = 'poc-gpt-site';
const filePath = 'teste_input_javascript.txt';
const content = 'Conteúdo do arquivo de exemplo.';

// Configurar credenciais
const credentials = new AWS.Credentials(accessKeyId, secretAccessKey);

// Configurar o serviço S3
const s3 = new AWS.S3({
  credentials,
  region,
});

// Parâmetros para o upload do objeto
const params = {
  Bucket: bucketName,
  Key: filePath,
  Body: content,
};

// Fazer upload do objeto para o S3
s3.upload(params, (err, data) => {
  if (err) {
    console.error('Erro ao fazer upload do objeto:', err);
  } else {
    console.log('Upload bem-sucedido. Informações do objeto:', data);
  }
});
