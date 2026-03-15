import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';

import { PrismaService } from 'src/prisma/prisma.service';

type JwtPayload = {
    sub: number;
    email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly prisma: PrismaService) {
        super({
            jwtFromRequest: (req: Request) => req?.cookies?.accessToken ?? null,
            secretOrKey: process.env.JWT_SECRET,
            ignoreExpiration: false,
        });
    }

   async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: {id: payload.sub },
            select: { id: true, email: true },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
   }
}