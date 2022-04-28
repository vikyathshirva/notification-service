import { Request, Response, NextFunction} from 'express';
import { CustomError } from '../errors/custom-error';



/**
 * Main error handler which catches all other custom type instances and sends it back
 * this is used as a middleware for main index routes
 * @param err 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

    // if( err instanceof RequestValidationError){
    //     // console.log('handling the error as request validation error');
    //     return res.status(err.statusCode).send({errors: err.serializeErrors()});
    // }
    if (err instanceof CustomError){
        return res.status(err.statusCode).send({errors: err.serializeErrors()});
    }



    res.status(400).send({
        message: err.message
    });
     

}; 