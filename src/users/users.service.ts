import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {

constructor(private prisma: PrismaService){}

    createUser(user: CreateUserDto) {
        return this.prisma.user.create({ data: user });
    }

    getAllUsers() {
        return this.prisma.user.findMany({ omit: { password: true } });
    }

}
