import { Test, TestingModule } from "@nestjs/testing"
import { UsersService } from "./users.service"
import { MongoRepository } from "typeorm"
import { User } from "./users.entity"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BadRequestException, ForbiddenException, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { UpdateUserDto } from "./dto/update.user.dto"
import { Role } from "../common/enums/role.enum"

describe("UsersService", () => {
  let service: UsersService
  let usersRepository: MongoRepository<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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

    service = module.get<UsersService>(UsersService)
    usersRepository = module.get<MongoRepository<User>>(getRepositoryToken(User))
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  // getUserByEmail

  it("should return a user if email exists", async () => {
    const email = "text@example.com"
    const mockUser = { email, name: "Vlados Papiros" } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockUser)

    const result = await service.getUserByEmail(email)

    expect(result).toEqual(mockUser)
    expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email } })
  })

  it("should return null if user with email doesn't exist", async () => {
    const email = "notfound@example.com"

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(null)

    const result = await service.getUserByEmail(email)

    expect(result).toBeNull()
    expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email } })
  })

  // removeScoutFromGroup()

  it("should throw NotFoundException if scout is not found", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(null)

    await expect(service.removeScoutFromGroup(scoutEmail, foremanEmail)).rejects.toThrow(NotFoundException)
    expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: scoutEmail } })
  })

  it("should throw BadRequestException if scout is not in foreman's group", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const mockScout = { email: scoutEmail, ownerEmail: "anotherForeman@example.com" } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)

    await expect(service.removeScoutFromGroup(scoutEmail, foremanEmail)).rejects.toThrow(BadRequestException)
    expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: scoutEmail } })
  })

  it("should successfully remove scout from group", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const mockScout = { email: scoutEmail, ownerEmail: foremanEmail } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)
    const updateOneSpy = jest.spyOn(usersRepository, "updateOne").mockResolvedValue({})

    await service.removeScoutFromGroup(scoutEmail, foremanEmail)
    expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: scoutEmail } })
    expect(updateOneSpy).toHaveBeenCalledWith({ email: scoutEmail }, { $unset: { ownerEmail: "" } })
  })

  // updateUser()

  it("should throw ForbiddenException if request user has no permission", async () => {
    const updateUserDto = { name: "Update Name" } as UpdateUserDto
    const userEmailToUpdate = "user@example.com"
    const requestUserEmail = "request@example.com"
    const mockUser = { email: userEmailToUpdate, ownerEmail: "anotherForemanEmail@example.com" } as User

    jest.spyOn(service, "getUserByEmail").mockResolvedValue(mockUser)

    await expect(service.updateUser(updateUserDto, userEmailToUpdate, requestUserEmail)).rejects.toThrow(ForbiddenException)
  })

  it("should successfully update user if request is valid", async () => {
    const updateUserDto = { name: "New Name" } as UpdateUserDto
    const userEmailToUpdate = "user@example.com"
    const requestUserEmail = "requester@example.com"
    const mockUser = { email: userEmailToUpdate, ownerEmail: requestUserEmail } as User

    jest.spyOn(service, "getUserByEmail").mockResolvedValue(mockUser)
    const saveSpy = jest.spyOn(usersRepository, "save").mockResolvedValue({ ...mockUser, ...updateUserDto })

    const result = await service.updateUser(updateUserDto, userEmailToUpdate, requestUserEmail)

    expect(service.getUserByEmail).toHaveBeenCalledWith(userEmailToUpdate)
    expect(saveSpy).toHaveBeenCalledWith({ ...mockUser, ...updateUserDto })
    expect(result).toEqual({ ...mockUser, ...updateUserDto })
  })

  it("should throw InternalServerErrorException if save fails", async () => {
    const updateUserDto = { name: "New Name" } as UpdateUserDto
    const userEmailToUpdate = "user@example.com"
    const requestUserEmail = "requester@example.com"
    const mockUser = { email: userEmailToUpdate, ownerEmail: requestUserEmail } as User

    jest.spyOn(service, "getUserByEmail").mockResolvedValue(mockUser)
    jest.spyOn(usersRepository, "save").mockRejectedValue(new Error("Database error"))

    await expect(service.updateUser(updateUserDto, userEmailToUpdate, requestUserEmail)).rejects.toThrow(InternalServerErrorException)
  })

  // getAllScoutsByForemanEmail()
  it("should return all scouts associated with the given foreman email", async () => {
    const foremanEmail = "foreman@example.com"
    const mockScouts = [{ email: "scout1@example.com", ownerEmail: foremanEmail } as User, { email: "scout2@example.com", ownerEmail: foremanEmail } as User]

    jest.spyOn(usersRepository, "find").mockResolvedValue(mockScouts)

    const result = await service.getAllScoutsByForemanEmail(foremanEmail)

    expect(usersRepository.find).toHaveBeenCalledWith({ where: { ownerEmail: foremanEmail } })
    expect(result).toEqual(mockScouts)
  })

  it("should return an empty array if no scouts are found", async () => {
    const foremanEmail = "foreman@example.com"

    jest.spyOn(usersRepository, "find").mockResolvedValue([])

    const result = await service.getAllScoutsByForemanEmail(foremanEmail)

    expect(usersRepository.find).toHaveBeenCalledWith({ where: { ownerEmail: foremanEmail } })
    expect(result).toEqual([])
  })

  it("should log an error and rethrow if find operation fails", async () => {
    const foremanEmail = "foreman@example.com"

    jest.spyOn(usersRepository, "find").mockRejectedValue(new Error("Database error"))
    const loggerSpy = jest.spyOn(service["logger"], "log")

    await expect(service.getAllScoutsByForemanEmail(foremanEmail)).rejects.toThrow("Database error")
    expect(loggerSpy).toHaveBeenCalledWith(`Get all ${foremanEmail} scouts`)
  })

  // createUser()
  it("should successfully create and return the user", async () => {
    const mockUser = { email: "user@example.com", password: "hashedPassword" } as User
    const saveSpy = jest.spyOn(usersRepository, "save").mockResolvedValue(mockUser)

    const result = await service.createUser(mockUser)

    expect(saveSpy).toHaveBeenCalledWith(new User(mockUser))
    expect(result).toEqual(mockUser)
  })

  //addScoutToGroup()
  it("should successfully add a scout to a group", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const mockScout = { email: scoutEmail, roles: ["SCOUT"], ownerEmail: "" } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)
    jest.spyOn(usersRepository, "updateOne").mockResolvedValue({ modifiedCount: 1 })

    await service.addScoutToGroup(scoutEmail, foremanEmail)

    expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: scoutEmail } })
    expect(usersRepository.updateOne).toHaveBeenCalledWith({ email: scoutEmail }, { $set: { ownerEmail: foremanEmail } })
  })

  it("should throw NotFoundException if scout is not found", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(null)

    await expect(service.addScoutToGroup(scoutEmail, foremanEmail)).rejects.toThrow(NotFoundException)
  })

  it("should throw BadRequestException if scout already has a group", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const mockScout = { email: scoutEmail, ownerEmail: "anotherForeman@example.com" } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)

    await expect(service.addScoutToGroup(scoutEmail, foremanEmail)).rejects.toThrow(BadRequestException)
  })

  it("should throw BadRequestException if scout's role is Foreman", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const mockScout = { email: scoutEmail, roles: [Role.FOREMAN], ownerEmail: "" } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)

    await expect(service.addScoutToGroup(scoutEmail, foremanEmail)).rejects.toThrow(BadRequestException)
  })

  it("should throw BadRequestException if data is not modified", async () => {
    const scoutEmail = "scout@example.com"
    const foremanEmail = "foreman@example.com"
    const mockScout = { email: scoutEmail, roles: ["SCOUT"], ownerEmail: "" } as User

    jest.spyOn(usersRepository, "findOne").mockResolvedValue(mockScout)
    jest.spyOn(usersRepository, "updateOne").mockResolvedValue({ modifiedCount: 0 })

    await expect(service.addScoutToGroup(scoutEmail, foremanEmail)).rejects.toThrow(BadRequestException)
  })
})
