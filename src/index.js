import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { debugMorgan } from './utils/debugger.js';
import routes from './routes/routes.js';
import { connectDB } from './db.js';

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'localhost';

const app = express(); // Instancia de express

app.use(express.json()); // Middleware para parsear el body de las peticiones

morgan.token('body', (req) => JSON.stringify(req.body));

if (process.env.NODE_ENV === 'development') {
  console.log('Development mode');
  app.use(morgan(debugMorgan));
}

app.use('/api/v1', routes);

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`)
  })
}

startServer();
