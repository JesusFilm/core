import styles from './app.module.css';
import { Conductor } from '../Conductor/Conductor';
import { Route, Link } from 'react-router-dom';
import { data1, data2 } from '../data/data';
import transformer from '../transformer';
import { BlockProps } from '../BlockRenderer/BlockRenderer';

const transformed1 = transformer<BlockProps>(data1)
const transformed2 = transformer<BlockProps>(data2)

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
              <Conductor blocks={transformed1} />
            </div>
          )}
        />
        <Route
          path="/example-2"
          exact
          render={() => (
            <div>
              <Conductor blocks={transformed2} />
            </div>
          )}
        />
      </main>
    </div>
  );
}

export default App;

