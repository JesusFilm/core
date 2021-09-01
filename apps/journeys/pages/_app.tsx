import { AppProps } from 'next/app';
import Head from 'next/head';
import { JourneysThemeProvider } from '../src/components/JourneysThemeProvider';
import { useEffect } from 'react';

function CustomApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <title>My page</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <JourneysThemeProvider>
        <Component {...pageProps} />
      </JourneysThemeProvider>
    </>
  );
}

export default CustomApp;
