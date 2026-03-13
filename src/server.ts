import express from 'express';
import http from 'http'; // Required for Socket.io
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import swaggerSpec from './docs/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this for production security
    // methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/users', userRoutes);

// 3. Connect DB and start the HTTP SERVER (not app.listen)
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket enabled`);
    console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
  });
});
