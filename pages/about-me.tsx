import Head from 'next/head';

import TopPage from '@components/top_page';
import Section from '@components/section';

import Timeline from '@components/about-me/timeline';
import MoreInformation from '@components/about-me/more_information';
import main_img from '@public/assets/main_img/main_img';

export default function MyProjects() {
  return (
    <div style={{ margin: 0 }}>
      <Head>
        <title>William Guinaudie: About Me</title>
        <meta name="description" content="William Guinaudie: About Me" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopPage title="WHO AM I?" image={{ src: main_img.me_back, width: 657, height: 506 }} />
      <Section title="More Information" Component={MoreInformation} />
      <Section title="Timeline" Component={Timeline} />
    </div>
  );
}
