import { CustomError } from "./custom-error";


/**
 * custom error handling type 2
 */
export class NotFoundError extends CustomError {
    statusCode = 404;
    constructor(){
        super('Route not found')
        Object.setPrototypeOf(this,NotFoundError.prototype);
    }

    serializeErrors() {
        return [{message : 'not found'}];
    }
}

