import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'


async function bootstrap(): Promise<void> {
  const globalPrefix = 'api'
  const port = process.env.PORT ?? "4002"
  const app = await NestFactory.create(AppModule)                
  app.setGlobalPrefix(globalPrefix)
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix)
  })
}

// eslint-disable-next-line
bootstrap() 