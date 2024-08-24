import { Test, TestingModule } from "@nestjs/testing"
import { ProbasService } from "./probas.service"

describe("ProbasService", () => {
  let service: ProbasService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProbasService],
    }).compile()

    service = module.get<ProbasService>(ProbasService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
