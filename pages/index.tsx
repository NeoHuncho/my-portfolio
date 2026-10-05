import dynamic from 'next/dynamic';
import Head from 'next/head';
import Footer from '@components/Footer';
import HeroSection from '@sections/hero/HeroSection';

const ExperienceSection = dynamic(() => import('@sections/experience/ExperienceSection'));
const BoardSection = dynamic(() => import('@sections/board/BoardSection'));
const SideProjectsSection = dynamic(() => import('@sections/sideProjects/SideProjectsSection'));

const description =
  'William Guinaudie, AI Engineer. I build products and the AI workflows around them: agents do the legwork, I make the engineering calls, review the code and ship it.';

export default function Home() {
  return (
    <>
      <Head>
        <title>William Guinaudie · AI Engineer</title>
        <meta name="description" content={description} />
        <meta property="og:title" content="William Guinaudie · AI Engineer" />
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
