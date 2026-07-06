import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { TokenService } from "../../components/jwt/jwt.service";
import { ERROR_MESSAGE } from "../constants/message.constant";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
    }
    const token = authHeader.split(" ")[1];

    try {
      const payload = await this.tokenService.verifyToken(token);
      if ((payload as any)?.notExists) {
        throw new UnauthorizedException(ERROR_MESSAGE.DELETE_TOKEN);
      }
      if (!payload) {
        throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN);
      }
      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN, error);
    }
  }
}
