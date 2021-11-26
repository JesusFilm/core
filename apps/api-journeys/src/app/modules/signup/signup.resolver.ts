import {
    Args,
    Mutation,
    Resolver,
} from '@nestjs/graphql'
import { SignUpResponse } from '../response/response.models'
import { ResponseService } from '../response/response.service'
import { SignUpResponseCreateInput } from './signup.models'


@Resolver(of => SignUpResponse)
export class SignUpResolvers {
    constructor(private readonly responseservice: ResponseService) { }

    @Mutation(returns => SignUpResponse)
    async signUpResponseCreate(@Args('input') input: SignUpResponseCreateInput) {
        return await this.responseservice.insertOne(input)
    }
}
