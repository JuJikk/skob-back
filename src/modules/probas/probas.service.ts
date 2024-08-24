import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "../users/users.entity"
import { MongoRepository } from "typeorm"
import { UpdateProbasDto } from "./dto/update.probas.dto"

@Injectable()
export class ProbasService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>
  ) {}

  public async updateProba(scoutEmail: string, foremanEmail: string, probaDto: UpdateProbasDto) {
    const scout = await this.usersRepository.findOne({ where: { email: scoutEmail } })
    if (scout?.ownerEmail !== foremanEmail) {
      throw new ForbiddenException(`No access to update a Scout's proba from another Foreman group`)
    }
    const proba = await this.usersRepository.updateOne({ email: scoutEmail }, { $set: { [probaDto.updateField]: probaDto.value } })
    if (proba.modifiedCount === 0) {
      throw new BadRequestException(`Invalid proba field or value`)
    }
    return null
  }
}
