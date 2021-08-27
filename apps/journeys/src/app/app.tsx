import { ReactElement } from 'react'
import styles from './app.module.css'
import { Conductor } from '../components/Conductor/Conductor'
import { Transformer } from '../libs/transformer/Transformer'
import { JourneysThemeProvider } from '../components/JourneysThemeProvider'
import { Route, Link } from 'react-router-dom'
import { BlockType } from '../types'

export function App (): ReactElement {
  return (
    <JourneysThemeProvider>
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
    </JourneysThemeProvider>
  )
}

export default App

const data: BlockType[] = [
  {
    __typename: 'Step',
    id: 'Root'
  },
  {
    __typename: 'Video',
    id: 'Video',
    parent: {
      id: 'Root'
    }
  },
  {
    __typename: 'RadioQuestion',
    label: 'This is a test question 1!',
    id: 'Questions',
    variant: 'light',
    parent: {
      id: 'Root'
    }
  },
  {
    __typename: 'Step',
    id: 'SecondBlock'
  },
  {
    __typename: 'Step',
    id: 'ThirdBlock'
  },
  {
    __typename: 'RadioQuestion',
    id: 'MoreQuestions',
    label: 'This is a test question 2!',
    parent: {
      id: 'ThirdBlock'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedMoreQuestions',
    label: 'Radio Option',
    parent: {
      id: 'MoreQuestions'
    }
  }
]

const data2: BlockType[] = [
  {
    __typename: 'Step',
    id: 'Root Video'
  },
  {
    __typename: 'RadioQuestion',
    id: 'MoreQuestions',
    label: 'How are you today?',
    variant: 'dark',
    parent: {
      id: 'Root Video'
    }
  },
  {
    __typename: 'Step',
    id: 'Signup'
  }
]

const data3: BlockType[] = [
  {
    __typename: 'Step',
    id: 'Root Video'
  },
  {
    __typename: 'RadioQuestion',
    id: 'MoreQuestions',
    label: 'How can we help you know more about Jesus?',
    description:
      'What do you think would be the next step to help you grow in your relationship with Jesus?',
    variant: 'light',
    parent: {
      id: 'Root Video'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedOptions',
    label: 'Chat Privately',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedOptions2',
    label: 'Get a bible',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedOptions3',
    label: 'Watch more vidoes about Jesus',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedOptions4',
    label: 'Ask a question',
    parent: {
      id: 'MoreQuestions'
    }
  }
]
