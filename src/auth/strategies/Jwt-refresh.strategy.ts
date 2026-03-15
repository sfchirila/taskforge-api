import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';

type JwtPayload = {
    sub: number;
    email: string;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: (req: Request) => req?.cookies?.refreshToken ?? null,
            secretOrKey: process.env.JWT_REFRESH_SECRET,
            ignoreExpiration: false,
            passReqToCallback: true
        });


    }

    async validate(req: Request, payload: JwtPayload) {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new Error('No token provided');
        };

       return { ...payload, refreshToken };
    }
}