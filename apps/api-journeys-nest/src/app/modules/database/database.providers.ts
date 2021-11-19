import {Database} from 'arangojs';

// import {Shared} from '@nestjs/core';
export const databaseProviders = [{
  provide: 'DATABASE',
  useFactory: () => {
    const db = new Database({ databaseName: 'journeys'});
    return db;
  }
}];