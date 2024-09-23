import { PassportStrategy } from "@nestjs/passport"
import { Strategy, VerifyCallback } from "passport-google-oauth20"

import { Injectable } from "@nestjs/common"
import { User } from "../../users/users.entity"
import { Role } from "../../common/enums/role.enum"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL,
      scope: ["email", "profile"],
    })
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { emails, photos, name } = profile
    const user = new User({
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
      roles: [Role.SCOUTER],
      isGuideComplete: false,
      provider: "google",
    })
    done(null, user)
  }
}
