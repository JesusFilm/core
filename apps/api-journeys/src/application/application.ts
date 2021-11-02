import { createApplication } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import {
  actionModule,
  blockModule,
  buttonModule,
  cardModule,
  iconModule,
  imageModule,
  journeyModule,
  radioQuestionModule,
  responseModule,
  signUpModule,
  stepModule,
  typographyModule,
  videoModule,
  videoTriggerModule
} from '../modules'

export const application = createApplication({
  modules: [
    actionModule,
    blockModule,
    buttonModule,
    cardModule,
    iconModule,
    imageModule,
    journeyModule,
    radioQuestionModule,
    responseModule,
    signUpModule,
    stepModule,
    typographyModule,
    videoModule,
    videoTriggerModule
  ],
  schemaBuilder
})
