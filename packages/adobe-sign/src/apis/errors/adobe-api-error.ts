import {ApiError} from "./api-error";

export class AdobeApiError extends ApiError {
  constructor(public statusCode: number, message: string){
    super('AdobeSign API Error - ' + message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AdobeApiError.prototype);
  }
}