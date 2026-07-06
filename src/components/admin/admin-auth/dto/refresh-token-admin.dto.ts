import { IsString, IsNotEmpty } from "class-validator";

export class RefreshTokenAdminDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
