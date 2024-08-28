import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersModule } from "./modules/users/users.module"
import { ConfigModule } from "@nestjs/config"
import { ProbasModule } from "./modules/probas/probas.module"
import { AuthModule } from "./modules/auth/auth.module"
import { InvitesModule } from "./modules/invites/invites.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    TypeOrmModule.forRoot({
      type: "mongodb",
      url: process.env.MONGO_DB_URL,
      database: "test",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      ssl: true,
    }),
    ProbasModule,
    AuthModule,
    InvitesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
