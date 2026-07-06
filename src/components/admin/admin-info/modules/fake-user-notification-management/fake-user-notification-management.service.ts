import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NoelFakeUserNotificationEntity } from "../../entities/noel-fake-user-notification.entity";
import { UserInfoEntity } from "../../../../auth/entities/user-info.entity";
import { NoelConfigService } from "../../../mini-game-config/noel/noel-config.service";
import { ListFilterDto } from "../../dto/list-filter.dto";
import { ERROR_MESSAGE } from "../../../../../common/constants/message.constant";
import { QueryBuilderHelper } from "../../../../../common/helpers/query-builder.helper";

@Injectable()
export class FakeUserNotificationManagementService {
  constructor(
    @InjectRepository(NoelFakeUserNotificationEntity)
    private readonly fakeUserNotificationRepo: Repository<NoelFakeUserNotificationEntity>,
    @InjectRepository(UserInfoEntity)
    private readonly userRepo: Repository<UserInfoEntity>,
    private readonly noelConfigService: NoelConfigService,
  ) {}

  async createUserFakeNotification(
    username: string,
    updatedBy: string,
    turns?: number,
  ) {
    const config = await this.noelConfigService.getNoelConfig();
    if (!config) throw new NotFoundException(ERROR_MESSAGE.CONFIG_NOT_FOUND);

    const realUser = await this.userRepo
      .createQueryBuilder("user")
      .where("user.username = :username", { username })
      .getOne();
    if (realUser) {
      throw new BadRequestException(
        "Username này là user thật, không thể tạo user fake",
      );
    }

    const exists = await this.fakeUserNotificationRepo
      .createQueryBuilder("popup")
      .where("popup.username = :username", { username })
      .getOne();
    if (exists) {
      throw new BadRequestException(
        "User fake đã tồn tại trong sự kiện hiện tại",
      );
    }

    const result = await this.fakeUserNotificationRepo
      .createQueryBuilder()
      .insert()
      .into(NoelFakeUserNotificationEntity)
      .values({
        username,
        updatedBy,
      })
      .execute();

    const entity = await this.fakeUserNotificationRepo
      .createQueryBuilder("popup")
      .where("popup.id = :id", { id: result.identifiers[0].id })
      .getOne();

    return { success: true, data: entity };
  }

  async listUserFakeNotifications(filter: ListFilterDto = {}) {
    const config = await this.noelConfigService.getNoelConfig();
    if (!config) throw new NotFoundException(ERROR_MESSAGE.CONFIG_NOT_FOUND);

    const qb = this.fakeUserNotificationRepo.createQueryBuilder("popup");
    qb.orderBy("popup.createdAt", "DESC");

    const { page, pageSize, skip, take } = QueryBuilderHelper.createPagination(
      filter.page,
      filter.pageSize,
    );
    const [data, total] = await qb.skip(skip).take(take).getManyAndCount();

    return { data, total, page, pageSize };
  }

  async updateUserFakeNotification(
    id: number,
    username: string,
    updatedBy: string,
  ) {
    const config = await this.noelConfigService.getNoelConfig();
    if (!config) throw new NotFoundException(ERROR_MESSAGE.CONFIG_NOT_FOUND);

    const entity = await this.fakeUserNotificationRepo
      .createQueryBuilder("popup")
      .where("popup.id = :id", { id })
      .getOne();
    if (!entity) {
      throw new NotFoundException(
        "Không tìm thấy user fake popup trong sự kiện hiện tại",
      );
    }

    const realUser = await this.userRepo
      .createQueryBuilder("user")
      .where("user.username = :username", { username })
      .getOne();
    if (realUser) {
      throw new BadRequestException(
        "Username này là user thật, không thể tạo user fake",
      );
    }

    const existed = await this.fakeUserNotificationRepo
      .createQueryBuilder("popup")
      .where("popup.username = :username", { username })
      .getOne();
    if (existed && existed.id !== id) {
      throw new BadRequestException(
        "User fake đã tồn tại trong sự kiện hiện tại",
      );
    }

    await this.fakeUserNotificationRepo
      .createQueryBuilder()
      .update(NoelFakeUserNotificationEntity)
      .set({ username, updatedBy })
      .where("id = :id", { id })
      .execute();

    entity.username = username;
    entity.updatedBy = updatedBy;
    return { success: true, data: entity };
  }

  async deleteUserFakeNotification(id: number) {
    const result = await this.fakeUserNotificationRepo
      .createQueryBuilder()
      .delete()
      .from(NoelFakeUserNotificationEntity)
      .where("id = :id", { id })
      .execute();
    if (result.affected === 0) {
      throw new NotFoundException(
        "Không tìm thấy user fake notification trong sự kiện hiện tại",
      );
    }
    return { success: true };
  }
}
