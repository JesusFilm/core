import { Story, Meta } from '@storybook/react';
import { RadioOptionType } from '../../../types';
import RadioOption from './RadioOption';

import { Provider } from 'react-redux';
import { configureStoreWithState, RootState } from '../../../libs/store/store';
import { PreloadedState } from 'redux';

let preloadedState: PreloadedState<RootState>;

const Demo = {
  component: RadioOption,
  title: 'Journeys/Blocks/RadioOption',
  argTypes: {
    className: {
      table: { disable: true },
    },
    image: {
      table: { disable: true },
    },
    action: {
      table: { disable: true },
    },
    __typename: {
      table: { disable: true },
    },
    id: {
      table: { disable: true },
    },
    parent: {
      table: { disable: true },
    },
  },
  decorators: [
    (Story) => (
      <Provider store={configureStoreWithState(preloadedState)}>
        <Story />
      </Provider>
    ),
  ],
};

const Template: Story<RadioOptionType> = ({ ...props }) => (
  <RadioOption {...props} />
);

export const Primary = Template.bind({});
Primary.args = {
  __typename: 'RadioOption',
  label: 'Label',
};

export const OptionOne = Template.bind({});
OptionOne.args = {
  id: 'NestedOptions',
  __typename: 'RadioOption',
  label: 'Chat Privately',
  parent: {
    id: 'MoreQuestions',
  },
};

export const OptionTwo = Template.bind({});
OptionTwo.args = {
  id: 'NestedOptions2',
  __typename: 'RadioOption',
  label: 'Get a bible',
  parent: {
    id: 'MoreQuestions',
  },
};

export const OptionThree = Template.bind({});
OptionThree.args = {
  id: 'NestedOptions3',
  __typename: 'RadioOption',
  label: 'Watch more videos about Jesus',
  parent: {
    id: 'MoreQuestions',
  },
};

export const OptionFour = Template.bind({});
OptionFour.args = {
  id: 'NestedOption4',
  __typename: 'RadioOption',
  label: 'Ask a question',
  parent: {
    id: 'MoreQuestions',
  },
};

export default Demo as Meta;
