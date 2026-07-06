import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { SelectedNoelDto } from "./position.dto";

// DTO cho API start
export class StartGameRequestDto {
  @ApiProperty({
    example: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
    description: "Encryption public key của client (base64 format)",
  })
  encryptionPublicKey: string;

  @ApiProperty({
    example: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
    description: "Verification public key của client (base64 format)",
  })
  verificationPublicKey: string;
}

// DTO cho API end
export class EndGamePayloadDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  gameId: number;

  @ApiProperty({ type: [SelectedNoelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedNoelDto)
  selectedPositions: SelectedNoelDto[];
}

export class EndGameRequestDto {
  @ApiProperty({ type: EndGamePayloadDto })
  @ValidateNested()
  @Type(() => EndGamePayloadDto)
  payload: EndGamePayloadDto;

  @ApiProperty({
    example: "base64_signature...",
    description: "Chữ ký của client từ payload",
  })
  signature: string;
}

// DTO cho response
export class EncryptedResponseDto {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  success: boolean;

  @ApiProperty({ example: "Bắt đầu game thành công" })
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: "base64_encrypted_payload...",
    description: "Dữ liệu đã được mã hóa bằng public key của client",
  })
  data: string;
}
