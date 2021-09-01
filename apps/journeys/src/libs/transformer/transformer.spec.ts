import transformer from './transformer'
import { data1 } from '../../data'

describe('transformer', () => {
  it('should change flat array into tree successfully', () => {
    expect(transformer(data1)).toEqual([
      {
        __typename: 'Video',
        children: [
          {
            __typename: 'RadioQuestion',
            children: [
              {
                __typename: 'RadioOption',
                children: [],
                id: 'Questions',
                label: 'RadioOption',
                parent: { id: 'Questions' }
              },
              {
                __typename: 'RadioOption',
                children: [],
                id: 'Questions again',
                label: 'another Radio Option',
                parent: { id: 'Questions' }
              }
            ],
            id: 'Questions',
            label: 'This is a test question 1!',
            parent: { id: 'Root' },
            variant: 'light'
          }],
        id: 'Root',
        poster: 'https://media.vimejs.com/poster.png',
        src: 'https://media.vimejs.com/720p.mp4'
      }, {
        __typename: 'Video',
        children: [
          {
            __typename: 'RadioQuestion',
            children: [
              {
                __typename: 'RadioOption',
                children: [],
                id: 'NestedMoreQuestions',
                label: 'RadioOption',
                parent: { id: 'MoreQuestions' }
              }],
            id: 'MoreQuestions',
            label: 'This is a test question 2!',
            parent: { id: 'Second Video' }
          }],
        id: 'Second Video',
        poster: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80',
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
      }])
  })
})
