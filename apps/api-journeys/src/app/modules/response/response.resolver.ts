import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { BaseService } from '../database/base.service';
import { Response } from './response.models';
import { ResponseService } from './response.service';

@Resolver(of => Response)
export class ResponseResolver {
  constructor(private readonly responseserive: ResponseService) { }
  @Query(returns => [Response])
  async blocks() {
    return await this.responseserive.getAll();
  }

  @Query(returns => Response)
  async block(@Args('id', { type: () => ID }) _key: string) {
    return await this.responseserive.getByKey(_key);
  }
}
