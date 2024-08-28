import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { User } from "./users.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { MongoRepository } from "typeorm"
import { Role } from "../common/enums/role.enum"
import { UpdateUserDto } from "./dto/update.user.dto"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>
  ) {}

  private readonly logger = new Logger(UsersService.name)

  public async getUserByEmail(email: string): Promise<User | null> {
    this.logger.log(`Get user with email ${email}`)
    return await this.usersRepository.findOne({ where: { email } })
  }

  public async createUser(user: User): Promise<User> {
    this.logger.log(`Creating user with email ${user.email}`)
    return await this.usersRepository.save(new User(user))
  }

  public async getAllScoutsByForemanEmail(email: string) {
    this.logger.log(`Get all ${email} scouts`)
    return await this.usersRepository.find({
      where: {
        ownerEmail: email,
      },
    })
  }

  public async addScoutToGroup(scoutEmail: string, foremanEmail: string) {
    this.logger.log(`add scout ${scoutEmail} to foreman ${foremanEmail} group`)
    const scout = await this.usersRepository.findOne({ where: { email: scoutEmail } })
    if (!scout) {
      this.logger.log(`Could not find scout with email ${scoutEmail}`)
      throw new NotFoundException(`Scout with email ${scoutEmail} not found`)
    }
    if (scout?.ownerEmail) {
      this.logger.log(`Scout with email ${scoutEmail} already have a group`)
      throw new BadRequestException(`Scout with email ${scoutEmail} already have a group`)
    }
    if (scout.roles.includes(Role.FOREMAN)) {
      this.logger.log(`can't add another Foreman to group`)
      throw new BadRequestException(`You can't add another Foreman to group`)
    }
    const updatedScout = await this.usersRepository.updateOne({ email: scoutEmail }, { $set: { ownerEmail: foremanEmail } })
    if (updatedScout.modifiedCount === 0) {
      this.logger.log("data isn't modified")
      throw new BadRequestException(`Invalid data`)
    }
    return null
  }

  public async removeScoutFromGroup(scoutEmail: string, foremanEmail: string) {
    this.logger.log(`Removing ${scoutEmail} from ${foremanEmail} group`)
    const scout = await this.usersRepository.findOne({ where: { email: scoutEmail } })
    if (!scout) {
      this.logger.log(`Scout with email ${scoutEmail} not found`)
      throw new NotFoundException(`Scout with email ${scoutEmail} not found`)
    }

    if (scout?.ownerEmail !== foremanEmail) {
      this.logger.log(`Scout with email ${scoutEmail} is not in ${foremanEmail} group`)
      throw new BadRequestException(`This Scout is not in your group`)
    }

    await this.usersRepository.updateOne({ email: scoutEmail }, { $unset: { ownerEmail: "" } })
  }

  public async updateUser(updateUserDto: UpdateUserDto, userEmailToUpdate: string, requestUserEmail: string) {
    this.logger.log(`Update user ${userEmailToUpdate}, by ${requestUserEmail}, with data: ${JSON.stringify(updateUserDto)}`)

    if (!updateUserDto) {
      this.logger.log(`updateUserDto is null`)
      throw new BadRequestException(`Invalid payload`)
    }

    const userToUpdate = await this.getUserByEmail(userEmailToUpdate)
    if (!userToUpdate) {
      this.logger.log(`User ${userEmailToUpdate} not found`)
      throw new NotFoundException(`User ${userEmailToUpdate} not found`)
    }

    const isSelfRequest = requestUserEmail === userEmailToUpdate
    const isForemanRequest = requestUserEmail === userToUpdate.ownerEmail

    if (!isSelfRequest && !isForemanRequest) {
      this.logger.log(`User ${requestUserEmail} have no permission to update ${userEmailToUpdate} profile`)
      throw new ForbiddenException(`You haven't permission to update ${userEmailToUpdate} profile`)
    }

    try {
      return await this.usersRepository.save({ ...userToUpdate, ...updateUserDto })
    } catch (error) {
      this.logger.log(`Failed to update user ${userEmailToUpdate} profile`)
      throw new InternalServerErrorException("Something went wrong, please try latter...")
    }
  }
}
