import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { PrismaService } from './app/lib/prisma.service'

async function bootstrap(): Promise<void> {
  const port = process.env.PORT ?? '4002'
  const app = await NestFactory.create(AppModule)
  const prismaService = app.get(PrismaService)
  await prismaService.enableShutdownHooks(app)
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/graphql')
  })
}

bootstrap().catch((err) => {
  console.log(err)
})
