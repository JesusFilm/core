import {
    Args,
    Mutation,
    Query,
    Resolver,
    ResolveReference
  } from '@nestjs/graphql'
  
import { RadioQuestionService } from './radio-question.service'
import { RadioQuestionResponse, RadioQuestionResponseCreateInput } from './radio-question.models'
  
@Resolver(of => RadioQuestionResponse)
export class RadioQuestionResolvers {
    constructor(private readonly radioquestionservice: RadioQuestionService) {}

    @Query(returns => RadioQuestionResponse)
    async radioQuestionResponse(@Args('id') _key: string) {
        return await this.radioquestionservice.getByKey(_key);
    }
    
    @Mutation(returns => RadioQuestionResponse)
    async radioQuestionResponseCreate(@Args('input') input: RadioQuestionResponseCreateInput) {
        return await this.radioquestionservice.insertOne(input)
    }

    @ResolveReference()
    async resolveReference(reference: { __typename: string; id: string }) {
        return await this.radioquestionservice.getByKey(reference.id)
    }
}
  