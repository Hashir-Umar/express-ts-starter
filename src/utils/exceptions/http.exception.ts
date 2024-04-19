class HttpException extends Error {
    public status: number;
    public message: string;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    }
}

class Throw404 extends HttpException {
    constructor(message?: string) {
        super(404, message ?? 'Resource not found.');
    }
}

class Throw422 extends HttpException {
    constructor(message?: string) {
        super(422, message ?? 'Unprocessable entity.');
    }
}

class Throw400 extends HttpException {
    constructor(message?: string) {
        super(400, message ?? 'Bad Request.');
    }
}

class Throw401 extends HttpException {
    constructor(message?: string) {
        super(401, message ?? 'Unauthorized.');
    }
}

class Throw403 extends HttpException {
    constructor(message?: string) {
        super(403, message ?? 'Forbidden.');
    }
}

export { HttpException, Throw400, Throw401, Throw422, Throw403, Throw404 };
