import IndexPage from '@components/index_page';
import ProjectsPanel from '@components/my-projects/projects/panel';
import Section from '@components/section';
import main_img from '@public/assets/main_img/main_img';
import Head from 'next/head';

export default function Home() {
  return (
    <div style={{ margin: 0 }}>
      <Head>
        <title>William Guinaudie</title>
        <meta name="description" content="William Guinaudie Portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <IndexPage
        title="WILLIAM GUINAUDIE"
        image={{ src: main_img.computer, width: 657, height: 506 }}
        subTitle="Full Stack Developer"
      />
      <Section title="Projects" Component={ProjectsPanel} />
    </div>
  );
}
