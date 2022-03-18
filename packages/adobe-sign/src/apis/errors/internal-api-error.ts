import {ApiError} from "./api-error";

export class InternalApiError extends ApiError {
  statusCode = 500;
  constructor(message: string){
    super('Internal API Error - ' + message);
    Object.setPrototypeOf(this, InternalApiError.prototype);
  }
}