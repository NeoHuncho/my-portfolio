import { type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { type GetStaticProps } from 'next';

/**
 * Development only: each exhibit of the phone hero on its plinth, on a
 * transparent canvas, to save as the stills shown until its 3D is ready
 * (public/assets/showcase/). Not built for production.
 */
export const getStaticProps: GetStaticProps = async () =>
  process.env.NODE_ENV === 'production' ? { notFound: true } : { props: {} };

const Sprites = dynamic(() => import('@sections/hero/playground/Sprites'), { ssr: false });

export default function SpritesPage(): ReactNode {
  return <Sprites />;
}
