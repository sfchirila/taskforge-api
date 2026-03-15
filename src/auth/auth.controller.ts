import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt.guard';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
};

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('register')
    registerUser(@Body() userData: CreateUserDto) {
        return this.authService.createUser( userData );
    }

    @Post('login')
    async loginUser(@Body() loginData: LoginDto, @Res() res: Response, ) {
        const { accessToken, refreshToken, user } = await this.authService.loginUser(loginData);

        res.cookie("accessToken", accessToken, {
            ...COOKIE_OPTIONS,
              maxAge: 15 * 60 * 1000,
        });

         res.cookie("refreshToken", refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        return res.json({ user });
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refresh-token')
    async refreshTokens(@Req() req: any,  @Res() res: Response) {
        const { accessToken, refreshToken } = await this.authService.refreshTokens(req.user.sub, req.user.refreshToken);

        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        return res.json({ ok: true });
    }

}
