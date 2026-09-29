export default defineAppConfig({
  shadcnDocs: {
    site: {
      name: 'Echo Editor',
      description: 'A fast, AI-ready rich-text editor for Vue 3, built on Tiptap 3 and shadcn-vue.',
    },
    theme: {
      customizable: true,
      color: 'zinc',
      radius: 0.5,
    },
    header: {
      title: 'Echo Editor',
      showTitle: true,
      darkModeToggle: true,
      languageSwitcher: {
        enable: false,
        triggerType: 'icon',
        dropdownType: 'select',
      },
      logo: {
        light: '/logo.svg',
        dark: '/logo-dark.svg',
      },
      nav: [
        { title: 'Docs', links: [
          { title: 'Getting started', to: '/getting-started/introduction', description: 'Install and render your first editor.', icon: 'lucide:rocket' },
          { title: 'Guide', to: '/guide/configuration', description: 'Props, extensions, menus, theming and more.', icon: 'lucide:book-open' },
          { title: 'API', to: '/api/editor', description: 'Component, composables, plugins and types.', icon: 'lucide:code' },
        ] },
        { title: 'Extensions', to: '/extensions/overview' },
        { title: 'AI & MCP', to: '/ai/llms-txt' },
      ],
      links: [
        { icon: 'lucide:package', to: 'https://www.npmjs.com/package/vue-echo-editor', target: '_blank' },
        { icon: 'lucide:github', to: 'https://github.com/kemboi22/vue-echo-editor', target: '_blank' },
      ],
    },
    aside: {
      useLevel: true,
      collapse: false,
    },
    main: {
      breadCrumb: true,
      showTitle: true,
      editLink: {
        enable: true,
        pattern: 'https://github.com/kemboi22/vue-echo-editor/edit/main/docs/content/:path',
        text: 'Edit this page on GitHub',
        icon: 'lucide:square-pen',
        placement: ['docsFooter', 'toc'],
      },
    },
    footer: {
      credits: 'MIT Licensed · Built with Tiptap, shadcn-vue and shadcn-docs-nuxt',
      links: [
        { icon: 'lucide:github', to: 'https://github.com/kemboi22/vue-echo-editor', target: '_blank' },
      ],
    },
    toc: {
      enable: true,
      title: 'On this page',
      links: [
        { title: 'Star on GitHub', icon: 'lucide:star', to: 'https://github.com/kemboi22/vue-echo-editor', target: '_blank' },
        { title: 'Report an issue', icon: 'lucide:circle-dot', to: 'https://github.com/kemboi22/vue-echo-editor/issues', target: '_blank' },
        { title: 'llms.txt', icon: 'lucide:bot', to: '/llms.txt', target: '_blank' },
      ],
    },
    search: {
      enable: true,
      inAside: false,
    },
  },
})
