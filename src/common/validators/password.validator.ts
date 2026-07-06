import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "IsStrongPassword", async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string): boolean {
    if (typeof password !== "string") return false;

    const lengthValid = password.length >= 8 && password.length <= 32;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[@#$%&!]/.test(password);
    const noWhitespace = !/\s/.test(password);

    return (
      lengthValid &&
      hasUpper &&
      hasLower &&
      hasDigit &&
      hasSpecial &&
      noWhitespace
    );
  }

  defaultMessage(_args: ValidationArguments): string {
    return "Password phải từ 8–32 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt (@, #, $, %, &, !), không chứa khoảng trắng.";
  }
}
