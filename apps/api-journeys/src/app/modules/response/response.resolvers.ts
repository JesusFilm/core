// Block resolver tests are in individual block type spec files

import { ResolveField, Resolver } from '@nestjs/graphql'
import { Response } from '../../__generated__/graphql'
import { ResponseService } from './response.service'

interface DbResponse extends Response {
  __typename: string
}
@Resolver('Response')
export class ResponseResolver {
  constructor(private readonly responseService: ResponseService) { }
  @ResolveField()
  __resolveType(obj: DbResponse): string {
    return obj.__typename
  }
}
