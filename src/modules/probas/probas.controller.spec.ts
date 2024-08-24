import { Test, TestingModule } from "@nestjs/testing"
import { ProbasController } from "./probas.controller"

describe("ProbasController", () => {
  let controller: ProbasController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProbasController],
    }).compile()

    controller = module.get<ProbasController>(ProbasController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
