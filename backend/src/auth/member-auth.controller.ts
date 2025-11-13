import { Body, Controller, Post } from '@nestjs/common';
import { MemberAuthService } from './member-auth.service';
import { MemberLoginDto } from './dto/member-login.dto';

@Controller({ path: 'members/auth', version: '1' })
export class MemberAuthController {
  constructor(private readonly memberAuthService: MemberAuthService) {}

  @Post('login')
  login(@Body() loginDto: MemberLoginDto) {
    return this.memberAuthService.login(loginDto.email, loginDto.secret);
  }
}
