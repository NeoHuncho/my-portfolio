import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Grid, Group, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function Header() {
  const isSmall = useMediaQuery('(max-width: 850px)');

  return (
    <Grid style={{ padding: '0.5% 1% 0.5% 1%', position: 'fixed', zIndex: 10, width: '100%' }}>
      <Grid.Col span={4}>
        <Link passHref href="/">
          <Title style={{ fontWeight: 500, color: 'white' }} order={2}>
            W.G
          </Title>
        </Link>
      </Grid.Col>
      <Grid.Col span={isSmall ? 6 : 4}>
        <Group
          position="center"
          style={{
            alignItems: 'center',
            paddingTop: isSmall ? 10 : 0,
            justifyContent: isSmall ? 'flex-start' : 'center',
          }}
          spacing="xl"
        >
          <a href="mailto: william.guinaudie@gmail.com" target="_blank" rel="noreferrer">
            <Image height={25} width={25} src="/assets/socials/email.png" />
          </a>

          <a>
            <Image
              src="/assets/socials/github_white.svg"
              alt="Github link"
              height={25}
              width={25}
            />
          </a>

          <a
            href="https://www.freecodecamp.org/neohuncho"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image src="/assets/socials/fcc.png" alt="Free Code Camp link" height={25} width={33} />
          </a>
        </Group>
      </Grid.Col>
      {isSmall && (
        <Grid.Col span={2} style={{ display: 'flex', justifyContent: 'end' }}>
          <Image src="/assets/ui_img/hamburger.svg" alt="menu" width={23} height={23} />
        </Grid.Col>
      )}
      {/* <ThisMenu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Link passHref href="/">
          <ThisMenuItem onClick={handleClose}>Home</ThisMenuItem>
        </Link>
        <Link passHref href="/my-projects">
          <ThisMenuItem style={{ gridArea: 'myProjects' }} onClick={handleClose}>
            My Projects
          </ThisMenuItem>
        </Link>
        <Link passHref href="/about-me">
          <ThisMenuItem style={{ gridArea: 'aboutMe' }} onClick={handleClose}>
            About Me
          </ThisMenuItem>
        </Link>
      </ThisMenu> */}
      {!isSmall && (
        <Grid.Col span={4}>
          <Group position="right" style={{ alignItems: 'center' }} spacing="xl">
            <Link passHref href="/my-projects">
              <Title style={{ fontWeight: 600, color: 'white' }} order={4}>
                My Projects
              </Title>
            </Link>
            <Link passHref href="/about-me">
              <Title style={{ fontWeight: 600, color: 'white' }} order={4}>
                About Me
              </Title>
            </Link>
          </Group>
        </Grid.Col>
      )}
    </Grid>
  );
}
