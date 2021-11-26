import {
    Args,
    Mutation,
    Resolver,
} from '@nestjs/graphql'
import { RadioQuestionResponse } from '../response/response.models'
import { ResponseService } from '../response/response.service'

import { RadioQuestionResponseCreateInput } from './radio-question.models'

@Resolver(of => RadioQuestionResponse)
export class RadioQuestionResolvers {
    constructor(private readonly responseservice: ResponseService) { }

    @Mutation(returns => RadioQuestionResponse)
    async radioQuestionResponseCreate(@Args('input') input: RadioQuestionResponseCreateInput) {
        return await this.responseservice.insertOne(input)
    }
}
