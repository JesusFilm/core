import {
    ResolveField,
    Resolver,
} from '@nestjs/graphql'
import { VideoContent } from '../../../graphql';
import { ResponseService } from '../../response/response.service'

@Resolver('VideoResponse')
export class VideoResolvers {
    constructor(private readonly responseservice: ResponseService) { }

    // @Mutation(returns => VideoResponse)
    // async videoResponseCreate(@Args('input') input: VideoResponseCreateInput) {
    //     return await this.responseservice.insertOne(input)
    // }
}

@Resolver('VideoContent')
export class VideoContentResolvers {
    @ResolveField()
    __resolveType(obj: VideoContent): string {
        if (obj.hasOwnProperty('mediaComponentId'))
            return 'VideoArclight';
        return 'VideoGeneric';
    }
}