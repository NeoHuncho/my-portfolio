import computer from '@assets/floatingComputer.svg';
import MobileSocialShortcut from '@components/MobileSocialShortcut';
import Section from '@components/Section';
import { useLanguage } from 'hooks/useLanguage';
import { useSmoothSectionScroll } from 'hooks/useSmoothSectionScroll';
import Head from 'next/head';
import { AboutSection, HeroSection, ProjectsSection } from 'sections';

export default function Home() {
  // Enable smooth section scrolling for Chrome
  useSmoothSectionScroll('.scroll-container');
  const { strings } = useLanguage();

  return (
    <div style={{ margin: 0 }} className="scroll-container">
      <Head>
        <title>William Guinaudie</title>
        <meta name="description" content="William Guinaudie Portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HeroSection
        title="WILLIAM GUINAUDIE"
        image={{ src: computer, width: 657, height: 506 }}
        subTitle={strings.heroSubtitle}
        ctaLabel={strings.heroScrollLabel}
      />
      <Section Component={ProjectsSection} id="projects-section" />
      <Section Component={AboutSection} id="about-section" />
      <MobileSocialShortcut />
    </div>
  );
}

