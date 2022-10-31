import Head from 'next/head';

import TopPage from '@components/top_page';
import Section from '@components/section';

import ProjectsPanel from '@components/my-projects/projects/panel';
import SpecialtiesPanel from '@components/my-projects/specialties/panel';
import main_img from '@public/assets/main_img/main_img';

export default function MyProjects() {
  return (
    <div style={{ margin: 0 }}>
      <Head>
        <title>William Guinaudie: My Projects</title>
        <meta name="description" content="William Guinaudie: My Projects" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopPage
        title="MY PROJECTS"
        image={{ src: main_img.computer_projects, width: 1254, height: 657 }}
      />
      <Section title="Projects" Component={ProjectsPanel} />
      <Section title="Specialties" Component={SpecialtiesPanel} />
    </div>
  );
}
