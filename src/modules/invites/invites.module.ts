import { Module } from "@nestjs/common"
import { InvitesService } from "./invites.service"
import { InvitesController } from "./invites.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Invite } from "./invites.entity"
import { UsersModule } from "../users/users.module"

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Invite])],
  providers: [InvitesService],
  controllers: [InvitesController],
  exports: [InvitesService],
})
export class InvitesModule {}
