import { type AppProps } from 'next/app';
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import CommandPalette from '@components/CommandPalette';
import Header from '@components/Header';
import { LanguageProvider } from '@contexts/LanguageContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width, viewport-fit=cover" />
        <meta name="theme-color" content="#0b0b0d" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <div className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen font-sans`}>
        <LanguageProvider>
          <Header />
          <main>
            <Component {...pageProps} />
          </main>
          <CommandPalette />
        </LanguageProvider>
      </div>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
