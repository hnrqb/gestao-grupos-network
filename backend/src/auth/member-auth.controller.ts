import { Body, Controller, Post } from '@nestjs/common';
import { MemberAuthService } from './member-auth.service';
import { MemberLoginDto } from './dto/member-login.dto';

@Controller('members/auth')
export class MemberAuthController {
  constructor(private readonly memberAuthService: MemberAuthService) {}

  @Post('login')
  login(@Body() loginDto: MemberLoginDto) {
    return this.memberAuthService.login(loginDto.email, loginDto.secret);
  }
}


