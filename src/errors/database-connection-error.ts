


/**
 * custom error handling type 1
 */
export class InternalServerError extends Error {
    statusCode = 500;
    reason = 'Internal server error';

    constructor() {
        super('Something went wrong, please try again later');
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }

    serializeErrors() {
        return [
            { message: this.reason }
        ]
    }
}