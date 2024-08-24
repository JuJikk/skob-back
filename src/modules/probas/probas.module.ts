import { Module } from "@nestjs/common"
import { ProbasController } from "./probas.controller"
import { ProbasService } from "./probas.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { User } from "../users/users.entity"

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ProbasController],
  providers: [ProbasService],
})
export class ProbasModule {}
