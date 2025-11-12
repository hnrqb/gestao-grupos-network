import { Body, Controller, Post } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import type { AdminAuthResponse } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  login(@Body() adminLoginDto: AdminLoginDto): AdminAuthResponse {
    return this.adminAuthService.login(adminLoginDto.key);
  }
}


