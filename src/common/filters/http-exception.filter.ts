import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ValidationException } from "../validators/validation.exception";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorDetails: {
      name: string;
      message: string;
      errors?: Record<string, string[]>;
      stack?: string;
    } = {
      name: exception instanceof Error ? exception.name : "Exception",
      message: "Internal server error",
    };

    if (exception instanceof ValidationException) {
      errorDetails.message = "Validation failed";
      errorDetails.errors = (exception.getResponse() as any).validationErrors;
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse();
      errorDetails = {
        ...errorDetails,
        ...(typeof res === "string" ? { message: res } : res),
      };
    } else if (exception instanceof Error) {
      errorDetails.message = exception.message;
      if (process.env.NODE_ENV !== "production") {
        errorDetails.stack = exception.stack;
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...errorDetails,
    });
  }
}
