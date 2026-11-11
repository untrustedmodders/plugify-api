# Plugify API Hub

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Listed APIs

The APIs on the home page come from two lists at the project root:

- `manifests.json`: the official ones, offered to every visitor;
- `manifests.community.json`: the ones made by the community, shown under **Community**.

Each entry:

```json
{
  "url": "https://raw.githubusercontent.com/<owner>/<repo>/refs/heads/main/<name>.pplugin.in",
  "slug": "my_plugin",
  "name": "My Plugin",
  "description": "One sentence about what the plugin provides.",
  "icon": "lucide:puzzle",
  "author": "your-name"
}
```

- `slug` is the API's address on the site (`https://api.plugify.net/my_plugin`). The build makes
  a page there with `name` and `description`, which link previews show. Slugs must be unique
  across both lists; removing an entry removes its page with the next deploy.
- `icon` is any [Iconify](https://icon-sets.iconify.design/) name from the bundled sets
  (`lucide:*`, `simple-icons:*`); `author` is shown on community cards only.
- Any other manifest still opens with `?file=<url>`, under the site's general preview.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
