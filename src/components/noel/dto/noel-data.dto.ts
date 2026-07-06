import { ApiProperty } from "@nestjs/swagger";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { NoelStateDto } from "./noel-state.dto";

export class NoelDataDto {
  @ApiProperty({ type: NoelStateDto })
  @ValidateNested()
  @Type(() => NoelStateDto)
  noelState: NoelStateDto;
}
