import Head from 'next/head';
import main_img from '@public/assets/main_img/main_img';
import IndexPage from '@components/index_page';

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
      <IndexPage
        title="MY PROJECTS"
        image={{ src: main_img.workspace, width: 1254, height: 647 }}
        link="/my-projects"
      />
      <IndexPage
        title="ABOUT ME"
        image={{ src: main_img.astronaut, width: 657, height: 506 }}
        link="/about-me"
      />
    </div>
  );
}
