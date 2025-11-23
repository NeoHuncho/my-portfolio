import computer from '@assets/floatingComputer.svg';
import Section from '@components/section';
import Head from 'next/head';
import Hero from 'sections/hero';
import ProjectsPanel from 'sections/myProjects/panel';

export default function Home() {
  return (
    <div style={{ margin: 0 }}>
      <Head>
        <title>William Guinaudie</title>
        <meta name="description" content="William Guinaudie Portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Hero
        title="WILLIAM GUINAUDIE"
        image={{ src: computer, width: 657, height: 506 }}
        subTitle="Full Stack Developer"
      />
      <Section title="Projects" Component={ProjectsPanel} />
    </div>
  );
}
