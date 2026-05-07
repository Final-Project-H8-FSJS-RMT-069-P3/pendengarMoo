export class CustomError extends Error {
    public status: number;

    constructor(message: string, status: number = 500) {
        super(message);
        this.status = status;
    }
}

export class BadRequestError extends CustomError {
    constructor(message: string = "Bad Request") {
        super(message, 400);
    }
}

export class UnauthorizedError extends CustomError {
    constructor(message: string = "Unauthorized") {
        super(message, 401);
    }
}

export class NotFoundError extends CustomError {
    constructor(message: string = "Not Found") {
        super(message, 404);
    }
}