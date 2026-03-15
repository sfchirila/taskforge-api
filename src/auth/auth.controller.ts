import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('register')
    registerUser(@Body() userData: CreateUserDto) {
        return this.authService.createUser( userData );
    }

    @Post('login')
    loginUser(@Body() loginData: LoginDto) {
        return this.authService.loginUser(loginData);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
        refreshTokens(@Req() req: any) {
        return this.authService.refreshTokens(req.user.sub, req.user.refreshToken);
    }

}
