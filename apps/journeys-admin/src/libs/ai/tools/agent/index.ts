import { agentGenerateImage } from './generateImage/generateImage'
import { agentGetPersonalizationQuestions } from './getPersonalizationQuestions/getPersonalizationQuestions'
import { agentWebSearch } from './webSearch/webSearch'

export const tools = {
  agentGenerateImage,
  agentGetPersonalizationQuestions,
  agentWebSearch
}
