import { DynamicModule, Module, Provider, Type } from '@nestjs/common'

import { CaslFactory } from './casl.factory'

@Module({
  imports: [],
  exports: []
})
export class AuthModule {
  /**
   * @param caslFactory Class that extends CaslFactory and defines the user's abilities
   */
  static register(caslFactory: Type<CaslFactory>): DynamicModule {
    const providers: Provider[] = [
      {
        provide: CaslFactory,
        useClass: caslFactory
      }
    ]

    return {
      module: AuthModule,
      providers,
      exports: providers
    }
  }
}
