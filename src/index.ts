import express from 'express';
import {json} from 'body-parser';
import { users } from './store/store';
import { notification } from './routes/notification';
import { errorHandler } from './middlewares/error-handlers';

const app = express();
app.use(json());
app.use(notification);
app.use(errorHandler);



app.listen(3000, ()=>{

    users.forEach(element => {
        console.log(element);
    });
    
}) 