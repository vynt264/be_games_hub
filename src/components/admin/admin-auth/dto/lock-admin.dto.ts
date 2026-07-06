import { ApiProperty } from "@nestjs/swagger";

export class LockAdminDto {
  @ApiProperty()
  username: string;
}
