import { Injectable } from '@nestjs/common'
import { PureAbility } from '@casl/ability'

/**
 * Abstract class for creating an ability for a user.  It is used by the `CaslGuard` decorator to create an ability.
 * Register the factory with the `NestAuthModule` by passing it to the `register` method.
 * ```ts
 * ＠Module({ imports: [AuthModule.register(AppCaslFactory)] })
 * export class AppAuthModule {}
 * ```
 * Where `AppCaslFactory` is a class that extends `CaslFactory` and implements the `createAbility` method.
 */
@Injectable()
export abstract class CaslFactory {
  abstract createAbility(user: { id: string }): Promise<PureAbility>
}
