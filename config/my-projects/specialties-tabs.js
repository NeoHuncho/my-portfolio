import technologies from "../../public/assets/technologies/logo_text";

const myProjectsTabs = [
  {
    label: "Programming Languages",
    items: [technologies.ts, technologies.python, technologies.cSharp],
  },
  {
    label: "Front-end Technologies",
    items: [
      technologies.react,
      technologies.next,
      technologies.redux,
      technologies.mantine,
      technologies.reactQuery,
      technologies.framerMotion,
      technologies.styledComponents,
      technologies.tailwind,
      technologies.chrome,
      technologies.d3,
    ],
  },
  {
    label: "Back End Technologies",
    items: [
      technologies.node,
      technologies.express,
      technologies.tRPC,
      technologies.serverless,
      technologies.gcPlatform,
      technologies.firebase,
    ],
  },
  {
    label: "Database Technologies",
    items: [technologies.mySQL, technologies.firebase, technologies.mongodb],
  },
  {
    label: "Storage And Deployment",
    items: [
      technologies.github,
      technologies.netlify,
      technologies.npm,
      technologies.vercel,
    ],
  },
  {
    label: "Design Tools",
    items: [
      technologies.figma,
      technologies.ae,
      technologies.illustrator,
      technologies.premiere,
    ],
  },
];
export default myProjectsTabs;
