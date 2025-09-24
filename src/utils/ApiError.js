class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;                   //HTTP status code.
        this.success = false;                           //always false for errors.
        this.data = null;                               //optional payload (default null).
        this.errors = errors;                           //extra error details (e.g., validation errors)

        if (stack) {
            this.stack = stack;                         //handling → either a provided stack or captured automatically.
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
