//@ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  Divider,
  Button,
  Image,
  Group,
  Title,
  ActionIcon,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { useHover, useMediaQuery } from '@mantine/hooks';
import { Carousel } from '@mantine/carousel';

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
const ProjectCard = ({ item }) => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 500px)');
  const { hovered, ref } = useHover();
  return (
    <Card
      radius="lg"
      shadow="xl"
      withBorder
      style={
        hovered && item.link
          ? { transform: 'scale(0.98)', transitionDuration: '0.5s' }
          : { transform: 'scale(1)', transitionDuration: '0.5s' }
      }
    >
      <Card.Section ref={ref}>
        <a href={item.link} target="_blank" rel="noreferrer">
          <Image
            fit={isMobile ? 'contain' : 'cover'}
            alt={item.image.name}
            height={isMobile ? 160 : 250}
            src={item.image.image.src}
          />
        </a>
      </Card.Section>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: isMobile ? '340px' : '250px',
          justifyContent: 'space-around',
        }}
      >
        <div>
          <Group align="center" style={{ marginTop: 10 }}>
            <Title order={3}>{item.title}</Title>
            {item.github && (
              <ActionIcon href={item.github} component="a" target="_blank">
                <Image src="/assets/socials/github_white.svg" height={20} width={20} />
              </ActionIcon>
            )}
          </Group>
          <Title order={5} style={{ marginTop: 5 }}>
            {item.subTitle}
          </Title>
          <Divider style={{ marginTop: 5 }} size="md" />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            height: '100%',
          }}
        >
          <Group
            align="center"
            position="center"
            spacing="xl"
            style={{
              padding: 10,
              marginTop: 10,
              backgroundColor: 'snow',
              width: 'fit-content',
              borderRadius: 10,
            }}
          >
            {item.technologies.map((technology, index) => (
              <Image
                key={index}
                alt={technology.name}
                src={technology.image.src}
                width={40}
                fit="contain"
              />
            ))}
          </Group>

          <Button
            disabled
            radius="md"
            style={{
              marginTop: 20,
              color: 'white',
              width: '100%',
              backgroundColor:
                item.statusCode === 1
                  ? theme.colors.blue[8]
                  : item.statusCode === 2
                  ? theme.colors.orange[8]
                  : item.statusCode === 3
                  ? theme.colors.red[8]
                  : theme.colors.green[8],
              cursor: 'default',
            }}
          >
            {item.status}
          </Button>
        </div>
      </div>
    </Card>
  );
};
const ProjectTab = ({ items }) => {
  const { classes } = useStyles();
  const isMobile = useMediaQuery('(max-width: 500px)');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 1] }}
      transition={{ times: [0, 0.5, 1.1], ease: 'easeInOut' }}
      style={{ marginTop: '30px' }}
    >
      <Carousel
        withControls={!isMobile}
        slideSize={isMobile ? '90%' : '40%'}
        slideGap={isMobile ? 'md' : 'xl'}
        controlsOffset="xs"
        classNames={classes}
        align={isMobile ? 'center' : 'start'}
      >
        {items.map((item) => (
          <Carousel.Slide key={item.title} style={{ borderRadius: '40px' }}>
            <ProjectCard item={item} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </motion.div>
  );
};

export default ProjectTab;
