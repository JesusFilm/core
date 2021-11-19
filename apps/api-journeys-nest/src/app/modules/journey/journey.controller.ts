import {Body, Controller, Get, Param, Post, Query, UseGuards} from '@nestjs/common';
// import {AuthGuard} from '@nestjs/passport';
import * as _ from 'lodash';
// import {ApiBearerAuth } from '@nestjs/swagger';
// import {AuthService} from '../auth/auth.service';
import {JourneyService} from './journey.service';
import { IJourney } from '../../interfaces/journey.interface';
import {CreateJourneyDto } from './dto/create.journey.dto';

// import { object } from 'joi';

@Controller('users')
export class JourneyController {
  constructor(private readonly journeyservice: JourneyService) {}
  @Get()
//   @ApiBearerAuth()
//   @UseGuards(AuthGuard('jwt'))
  async getAllOrByBindVars(@Query() bindVars: object): Promise<any> {
    // console.log('bindVars' + JSON.stringify(bindVars) + ';' + !bindVars);
    let rst: any;
    if (_.isEmpty(bindVars)) {
      rst = await this.journeyservice.getAll({});
    } else {
      rst = await this.journeyservice.getByBindVars(bindVars);
    }
    return rst;
  }

  @Get(':id')
  async getByKey(@Param('id') id: string): Promise<any> {
    // console.log('bindVars' + JSON.stringify({ _key: id }));
    // return await this.journeyservice.getOne({ gender: id });
    return await this.journeyservice.getByKey(id);
  }
  @Post()
  async addOne(@Body() theOne: CreateJourneyDto) {
    return await this.journeyservice.insertOne(theOne);
  }
}