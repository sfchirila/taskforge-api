import { Injectable, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from "bcrypt";

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    async createUser(userData: CreateUserDto) {
        const userExist = await this.prisma.user.findUnique({
            where: {  email: userData.email }
        });

        if (userExist) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return this.prisma.user.create({ data: { ...userData, password: hashedPassword }, omit:{ password: true }  });
    }

    async loginUser(loginData: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginData.email }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginData.password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // generate tokens and save refresh token
        const tokens = await this.generateTokens(user.id, user.email);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return { ...tokens, user: { id: user.id, email: user.email, name: user.name } };
    }

    async refreshTokens(userId: number, refreshToken: string) {
         const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.refreshToken) {
            throw new Error('Invalid');
        }

        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
            throw new Error('Invalid refresh token');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    logoutUser(userId: number) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
    }

    // ? HELPERS
    private async generateTokens(userId: number, userEmail: string) {
        const payload = { sub: userId, userEmail };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '15m',
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '1d',
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    private async saveRefreshToken(userId: number, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);

        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hash },
        });
    }
}
