import { Test, TestingModule } from "@nestjs/testing"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { NotFoundException, ForbiddenException } from "@nestjs/common"
import { JwtPayloadDto } from "../auth/dto/jwtpayload.dto"
import { UserDto } from "./dto/user.dto"
import { UpdateUserDto } from "./dto/update.user.dto"
import { EmailDto } from "../common/dto/email.dto"
import { User } from "./users.entity"

describe("UsersController", () => {
  let controller: UsersController
  let service: UsersService

  const mockUserService = {
    getUserByEmail: jest.fn(),
    updateUser: jest.fn(),
    getAllScoutsByForemanEmail: jest.fn(),
    removeScoutFromGroup: jest.fn(),
  }

  const mockJwtPayload = { email: "user@example.com" } as JwtPayloadDto

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile()

    controller = module.get<UsersController>(UsersController)
    service = module.get<UsersService>(UsersService)
  })

  describe("getMyAccount", () => {
    it("should return user dto when user exists", async () => {
      const user = { email: mockJwtPayload.email } as User
      jest.spyOn(service, "getUserByEmail").mockResolvedValue(user)

      const result = await controller.getMyAccount(mockJwtPayload)
      expect(result).toEqual(UserDto.toDto(user))
    })

    it("should throw NotFoundException when user does not exist", async () => {
      jest.spyOn(service, "getUserByEmail").mockResolvedValue(null)

      await expect(controller.getMyAccount(mockJwtPayload)).rejects.toThrow(NotFoundException)
    })
  })

  describe("updateUser", () => {
    it("should return updated user dto", async () => {
      const user = { email: "foreman@example.com", name: "name" } as User
      jest.spyOn(service, "updateUser").mockResolvedValue(user)

      const result = await controller.updateUser({ email: "user@example.com" } as EmailDto, { name: "updated name" } as UpdateUserDto, mockJwtPayload)
      expect(result).toEqual(UpdateUserDto.toDto(user))
    })
  })

  describe("getUserByEmail", () => {
    it("should return user dto when user exists and is in the same group", async () => {
      const user = { email: "scout@example.com", ownerEmail: "user@example.com" } as User
      jest.spyOn(service, "getUserByEmail").mockResolvedValue(user)

      const result = await controller.getUserByEmail({ email: "scout@example.com" } as EmailDto, mockJwtPayload)
      expect(result).toEqual(UserDto.toDto(user))
    })

    it("should throw NotFoundException when user does not exist", async () => {
      jest.spyOn(service, "getUserByEmail").mockResolvedValue(null)

      await expect(controller.getUserByEmail({ email: "user@example.com" } as EmailDto, mockJwtPayload)).rejects.toThrow(NotFoundException)
    })

    it("should throw ForbiddenException when user is not in the same group", async () => {
      const user = { email: "user@example.com", ownerEmail: "other@example.com" }
      jest.spyOn(service, "getUserByEmail").mockResolvedValue(user as any)

      await expect(controller.getUserByEmail({ email: "user@example.com" } as EmailDto, mockJwtPayload)).rejects.toThrow(ForbiddenException)
    })
  })

  describe("getAllScoutsByForemanEmail", () => {
    it("should return list of scouts dto when scouts exist", async () => {
      const scouts = [{ email: "scout1@example.com" }, { email: "scout2@example.com" }] as User[]
      jest.spyOn(service, "getAllScoutsByForemanEmail").mockResolvedValue(scouts as any)

      const result = await controller.getAllScoutsByForemanEmail(mockJwtPayload)
      expect(result).toEqual(UserDto.toDtoList(scouts))
    })

    it("should throw NotFoundException when no scouts exist", async () => {
      jest.spyOn(service, "getAllScoutsByForemanEmail").mockResolvedValue([])

      await expect(controller.getAllScoutsByForemanEmail(mockJwtPayload)).rejects.toThrow(NotFoundException)
    })
  })

  describe("removeScoutFromGroup", () => {
    it("should call removeScoutFromGroup", async () => {
      jest.spyOn(service, "removeScoutFromGroup").mockResolvedValue(undefined)

      await controller.removeScoutFromGroup({ email: "scout@example.com" } as EmailDto, mockJwtPayload)
      expect(service.removeScoutFromGroup).toHaveBeenCalledWith("scout@example.com", "user@example.com")
    })
  })
})
