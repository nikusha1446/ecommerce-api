import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Commerce API is running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again',
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
