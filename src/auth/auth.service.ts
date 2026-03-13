import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import bcrypt from "bcrypt";


@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService){}

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
}
