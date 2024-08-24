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

    const { probaName, probaSubName, probaIndex } = probaDto

    const isZeroProbaIncomplete = this.containsZero(scout.zeroProba)
    const isFirstProbaIncomplete = this.containsZero(scout.firstProba)

    if (probaName === "secondProba") {
      if (isZeroProbaIncomplete) {
        throw new BadRequestException("Zero Proba is not complete")
      }
      if (isFirstProbaIncomplete) {
        throw new BadRequestException("First Proba is not complete")
      }
    }

    if (probaName === "firstProba") {
      if (isZeroProbaIncomplete) {
        throw new BadRequestException("Zero Proba is not complete")
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    const scoutProbaIndex = scout[probaName][probaSubName]

    if (!(probaSubName in scout[probaName])) {
      throw new BadRequestException(`Invalid proba sub name`)
    }

    if (probaIndex > scoutProbaIndex.length - 1) {
      throw new BadRequestException("Invalid proba index")
    }

    const updateField = `${probaName}.${probaSubName}.${probaIndex}`
    const proba = await this.usersRepository.updateOne({ email: scoutEmail }, { $set: { [updateField]: probaDto.value } })
    if (proba.modifiedCount === 0) {
      throw new BadRequestException(`Invalid proba value`)
    }
    return null
  }

  private containsZero(obj: Record<string, number[]>): boolean {
    return Object.values(obj).some((array) => array.includes(0))
  }
}
