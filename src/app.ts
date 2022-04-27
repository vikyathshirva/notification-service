import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { users } from './store/users';
import { notification } from './routes/notification';
import { errorHandler } from './middlewares/error-handlers';
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.use(json());
app.use(notification);
app.use(errorHandler);


app.get('*', () => {
    throw new NotFoundError()
}) 


export { app }