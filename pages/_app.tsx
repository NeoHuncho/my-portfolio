import Header from '@components/header';
import { Analytics } from "@vercel/analytics/next";
import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

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
        }}
      >
        <Header />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Analytics />
      </div>
    </>
  );
}
