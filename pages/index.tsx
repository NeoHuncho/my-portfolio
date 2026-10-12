import dynamic from 'next/dynamic';
import Head from 'next/head';
import Footer from '@components/Footer';
import HeroSection from '@sections/hero/HeroSection';

const ExperienceSection = dynamic(() => import('@sections/experience/ExperienceSection'));
const BoardSection = dynamic(() => import('@sections/board/BoardSection'));
const SideProjectsSection = dynamic(() => import('@sections/sideProjects/SideProjectsSection'));

const description =
  'William Guinaudie, full-stack engineer in Lausanne. I build software with AI agents, and my job is getting the plans right and deciding what’s worth building.';

export default function Home() {
  return (
    <>
      <Head>
        <title>William Guinaudie · Full-stack Engineer</title>
        <meta name="description" content={description} />
        <meta property="og:title" content="William Guinaudie · Full-stack Engineer" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
      </Head>
      <HeroSection />
      <ExperienceSection />
      <BoardSection />
      <SideProjectsSection />
      <Footer />
    </>
  );
}
