import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Server } from 'http'
import * as express from 'express'
import { ExpressAdapter } from '@nestjs/platform-express'
import * as serverlessExpress from 'aws-serverless-express'
import { Context } from "aws-lambda"
import { AppModule } from './app/app.module'

let lambdaProxy: Server

async function bootstrap(): Promise<void> {
  const globalPrefix = 'api'
  const port = process.env.PORT ?? "4002"
  const app = await NestFactory.create(AppModule)                
  app.setGlobalPrefix(globalPrefix)
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix)
  })
}

async function bootStrapLambda(): Promise<any> {
  const expressServer = express()
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressServer))
  await nestApp.init()

  return serverlessExpress.createServer(expressServer)
}

if (require.main === module) {// development
  // eslint-disable-next-line
  bootstrap() 
} 

export const handler = (event: any, context: Context): void => {
  // eslint-disable-next-line
  if (!lambdaProxy) {
    bootStrapLambda().then((server) => {
      lambdaProxy = server
      serverlessExpress.proxy(lambdaProxy, event, context)
    })
  } else {
    serverlessExpress.proxy(lambdaProxy, event, context)
  }
}