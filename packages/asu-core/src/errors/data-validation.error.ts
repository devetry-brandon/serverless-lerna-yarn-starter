export class DataValidationError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DataValidationError.prototype);
  }
}