import { Module, Global } from '@nestjs/common'
import { PrismaService } from './prisma.service'

/**
 * DatabaseModule - Global database access module
 * 
 * Marked as @Global so PrismaService can be injected anywhere in the application
 * without needing to import this module in every feature module.
 * 
 * This establishes our principle of "frictionless observability" -
 * database access should be available everywhere but always traceable.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}