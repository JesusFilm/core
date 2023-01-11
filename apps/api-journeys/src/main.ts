import './tracing'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Logger as PinoLogger } from 'nestjs-pino'
import { AppModule } from './app/app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(app.get(PinoLogger))
  const logger = new Logger('main')
  const port = process.env.PORT ?? '4001'
  await app.listen(port, () => {
    logger.log(`Listening on port: ${port}`)
  })
}

bootstrap().catch((err) => console.log(err))
