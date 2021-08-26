import styles from './app.module.css';
import { Conductor } from '../components/Conductor/Conductor';
import { Transformer } from '../libs/transformer/Transformer';

import { Route, Link } from 'react-router-dom';
import { BlockType } from '../types';

export function App() {
  return (
    <div className={styles.app}>
      <header className="flex">
        Block renderer & conductor samples
        <Link to="/">Example 1.</Link>
        <Link to="/example-2">Example 2.</Link>
        <Link to="/example-3">Example 3.</Link>
      </header>
      <main>
        <Route
          path="/"
          exact
          render={() => (
            <div>
              <Conductor {...Transformer(data)} />
            </div>
          )}
        />
        <Route
          path="/example-2"
          exact
          render={() => (
            <div>
              <Conductor {...Transformer(data2)} />
            </div>
          )}
        />
        <Route
          path="/example-3"
          exact
          render={() => (
            <div>
              <Conductor {...Transformer(data3)} />
            </div>
          )}
        />
      </main>
    </div>
  );
}

export default App;

const data: BlockType[] = [
  {
    __typename: 'Step',
    id: 'Root',
  },
  {
    __typename: 'Video',
    id: 'Video',
    parent: {
      id: 'Root',
    },
  },
  {
    __typename: 'RadioQuestion',
    label: 'This is a test question 1!',
    id: 'Questions',
    parent: {
      id: 'Root',
    },
  },
  {
    __typename: 'Step',
    id: 'SecondBlock',
  },
  {
    __typename: 'Step',
    id: 'ThirdBlock',
  },
  {
    __typename: 'RadioQuestion',
    id: 'MoreQuestions',
    label: 'This is a test question 2!',
    parent: {
      id: 'ThirdBlock',
    },
  },
  {
    __typename: 'RadioOption',
    id: 'NestedMoreQuestions',
    label: 'Radio Option',
    parent: {
      id: 'MoreQuestions',
    },
  },
];

const data2: BlockType[] = [
  {
    __typename: 'Step',
    id: 'Root Video',
  },
  {
    __typename: 'RadioQuestion',
    id: 'MoreQuestions',
    label: 'How are you today?',
    parent: {
      id: 'Root Video',
    },
  },
  {
    __typename: 'Step',
    id: 'Signup',
  },
];

const data3: BlockType[] = [
  {
    __typename: 'Step',
    id: 'Root Video',
  },
  {
    __typename: 'RadioQuestion',
    id: 'MoreQuestions',
    label: 'How can we help you know more about Jesus?',
    description:
      'What do you think would be the next step to help you grow in your relationship with Jesus?',
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
