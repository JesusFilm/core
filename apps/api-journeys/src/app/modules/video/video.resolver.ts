import {
    Args,
    Mutation,
    Resolver,
  } from '@nestjs/graphql'
import { VideoResponse } from '../response/response.models'
import { ResponseService } from '../response/response.service'
import { VideoResponseCreateInput } from './video.models'
  
  
@Resolver(of=> VideoResponse)
export class VideoResolvers {
    constructor(private readonly responseservice: ResponseService) {}
    
    @Mutation(returns => VideoResponse)
    async videoResponseCreate(@Args('input') input: VideoResponseCreateInput) {
        return await this.responseservice.insertOne(input)
    }
}