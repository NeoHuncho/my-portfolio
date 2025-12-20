import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preload hero image for better LCP on desktop */}
        <link
          rel="preload"
          href="/assets/floatingComputer.svg"
          as="image"
          type="image/svg+xml"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
