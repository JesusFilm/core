import './tracing'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Logger as PinoLogger } from 'nestjs-pino'
import { json } from 'body-parser'
import { AppModule } from './app/app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(app.get(PinoLogger))
  await app.use(json({ limit: '50mb' }))
  const port = process.env.PORT ?? '4002'
  await app.listen(port, () => {
    new Logger('main').log(`Listening on port: ${port}`)
  })
}

bootstrap().catch((err) => console.log(err))
