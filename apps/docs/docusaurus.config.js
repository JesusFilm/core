// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
require('dotenv').config()
const darkCodeTheme = require('prism-react-renderer').themes.dracula
const lightCodeTheme = require('prism-react-renderer').themes.github

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Jesus Film Project',
  tagline: 'An Evangelical Christian Media Ministry',
  url: 'https://docs.core.jesusfilm.org',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'jesusfilm',
  projectName: 'core',
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/JesusFilm/core/edit/main/apps/docs/'
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/JesusFilm/core/edit/main/apps/docs/blog/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        appId: process.env.ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_API_KEY,
        indexName: process.env.ALGOLIA_INDEX_NAME
      },
      navbar: {
        title: 'Jesus Film Project',
        logo: {
          alt: 'Jesus Film Logo',
          src: 'img/square.png',
          className: 'logo'
        },
        items: [
          {
            type: 'doc',
            docId: 'welcome',
            position: 'left',
            label: 'Docs'
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/JesusFilm/core',
            label: 'GitHub',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        logo: {
          alt: 'Jesus Film Logo',
          src: 'img/logo.svg',
          width: 256,
          className: 'footer-logo'
        },
        links: [
          {
            title: 'Contact Us',
            items: [
              {
                html: '100 Lake Hart Drive'
              },
              {
                html: 'Orlando, FL, 32832'
              },
              {
                html: 'Office: (407) 826-2300'
              },
              {
                html: 'Fax: (407) 826-2375'
              }
            ]
          },
          {
            title: 'About',
            items: [
              {
                label: 'About the Jesus Film Project',
                href: 'https://www.jesusfilm.org/about/'
              },
              {
                label: 'Contact',
                href: 'https://www.jesusfilm.org/contact/'
              }
            ]
          },
          {
            title: 'Legal',
            items: [
              {
                label: 'Terms of use',
                href: 'https://www.jesusfilm.org/terms/'
              },
              {
                label: 'Legal Statement',
                href: 'https://www.jesusfilm.org/legal/'
              }
            ]
          },
          {
            title: 'Links',
            items: [
              {
                label: 'Blog',
                to: '/blog'
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus'
              }
            ]
          }
        ],
        copyright: `Copyright © 1995-${new Date().getFullYear()} Jesus Film Project ®. All rights reserved.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
}

module.exports = config
