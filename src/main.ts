import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { NestExpressApplication } from "@nestjs/platform-express"
import * as cookieParser from "cookie-parser"
import * as process from "node:process"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.use(cookieParser(process.env.COOKIE_SECRET))
  await app.listen(3000)
}
bootstrap()
