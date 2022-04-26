import express , {Request, Response} from 'express';
import { body, validationResult } from 'express-validator';
import { payload } from '../models/payload';

const router = express.Router();


router.get('/api/v1/notification', [
    body('email')
    .isEmail()
    .withMessage('Email must be valid'),
    body('message')
    .isLength({min: 10, max : 40})
    .withMessage('message must be between 10 and 40 characters')

], (req : Request, res : Response)=> {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        throw new Error('Invalid email or message');
    }

     




    res.send('Hey there !');
});


 
export { router as notification}