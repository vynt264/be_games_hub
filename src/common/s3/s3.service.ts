import { Injectable } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UploadedFile } from "./interfaces";

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get("REGION"),
      credentials: {
        accessKeyId: this.configService.get("ACCESS_KEY_ID") || "",
        secretAccessKey: this.configService.get("SECRET_ACCESS_KEY") || "",
      },
    });
    this.bucket =
      this.configService.get("BUCKET")?.split("/")[0] || "default-bucket";
  }

  async uploadFile(
    file: UploadedFile,
  ): Promise<{ Location: string; Key: string }> {
    const key = `MINIGAME/${uuidv4()}-${file.fieldname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    });

    try {
      await this.s3Client.send(command);
      return {
        Location: `https://${this.bucket}.s3.${this.configService.get("REGION")}.amazonaws.com/${key}`,
        Key: key,
      };
    } catch (error) {
      throw new Error(
        `Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(
        `Failed to delete file from S3: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new Error(
        `Failed to generate signed URL: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
