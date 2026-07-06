import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

@ValidatorConstraint({ name: "IsValidUsername", async: false })
export class IsValidUsernameConstraint implements ValidatorConstraintInterface {
  validate(username: string, _args: ValidationArguments): boolean {
    if (typeof username !== "string") return false;

    const isValidFormat = /^[a-zA-Z][a-zA-Z0-9_]{4,29}$/.test(username);
    const noUnicode = !/[^ -\x7F]/.test(username);
    const noWhitespace = !/\s/.test(username);

    return isValidFormat && noUnicode && noWhitespace;
  }

  defaultMessage(_args: ValidationArguments): string {
    return "Username phải bắt đầu bằng chữ cái, chỉ chứa chữ, số, gạch dưới (_), từ 5–30 ký tự, không có khoảng trắng hoặc ký tự Unicode.";
  }
}
