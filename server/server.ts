import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// CORS ayarları
app.use(cors());

// JSON gövde verilerini işlemek için middleware
app.use(express.json());

// Temel bir rota
app.get('/', (req, res) => {
  res.send('Merhaba, TypeScript ile yazılmış Node.js sunucusu çalışıyor!');
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
