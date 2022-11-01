import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Grid, Group, Menu, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function Header() {
  const isSmall = useMediaQuery('(max-width: 850px)');

  return (
    <Grid style={{ padding: '0.5% 1% 0.5% 1%', position: 'fixed', zIndex: 10, width: '99%' }}>
      <Grid.Col span={4}>
        <Link passHref href="/">
          <Title
            style={{
              fontWeight: 500,
              color: 'white',
              cursor: 'pointer',
              paddingTop: isSmall ? 5 : 0,
            }}
            order={2}
          >
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
          <a style={{ cursor: 'pointer' }} href="mailto:william.guinaudie@gmail.com">
            <Image height={25} width={25} src="/assets/socials/email.png" />
          </a>

          <a
            style={{ cursor: 'pointer' }}
            href="https://github.com/NeoHuncho"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/assets/socials/github_white.svg"
              alt="Github link"
              height={25}
              width={25}
            />
          </a>

          <a
            style={{ cursor: 'pointer' }}
            href="https://www.freecodecamp.org/neohuncho"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image src="/assets/socials/fcc.png" alt="Free Code Camp link" height={25} width={33} />
          </a>
        </Group>
      </Grid.Col>
      {isSmall && (
        <Menu>
          <Menu.Target>
            <Grid.Col span={2} style={{ display: 'flex', justifyContent: 'end' }}>
              <Image src="/assets/ui_img/hamburger.svg" alt="menu" width={23} height={23} />
            </Grid.Col>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>
              <Link href="/my-projects" passHref>
                <Text>My Projects</Text>
              </Link>
            </Menu.Item>
            <Menu.Item>
              <Link href="/about-me" passHref>
                <Text>About Me</Text>
              </Link>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}

      {!isSmall && (
        <Grid.Col span={4}>
          <Group position="right" style={{ alignItems: 'center' }} spacing="xl">
            <Link passHref href="/my-projects">
              <Title style={{ fontWeight: 600, color: 'white', cursor: 'pointer' }} order={4}>
                My Projects
              </Title>
            </Link>
            <Link passHref href="/about-me">
              <Title style={{ fontWeight: 600, color: 'white', cursor: 'pointer' }} order={4}>
                About Me
              </Title>
            </Link>
          </Group>
        </Grid.Col>
      )}
    </Grid>
  );
}
