import {ApiError} from "./api-error";

export class AdobeApiError extends ApiError {
  statusCode = 500;
  constructor(statusCode: number, message: string){
    super('AdobeSign API Error - ' + message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AdobeApiError.prototype);
  }
}