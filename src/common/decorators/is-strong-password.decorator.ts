import { registerDecorator, ValidationOptions } from "class-validator";
import { IsStrongPasswordConstraint } from "../validators/password.validator";

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsStrongPasswordConstraint,
    });
  };
}
