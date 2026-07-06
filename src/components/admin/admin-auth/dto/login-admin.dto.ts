import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "../../../../common/decorators/is-strong-password.decorator";
import { IsValidUsername } from "../../../../common/decorators/is-valid-username.decorator";

export class LoginAdminDto {
  @IsValidUsername()
  @ApiProperty()
  username: string;

  @IsStrongPassword()
  @ApiProperty()
  password: string;
}
