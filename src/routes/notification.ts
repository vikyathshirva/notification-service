import express , {Request, Response} from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
// import { DatabaseConnectionError } from '../errors/database-connection-error';
import * as notificationService from '../service/notification-service'

const router = express.Router();


router.post('/api/v1/notification', [
    body('medium')
    .isArray()
    .withMessage('medium must be specified as a list.'),
    body('schedule')
    .isArray()
    .withMessage('schedule must be of the format [2,1]'),
    body('adhc')
    .isBoolean()
    .withMessage('ad hoc message must be set to a boolean value'),
    body('group')
    .isArray()
    .withMessage('group should be an array'),
    body('userId')
    .isString()
    .withMessage('User Id must be a string')

], (req : Request, res : Response)=> {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        throw new RequestValidationError(errors.array());
    }
    notificationService.notificationFeeder(req.body)
    res.send('check your console');
});


 
export { router as notification}