import React from 'react';
import { motion } from 'framer-motion';
import { Carousel } from '@mantine/carousel';
import { createStyles, Grid } from '@mantine/core';
import Image from 'next/image';
import { useMediaQuery } from '@mantine/hooks';
// const Image = styled(motion.img)`
//   max-width: 85px;
//   height: fit-content;
// `;

// const Grid = styled(motion.div)`
//   display: flex;
//   flex-direction: row;
//   flex-wrap: wrap;
//   justify-content: space-evenly;
//   background-color: whitesmoke;
//   padding: 10px;
// `;
const useStyles = createStyles((_theme, _params, getRef) => ({
  controls: {
    ref: getRef('controls'),
    transition: 'opacity 150ms ease',
    opacity: 0,
  },

  root: {
    '&:hover': {
      [`& .${getRef('controls')}`]: {
        opacity: 1,
      },
    },
  },
  control: {
    '&[data-inactive]': {
      opacity: 0,
      cursor: 'default',
    },
  },
}));
function SpecialtiesTab({ items }: any) {
  const isSmall = useMediaQuery('(max-width: 600px)');
  const { classes } = useStyles();
  const limit = isSmall ? 4 : 9;
  if (items.length < limit) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 2] }}
        transition={{ times: [0, 0.5, 1.2], ease: 'easeInOut' }}
      >
        <Grid
          style={{
            marginTop: '2%',
            paddingBottom: '1%',
            paddingTop: '1%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5%',
          }}
        >
          {items.map((item: any, index: number) => (
            <Image
              key={index}
              src={item.image.src}
              alt={item.image.name}
              width={100}
              height={100}
            />
          ))}
        </Grid>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 2] }}
      transition={{ times: [0, 0.5, 1.2], ease: 'easeInOut' }}
    >
      <Carousel
        align="start"
        dragFree
        controlsOffset="xs"
        classNames={classes}
        slideSize={isSmall ? '33%' : '11.5%'}
        slideGap={isSmall ? 'xl' : 'sm'}
        loop
        styles={{
          viewport: { paddingBottom: 0 },
          indicators: { bottom: 12 },
          indicator: { backgroundColor: 'black' },
          container: { alignItems: 'center', marginTop: '1%' },
        }}
      >
        {items.map((item: any, index: number) => (
          <Carousel.Slide key={index}>
            <Image
              key={index}
              src={item.image.src}
              alt={item.image.name}
              width={100}
              height={100}
            />
          </Carousel.Slide>
        ))}
      </Carousel>
    </motion.div>
  );
}

export default SpecialtiesTab;
