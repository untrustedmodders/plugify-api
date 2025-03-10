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
      title: 'shadcn-docs-starter',
      showTitle: false,
      darkModeToggle: true,
      logo: {
        light: '/plg-logo-text.svg',
        dark: '/plg-logo-text-white.svg',
      },
      links: [{
        icon: 'simple-icons:discord',
        to: 'https://discord.gg/untrustedmodders',
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
        to: 'https://discord.gg/untrustedmodders',
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