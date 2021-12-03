import { Args, ResolveField, Resolver } from '@nestjs/graphql';
import { Block, Journey } from '../../graphql';
import { JourneyService } from '../journey/journey.service';

@Resolver('Action')
export class ActionResolver {     
    @ResolveField()
    __resolveType(obj: Block): string {
        if (obj.hasOwnProperty('blockId'))
            return 'NavigateToBlockAction';
        if (obj.hasOwnProperty('journeyId'))
            return 'NavigateToJourneyAction';
        if (obj.hasOwnProperty('url'))
            return 'LinkAction';
        return 'NavigateAction';
    }
}

// @Resolver('NavigateToJourneyAction')
// export class NavigateToJourneyActionResolver {
//     constructor(private readonly journeyservice: JourneyService) { }
//     @ResolveField('journey', type => Journey, { complexity: 1 })
//     async journey(@Args('journeyId') _key: string): Promise<Journey> {
//         return await this.journeyservice.get(_key)
//         // return { key: result._key, slug: result.slug }
//     }
// }
