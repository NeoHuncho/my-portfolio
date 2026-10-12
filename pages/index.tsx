import dynamic from 'next/dynamic';
import Head from 'next/head';
import Footer from '@components/Footer';
import HeroSection from '@sections/hero/HeroSection';

const ExperienceSection = dynamic(() => import('@sections/experience/ExperienceSection'));
const BoardSection = dynamic(() => import('@sections/board/BoardSection'));
const SideProjectsSection = dynamic(() => import('@sections/sideProjects/SideProjectsSection'));

const description =
  'William Guinaudie, full-stack engineer in Lausanne. I build software with AI agents, and the setup that lets them work well in a real codebase.';

export default function Home() {
  return (
    <>
      <Head>
        <title>William Guinaudie · Full-stack Engineer</title>
        <meta name="description" content={description} />
        <meta property="og:title" content="William Guinaudie · Full-stack Engineer" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.williamguinaudie.com/" />
        {/* The desk’s three pieces, not the profile photo, in link previews. Images are cached as immutable: rename the file to change it. */}
        <meta property="og:image" content="https://www.williamguinaudie.com/og-desk-1.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="The hero desk: a laptop, the Claude Code and Codex marks, and a night-shift board"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.williamguinaudie.com/og-desk-1.jpg" />
      </Head>
      <HeroSection />
      <ExperienceSection />
      <BoardSection />
      <SideProjectsSection />
      <Footer />
    </>
  );
}
