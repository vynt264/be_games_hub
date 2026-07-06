import { registerDecorator, ValidationOptions } from "class-validator";
import { IsValidUsernameConstraint } from "../validators/username.validator";

export function IsValidUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidUsernameConstraint,
    });
  };
}
