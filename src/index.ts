import express from 'express';
import { Request, Response } from 'express';
import authRouter from './routes/auth';
const app = express();

app.get('/', (req:Request, res: Response) => {
  res.send('Hello World');
});

app.use('/auth', authRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});