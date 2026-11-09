require('dotenv').config();
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3, BUCKET } = require('../src/config/storage');

const KEY = 'test/hello.txt';

async function main() {
  if (process.argv[2] === 'delete') {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: KEY }));
    console.log('Deleted:', KEY);
    return;
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      Body: 'Hello from learning-tracker!',
      ContentType: 'text/plain',
    })
  );
  console.log('Uploaded:', KEY);

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: KEY }),
    { expiresIn: 300 }
  );
  console.log('Temporary link (valid for 5 minutes):');
  console.log(url);
}

main().catch((err) => console.error('Failed:', err.name, err.message));