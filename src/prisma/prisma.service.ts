import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg';


@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
   constructor() {

    const url = process.env.DATABASE_URL;

    if (!url) {
      throw new Error('DATABASE_URL is not defined');
    }

    const adapter = new PrismaPg({
      connectionString: url,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}