import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

type JwtPayload = {
    sub: number;
    email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_REFRESH_SECRET,
            ignoreExpiration: false,
        });


    }

    async validate(req: Request, payload: JwtPayload) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new Error('No token provided');
        };

        const refreshToken = authHeader.replace('Bearer ', '').trim();
        return { ...payload, refreshToken };
    }
}