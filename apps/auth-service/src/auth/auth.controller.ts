import { Controller, Post, Body, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, RefreshDto, LogoutDto } from './dto';
import { JwtAuthGuard } from './jwt.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(@Req() req: any) {
    return this.authService.logoutAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Req() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(req.user.userId, body.currentPassword, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) throw new UnauthorizedException('User not found');
    const { passwordHash, name, ...rest } = user;
    const parts = (name || '').split(' ');
    return { ...rest, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPasswordWithToken(body.token, body.newPassword);
  }
}