import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "../users/users.entity"
import { MongoRepository } from "typeorm"
import { UpdateProbasDto } from "./dto/update.probas.dto"
import { UpdateEntireProbasDto } from "./dto/update.entire.probas.dto"

@Injectable()
export class ProbasService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>
  ) {}

  private readonly logger = new Logger(ProbasService.name)

  public async updateProba(scoutEmail: string, foremanEmail: string, probaDto: UpdateProbasDto) {
    this.logger.log(`Update ${scoutEmail} proba by ${foremanEmail}, proba: ${probaDto}`)
    const scout = await this.usersRepository.findOne({ where: { email: scoutEmail } })
    if (scout?.ownerEmail !== foremanEmail) {
      this.logger.log(`${foremanEmail} has no access to update ${scoutEmail} proba`)
      throw new ForbiddenException(`No access to update a Scout's proba from another Foreman group`)
    }

    const { probaName, probaSubName, probaIndex } = probaDto

    this.validateCanUpdateProba(scout, probaDto.probaName)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    const scoutProbaIndex = scout[probaName][probaSubName]

    if (!(probaSubName in scout[probaName])) {
      throw new BadRequestException(`Invalid proba sub name`)
    }

    if (probaIndex > scoutProbaIndex.length - 1) {
      this.logger.log("Invalid proba index")
      throw new BadRequestException("Invalid proba index")
    }

    const updateField = `${probaName}.${probaSubName}.${probaIndex}`
    this.logger.log(`Update field: ${updateField}`)
    const proba = await this.usersRepository.updateOne({ email: scoutEmail }, { $set: { [updateField]: probaDto.value } })
    if (proba.modifiedCount === 0) {
      this.logger.log(`${scoutEmail} proba isn't modified`)
      throw new BadRequestException(`Invalid proba value`)
    }
    return null
  }

  public async updateEntireProba(scoutEmail: string, foremanEmail: string, probaDto: UpdateEntireProbasDto) {
    this.logger.log(`Update ${scoutEmail} Entire Proba by ${foremanEmail}, proba: ${probaDto}`)
    const scout = await this.usersRepository.findOne({ where: { email: scoutEmail } })
    if (scout?.ownerEmail !== foremanEmail) {
      this.logger.log(`${foremanEmail} has no access to update ${scoutEmail} proba`)
      throw new ForbiddenException(`No access to update a Scout's proba from another Foreman group`)
    }

    this.validateCanUpdateProba(scout, probaDto.probaName)

    const probaToUpdate = scout[probaDto.probaName]

    this.logger.log(`proba to update: ${probaToUpdate}`)

    for (const key in probaToUpdate) {
      if (probaToUpdate.hasOwnProperty(key)) {
        await this.usersRepository.updateMany({ email: scoutEmail }, { $set: { [`${probaDto.probaName}.${key}.$[]`]: probaDto.value } })
      }
    }
  }

  private containsZero(obj: Record<string, number[]>): boolean {
    return Object.values(obj).some((array) => array.includes(0))
  }

  private validateCanUpdateProba(scout: User, probaName: string) {
    this.logger.log("validate can update proba")
    const isZeroProbaIncomplete = this.containsZero(scout.zeroProba)
    const isFirstProbaIncomplete = this.containsZero(scout.firstProba)

    if (probaName === "secondProba") {
      if (isZeroProbaIncomplete) {
        this.logger.log("Zero Proba is not complete")
        throw new BadRequestException("Zero Proba is not complete")
      }
      if (isFirstProbaIncomplete) {
        this.logger.log("First Proba is not complete")
        throw new BadRequestException("First Proba is not complete")
      }
    }

    if (probaName === "firstProba") {
      if (isZeroProbaIncomplete) {
        this.logger.log("Zero Proba is not complete")
        throw new BadRequestException("Zero Proba is not complete")
      }
    }
  }
}
