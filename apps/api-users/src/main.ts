import '@core/nest/common/tracer'

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Logger as PinoLogger } from 'nestjs-pino'
import { json } from 'body-parser'
import { AppModule } from './app/app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(app.get(PinoLogger))
  await app.use(json({ limit: '50mb' }))
  const port = '4002'
  const server = await app.listen(port, () => {
    new Logger('main').log(`Listening on port: ${port}`)
  })
  // avoid 502 on ALB
  server.keepAliveTimeout = 61000
  server.headersTimeout = 62000
}

bootstrap().catch((err) => console.log(err))
