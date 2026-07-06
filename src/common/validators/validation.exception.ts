import { HttpException, HttpStatus } from "@nestjs/common";

export class ValidationException extends HttpException {
  constructor(public validationErrors: any) {
    super(
      {
        message: "Validation error",
        validationErrors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
