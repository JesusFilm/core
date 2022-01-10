import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'

async function bootstrap(): Promise<void> {
  const port = process.env.PORT ?? '4002'
  const app = await NestFactory.create(AppModule)
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/graphql')
  })
}

bootstrap().catch((err) => {
  console.log(err)
})
