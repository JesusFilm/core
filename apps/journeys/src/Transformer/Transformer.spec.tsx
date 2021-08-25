import { BlockType } from '../types';
import Transformer from './Transformer';

describe('Transformer', () => {
  const data: BlockType[] = [
    {
      __typename: 'Step',
      id: 'Root Video',
    },
    {
      __typename: 'RadioQuestion',
      id: 'MoreQuestions',
      label: 'How can we help you know more about Jesus?',
      description:
        'What do you think would be the next step to help you grow in your relationship with Christ',
      parent: {
        id: 'Root Video',
      },
    },
    {
      __typename: 'RadioOption',
      id: 'NestedMoreQuestions',
      label: 'Chat Privately',
      parent: {
        id: 'MoreQuestions',
      },
    },
    {
      __typename: 'RadioOption',
      id: 'NestedMoreQuestions2',
      label: 'Get a bible',
      parent: {
        id: 'MoreQuestions',
      },
    },
    {
      __typename: 'RadioOption',
      id: 'NestedMoreQuestions3',
      label: 'Watch more vidoes about Jesus',
      parent: {
        id: 'MoreQuestions',
      },
    },
    {
      __typename: 'RadioOption',
      id: 'NestedMoreQuestions4',
      label: 'Ask a question',
      parent: {
        id: 'MoreQuestions',
      },
    },
  ];

  it('should render successfully', () => {
    const transformed = Transformer(data);
    expect(transformed).toBeTruthy();
  });
});
