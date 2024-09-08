import { Test, TestingModule } from "@nestjs/testing"
import { ProbasService } from "./probas.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { User } from "../users/users.entity"
import { MongoRepository } from "typeorm"
import { BadRequestException, ForbiddenException, Logger } from "@nestjs/common"
import { UpdateProbasDto } from "./dto/update.probas.dto"

describe("ProbasService", () => {
  let service: ProbasService
  let usersRepository: MongoRepository<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProbasService,
        {
          provide: getRepositoryToken(User),
          useClass: MongoRepository,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<ProbasService>(ProbasService)
    usersRepository = module.get<MongoRepository<User>>(getRepositoryToken(User))
  })

  it("should successfully update a proba", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const probaDto = { probaName: "firstProba", probaSubName: "a", probaIndex: 0, value: 1 } as UpdateProbasDto

    const mockScout = {
      email: scoutEmail,
      ownerEmail: foremanEmail,
      firstProba: { a: Array(11).fill(0) },
    } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)
    jest.spyOn(usersRepository, "updateOne").mockResolvedValue({ modifiedCount: 1 })

    await service.updateProba(scoutEmail, foremanEmail, probaDto)

    expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: scoutEmail } })
    expect(usersRepository.updateOne).toHaveBeenCalledWith({ email: scoutEmail }, { $set: { "firstProba.a.0": 1 } })
  })

  it("should throw ForbiddenException if scout is not in foreman group", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const probaDto = { probaName: "firstProba", probaSubName: "a", probaIndex: 0, value: 1 } as UpdateProbasDto

    const mockScout = {
      email: scoutEmail,
      ownerEmail: "anotherForeman@example.com",
    } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)

    await expect(service.updateProba(scoutEmail, foremanEmail, probaDto)).rejects.toThrow(ForbiddenException)
  })

  it("should throw BadRequestException if proba sub name is invalid", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const probaDto = { probaName: "firstProba", probaSubName: "invalidSubName", probaIndex: 0, value: 1 } as UpdateProbasDto

    const mockScout = {
      email: scoutEmail,
      ownerEmail: foremanEmail,
      firstProba: { a: Array(11).fill(0) },
    } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)

    await expect(service.updateProba(scoutEmail, foremanEmail, probaDto)).rejects.toThrow(BadRequestException)
  })

  it("should throw BadRequestException if proba index is out of bounds", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const probaDto = { probaName: "firstProba", probaSubName: "a", probaIndex: 20, value: 1 } as UpdateProbasDto

    const mockScout = {
      email: scoutEmail,
      ownerEmail: foremanEmail,
      firstProba: { a: Array(11).fill(0) },
    } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)

    await expect(service.updateProba(scoutEmail, foremanEmail, probaDto)).rejects.toThrow(BadRequestException)
  })

  it("should throw BadRequestException if Zero Proba is not complete", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const probaDto = { probaName: "secondProba", probaSubName: "a", probaIndex: 0, value: 1 } as UpdateProbasDto

    const mockScout = {
      email: scoutEmail,
      ownerEmail: foremanEmail,
      zeroProba: { a: Array(11).fill(0) },
      firstProba: { a: Array(11).fill(1) },
      secondProba: { a: Array(10).fill(0) },
    } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)

    await expect(service.updateProba(scoutEmail, foremanEmail, probaDto)).rejects.toThrow(BadRequestException)
  })

  it("should throw BadRequestException if proba is not modified", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const probaDto = { probaName: "firstProba", probaSubName: "a", probaIndex: 0, value: 1 } as UpdateProbasDto

    const mockScout = {
      email: scoutEmail,
      ownerEmail: foremanEmail,
      firstProba: { a: Array(11).fill(0) },
    } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)
    jest.spyOn(usersRepository, "updateOne").mockResolvedValue({ modifiedCount: 0 })

    await expect(service.updateProba(scoutEmail, foremanEmail, probaDto)).rejects.toThrow(BadRequestException)
  })
})
