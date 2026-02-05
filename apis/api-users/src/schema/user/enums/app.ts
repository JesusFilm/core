import { builder } from '../../builder'

const APP_VALUES = ['NextSteps', 'JesusFilmOne'] as const

export type AppType = (typeof APP_VALUES)[number] | null

export const App = builder.enumType('App', {
  values: APP_VALUES
})
