// import projects from 'public/assets/projects/index';
import projects from '@public/assets/projects/index';
import technologies from '@public/assets/technologies/logo_full';

//statusCodes Equivilants
//1- active
//2 - on Hold
//3 - Abandoned
//4 - Completed

const myProjectsTabs = [
  {
    label: 'Professional Work',
    items: [
      {
        title: 'Cagette & Paprika Website',
        status: 'Acquired by Auchan Retail',
        statusCode: 1,
        subTitle: 'Ported PHP frontend to React TS. Added new features and improved UX.',
        image: projects.paprikaWeb,
        technologies: [
          technologies.typescript,
          technologies.react,
          technologies.redux,

          technologies.mantine,
        ],
        period: '2021 - 2023',
      },
      {
        title: 'Cagette & Paprika React Native App',
        status: 'Acquired by Auchan Retail',
        statusCode: 1,
        subTitle:
          'Groceries Home delivery App. Available for users from Lille (France), on Android & IOS.',
        image: projects.cpMobile,
        technologies: [
          technologies.typescript,
          technologies.react,
          technologies.redux,
          technologies.rnNavigation,
          technologies.firebase,
        ],
        period: '2021 - 2023',
      },
      {
        title: 'Cagette et Paprika Backend',
        status: 'Acquired by Auchan Retail',
        statusCode: 1,
        subTitle: 'Backend hosted on OVH server. Powered by Node and PHP.',
        image: projects.cpBackend,
        technologies: [
          technologies.node,
          technologies.express,
          technologies.mySQL,
          technologies.algolia,
          technologies.PHP,
          technologies.wooCommerce,
        ],
        period: '2021 - 2023',
      },
      {
        title: "Slot Allocation Management System (SAM)",
        status: "Acquired by Auchan Retail",
        statusCode: 1,
        subTitle:
          "A web application to manage the allocation of slots to maximize the efficiency of milkman style delivery.",
        image: projects.sam,
        technologies: [
          technologies.typescript,
          technologies.react,
          technologies.reactQuery,
          technologies.node,
          technologies.express,
          technologies.mongodb,
        ],
        period: '2021 - 2023',
      },
      {
        title: 'Cagette & Paprika website (legacy)',
        status: 'Legacy',
        statusCode: 2,
        subTitle: 'Wordpress frontend with WooCommerce(PHP).',
        image: projects.cpWeb,
        technologies: [technologies.wordPress, technologies.PHP, technologies.wooCommerce],
        period: '2021 - 2022',
      },
    ],
  },
  {
    label: 'Personal Projects',
    items: [
      {
        title: 'Brawl Max',
        status: 'Removed from stores',
        statusCode: 3,
        subTitle:
          'React Native game-companion app, with multiple functionalities to help players improve. Available on Android & IOS.',
        image: projects.brawlMax,
        technologies: [
          technologies.javascript,
          technologies.react,
          technologies.redux,
          technologies.python,
          technologies.node,
          technologies.gcPlatform,
          technologies.firebase,
        ],
      },
    ],
  },
];
export default myProjectsTabs;
