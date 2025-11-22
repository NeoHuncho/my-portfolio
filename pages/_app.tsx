import Header from '@components/header';
import NextApp, { AppContext, AppProps } from 'next/app';
import Head from 'next/head';
import { useMediaQuery } from '../hooks/useMediaQuery';
import '../styles/globals.css';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const isSmall = useMediaQuery('(max-width: 850px)');

  return (
    <>
      <Head>
        <title>Portfolio</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>

      <div 
        className="min-h-screen flex flex-col overflow-hidden"
        style={{
          background:
            'radial-gradient(50% 98.88% at 50% 50%, #16045e 18.23%, #0e021e 100%)',
          padding: !isSmall ? '20px 20px 0px 20px' : '10px 10px 0px 10px',
        }}
      >
        <header className="h-[60px] w-full bg-transparent border-none">
          <Header />
        </header>
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
  };
};
