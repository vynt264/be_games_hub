import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErrorLog } from "./error-log.entity";

@Injectable()
export class ErrorLogService {
  constructor(
    @InjectRepository(ErrorLog)
    private errorLogRepository: Repository<ErrorLog>,
  ) {}

  async logError({
    service,
    method,
    message,
    error,
    requestData,
  }: {
    service: string;
    method: string;
    message: string;
    error?: any;
    requestData?: any;
  }) {
    const errorLog = this.errorLogRepository.create({
      service,
      method,
      message: message?.toString()?.substring(0, 65535),
      error: error ? this.sanitizeError(error) : null,
      requestData,
    });

    await this.errorLogRepository.save(errorLog);
  }

  private sanitizeError(error: any): any {
    if (!error) return error;

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        ...(error["status"] && { status: error["status"] }),
      };
    }

    if (typeof error === "string") {
      return { message: error };
    }

    try {
      return JSON.parse(JSON.stringify(error));
    } catch (e) {
      return { message: "Non-serializable error object" };
    }
  }
}
