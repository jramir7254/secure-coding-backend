

class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
    }
}

class DuplicateResourceError extends AppError {
    constructor(message, resource, resourceConflictId, status = 409) {
        super(message);
        this.resource = resource;
        this.resourceConflictId = resourceConflictId;
        this.status = status;
    }
}


class ResourceNotFoundError extends AppError {
    constructor(message, resource, missingResourceId, status = 404) {
        super(message);
        this.resource = resource;
        this.missingResourceId = missingResourceId;
        this.status = status;
    }
}

class IncorrectAttemptError extends AppError {
    constructor(message, resource, missingResourceId, status = 400) {
        super(message);
        this.resource = resource;
        this.missingResourceId = missingResourceId;
        this.status = status;
    }
}


class ExpectedAppError extends AppError {
    constructor(message, resource, status = 200) {
        super(message);
        this.resource = resource;
        this.status = status;
    }
}


function isAppError(err, typeErr = AppError) {
    return err instanceof AppError
}

module.exports = {
    AppError,
    DuplicateResourceError,
    ResourceNotFoundError,
    IncorrectAttemptError,
    ExpectedAppError,
    isAppError
}