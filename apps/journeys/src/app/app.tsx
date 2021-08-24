import styles from './app.module.css';
import { Conductor } from '../Conductor/Conductor';
import { Transformer } from '../Transformer/Transformer';

import { Route, Link } from 'react-router-dom';

export function App() {
  return (
    <div className={styles.app}>
      <header className="flex">
        Block renderer & conductor samples
        <Link to="/">Example 1.</Link>
        <Link to="/example-2">Example 2.</Link>
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
      </main>
    </div>
  );
}

export default App;

const data = [{
    "id":"Root",
  },
  {
    "parentId":"Root",
    "id":"Video",
  },
  {
    "parentId":"Root",
    "id":"Questions",
  },
  {
    "id":"SecondBlock",
  },
  {
    "id":"ThirdBlock",
  },
  {
    "parentId":"ThirdBlock",
    "id":"MoreQuestions",
  },
]

const data2 = [{
    "id":"Root Video",
  },
  {
    "parentId":"Root Video",
    "id":"Questions",
  },
  {
    "id":"Signup",
  },
]
