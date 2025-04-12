import { MockedResponse } from '@apollo/client/testing'

import { GET_STUDY_QUESTIONS } from './page'

export const mockStudyQuestions = [
  {
    id: '2481b77c-7eff-4039-9173-d5383ebdd222',
    value: "How is the sacrifice of Jesus part of God's plan?",
    order: 1,
    __typename: 'VideoStudyQuestion'
  },
  {
    id: 'e22f7314-0d2f-4ef3-835f-155d41706a19',
    value:
      'How do the different groups of people respond to Jesus and His teachings?',
    order: 2,
    __typename: 'VideoStudyQuestion'
  },
  {
    id: '66c0d6a0-2861-4aaa-984d-47049d97292d',
    value:
      'What are some of the miracles Jesus performed? How do they affect those people?',
    order: 3,
    __typename: 'VideoStudyQuestion'
  },
  {
    id: '8c5cb753-a161-435e-8233-27b735d577ec',
    value: 'How do you respond to the life of Jesus?',
    order: 4,
    __typename: 'VideoStudyQuestion'
  }
]

export const createStudyQuestionsMock = (videoId: string): MockedResponse => ({
  request: {
    query: GET_STUDY_QUESTIONS,
    variables: { videoId }
  },
  result: {
    data: {
      adminVideo: {
        id: videoId,
        studyQuestions: mockStudyQuestions,
        __typename: 'AdminVideo'
      }
    }
  }
})
