import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { json } from 'body-parser'
import { AppModule } from './app/app.module'

async function bootstrap(): Promise<void> {
  const port = process.env.PORT ?? '4003'
  const app = await NestFactory.create(AppModule)
  await app.use(json({ limit: '50mb' }))
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/graphql')
  })
}

bootstrap().catch((err) => {
  console.log(err)
})
