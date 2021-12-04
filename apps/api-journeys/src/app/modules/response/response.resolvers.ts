// Block resolver tests are in individual block type spec files

import { ResolveField, Resolver } from '@nestjs/graphql'
import { Response } from '../../graphql'
import { ResponseService } from './response.service'

@Resolver('Response')
export class ResponseResolver {
  constructor(private readonly responseservice: ResponseService) { }
  @ResolveField()
  __resolveType(obj: Response): string {
    return obj.type
  }
}
