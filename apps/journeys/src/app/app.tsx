import { ReactElement } from 'react'
import styles from './app.module.css'
import { Conductor } from '../components/Conductor'
import { JourneysThemeProvider } from '../components/JourneysThemeProvider'
import { BrowserRouter, Route, Link } from 'react-router-dom'
import { BlockType } from '../types'
import { data1, data2, data3 } from '../data'
import transformer from '../libs/transformer'

const transformed1 = transformer<BlockType>(data1)
const transformed2 = transformer<BlockType>(data2)
const transformed3 = transformer<BlockType>(data3)

export function App (): ReactElement {
  return (
    <JourneysThemeProvider>
      <BrowserRouter>
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
          <Route
            path="/example-3"
            exact
            render={() => (
              <div>
                <Conductor blocks={transformed3} />
              </div>
            )}
            />
        </main>
      </div>
      </BrowserRouter>
    </JourneysThemeProvider>
  )
}

export default App
