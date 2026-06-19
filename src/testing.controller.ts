import { Controller, Get } from "@nestjs/common";

@Controller("testing")
export class TestingController {
  @Get()
  test() {
    console.log(process.env.JWT_ACCESS_TOKEN_EXPIRY);
  }
}
