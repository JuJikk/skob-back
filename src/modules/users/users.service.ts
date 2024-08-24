import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { User } from "./users.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { MongoRepository } from "typeorm"
import { RegisterDto } from "../auth/dto/register.dto"
import { Role } from "../common/enums/role.enum"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>
  ) {}

  public async getUserByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } })
  }

  public async createUser(user: RegisterDto): Promise<User> {
    return await this.usersRepository.save(new User(user))
  }

  public async getAllScoutsByForemanEmail(email: string) {
    return await this.usersRepository.find({
      where: {
        ownerEmail: email,
      },
    })
  }

  public async addScoutToGroup(scoutEmail: string, foremanEmail: string) {
    const scout = await this.usersRepository.findOne({ where: { email: scoutEmail } })
    if (!scout) {
      throw new NotFoundException(`Scout with email ${scoutEmail} not found`)
    }
    if (scout.ownerEmail) {
      throw new BadRequestException(`Scout with email ${scoutEmail} already have a group`)
    }
    if (scout.roles.includes(Role.FOREMAN)) {
      throw new BadRequestException(`You can't add another Foreman to group`)
    }
    const updatedScout = await this.usersRepository.updateOne({ email: scoutEmail }, { $set: { ownerEmail: foremanEmail } })
    if (updatedScout.modifiedCount === 0) {
      throw new BadRequestException(`Invalid data`)
    }
    return null
  }
}
