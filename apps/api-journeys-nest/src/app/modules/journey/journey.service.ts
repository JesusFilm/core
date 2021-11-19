import { Inject, Injectable } from '@nestjs/common';
// import {DatabaseModule} from '../database/database.module';
import { Database } from 'arangojs';

import { BaseService } from '../database/base.service';
import { IJourney } from '../../interfaces/journey.interface';
import { DocumentCollection } from 'arangojs/collection';

@Injectable()
export class JourneyService extends BaseService {
  constructor(@Inject('DATABASE') private readonly db: Database) {
    super();
  }

  collection: DocumentCollection = this.db.collection('users');
}