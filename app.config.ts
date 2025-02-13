export default defineAppConfig({
  shadcnDocs: {
    site: {
      name: 'plugify',
      description: 'A Modern C++ Plugin and Package Manager with Multi-Language Support. Customizable. Compatible. Open Source.',
    },
    theme: {
      customizable: true,
      color: 'zinc',
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
      nav: [{
        title: 'Docs',
        links: [{
          title: 'Getting Started',
          to: '/getting-started',
          description: 'Start building your document with shadcn-docs-nuxt',
          icon: 'lucide:rocket',
        }, {
          title: 'Components',
          to: '/components/prose',
          description: 'Explore available UI components and usage examples.',
          icon: 'lucide:box',
        }, {
          title: 'API',
          to: '/api/configuration/shadcn-docs',
          description: 'Discover the configurations and exposed APIs.',
          target: '_self',
          icon: 'lucide:code',
        }],
      }, 
      {
        title: 'Generator',
        to: 'https://untrustedmodders.github.io/plugify-generator',
        target: '_self',
        showLinkIcon: true,
      }],
      links: [{
        icon: 'simple-icons:github',
        to: 'https://github.com/untrustedmodders/',
        target: '_blank',
      },
      {
        icon: 'simple-icons:discord',
        to: 'https://discord.gg/untrustedmodders',
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
      credits: `© untrustedmodders 2023-${new Date().getFullYear()}`,
      links: [{
        icon: 'simple-icons:github',
        to: 'https://github.com/untrustedmodders',
        target: '_blank',
      }],
    },
    toc: {
      enable: true,
      title: 'On This Page',
      links: [{
        title: 'Star on GitHub',
        icon: 'lucide:star',
        to: 'https://github.com/untrustedmodders/plugify',
        target: '_blank',
      }, {
        title: 'Create Issues',
        icon: 'lucide:circle-dot',
        to: 'https://github.com/untrustedmodders/plugify/issues',
        target: '_blank',
      }],
    },
    search: {
      enable: true,
      inAside: false,
    }
  }
});