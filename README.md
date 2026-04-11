# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Hero Section Images

Hero carousel slides are stored in `public/images/hero/`.

| Property | Requirement |
| :-------- | :---------- |
| Format | JPEG or WebP |
| Aspect ratio | **16:9 landscape** |
| Recommended size | **1400×788px** (minimum), 1920×1080px for high-DPI screens |
| Orientation | Landscape only — portrait images will be cropped |
| Content | Infographic or action shot; keep key content centred (edges may be cropped on narrower viewports) |

Slides are configured in `src/pages/index.astro` in the `heroSlides` array:

```js
const heroSlides = [
  { image: '/images/hero/your-image.jpg', alt: 'Description of slide', bgColor: '#2a1a5e' },
];
```

- `image` — path relative to `public/`
- `alt` — screen-reader description (required)
- `bgColor` — background colour shown while the image loads (optional, default `#2a1a5e`)

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
