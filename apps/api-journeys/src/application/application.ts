import { createApplication } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import {
  actionModule,
  blockModule,
  buttonModule,
  cardModule,
  iconModule,
  gridItemModule,
  gridContainerModule,
  imageModule,
  journeyModule,
  radioQuestionModule,
  responseModule,
  signUpModule,
  stepModule,
  typographyModule,
  userModule,
  userJourneyModule,
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
    gridItemModule,
    gridContainerModule,
    journeyModule,
    radioQuestionModule,
    responseModule,
    signUpModule,
    stepModule,
    typographyModule,
    userModule,
    userJourneyModule,
    videoModule,
    videoTriggerModule
  ],
  schemaBuilder
})
