class ExpressError extends Error{
    constructor(message, stautsCode) {
        super();
        this.message = message;
        this.stautsCode = stautsCode;
        
    }
}

module.exports = ExpressError;