export abstract class ApiError extends Error{
  abstract statusCode: number;

  protected constructor(message: string){
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}