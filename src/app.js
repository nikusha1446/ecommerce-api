import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Commerce API is running' });
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
