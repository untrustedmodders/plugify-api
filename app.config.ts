export default defineAppConfig({
  shadcnDocs: {
    site: {
      name: 'plugify',
      description: 'A Modern C++ Plugin and Package Manager with Multi-Language Support. Customizable. Compatible. Open Source.',
      ogImage: '/hero.png',
      ogImageComponent: 'ShadcnDocs',
      ogImageColor: 'light',
    },
    theme: {
      customizable: true,
      color: 'plugify',
      radius: 0.5,
    },
    header: {
      title: 'Plugify API',
      showTitle: false,
      darkModeToggle: true,
      logo: {
        light: '/plg-logo-text.svg',
        dark: '/plg-logo-text-white.svg',
      },
      // Same menu as plugify.net, where this site is "Hub"
      nav: [{
        title: 'Docs',
        to: 'https://plugify.net/',
        target: '_self',
      }, {
        title: 'Guides',
        to: 'https://plugify.net/plugins/s2sdk/guides',
        target: '_self',
      }, {
        title: 'Generator',
        to: 'https://gen.plugify.net/',
        target: '_self',
      }, {
        title: 'Hub',
        to: '/',
        target: '_self',
      }],
      links: [{
        icon: 'simple-icons:discord',
        to: 'https://discord.gg/rX9TMmpang',
        target: '_blank',
      }, {
        icon: 'simple-icons:github',
        to: 'https://github.com/untrustedmodders/',
        target: '_blank',
      }],
    },
    aside: {
      useLevel: true,
      collapse: false,
    },
    main: {
      breadCrumb: true,
      showTitle: true,
    },
    footer: {
      credits: `Copyright © 2023-${new Date().getFullYear()} Plugify - MIT License`,
      links: [{
        icon: 'simple-icons:discord',
        to: 'https://discord.gg/rX9TMmpang',
        target: '_blank',
      }, {
        icon: 'simple-icons:github',
        to: 'https://github.com/untrustedmodders',
        target: '_blank',
      }],
    },
    search: {
      enable: true,
      inAside: false,
    }
  }
});