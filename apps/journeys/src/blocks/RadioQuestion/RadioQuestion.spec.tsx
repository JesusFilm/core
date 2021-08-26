import { render } from '@testing-library/react';
import { RadioQuestion } from './RadioQuestion';
import { RadioQuestionType } from '../../types';

const data: RadioQuestionType = {
  __typename: 'RadioQuestion',
  id: 'MoreQuestions',
  label: 'How can we help you know more about Jesus?',
  description:
    'What do you think would be the next step to help you grow in your relationship with Jesus?',
  parent: {
    id: 'Root Video',
  },
  children: [
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
  ],
};

describe('RadioQuestion', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RadioQuestion block={data} />);
    expect(baseElement).toBeTruthy();
  });
  it('should render question with correct text', () => {
    const { getByText } = render(<RadioQuestion block={data} />);
    expect(
      getByText('How can we help you know more about Jesus?')
    ).toBeTruthy();
  });
  it('should render description with correct text', () => {
    const { getByText } = render(<RadioQuestion block={data} />);
    expect(
      getByText(
        'What do you think would be the next step to help you grow in your relationship with Jesus?'
      )
    );
  });
  it('should render option with correct text', () => {
    const { getByText } = render(<RadioQuestion block={data} />);
    expect(getByText('Chat Privately')).toBeTruthy();
  });
});
