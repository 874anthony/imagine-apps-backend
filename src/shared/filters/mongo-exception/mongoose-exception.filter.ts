import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(Error, HttpException)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isMongoServerError = exception.name === 'MongoServerError';
    const isDuplicateKeyError = exception.code === 11000;

    if (isMongoServerError && isDuplicateKeyError) {
      this.duplicateKeyError(response, exception);
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      response.status(status).json(exceptionResponse);
    }
  }

  private duplicateKeyError(response: Response, exception: any) {
    return response.status(400).json({
      message: 'Duplicate key error, please try again.',
      duplicatedField: `The duplicated field is: ${Object.keys(
        exception.keyValue,
      ).at(0)}`,
    });
  }
}
