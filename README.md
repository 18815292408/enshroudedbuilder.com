# EnshroudedBuilder.com

Enshrouded 1.0 build guides and a skill tree planner. Static site built with Astro + Tailwind and deployed to Cloudflare Pages.

- `scripts/build-skill-data.mjs`: turns the vendored 1.0 game export into `src/data/skilltree.json`
- `src/data/builds.ts`: build definitions. Skill orders are resolved into connected paths, and the build fails if a stage goes over its point budget
- `src/lib/planner-client.ts`: the interactive planner

```sh
pnpm install
pnpm build   # needs Node >= 22.22
```

## Licenses
- Code: GPL-3.0-or-later (see LICENSE). Skill tree data in `vendor/enshrouded-skill-tree` comes from [rossicler/enshrouded-skill-tree](https://github.com/rossicler/enshrouded-skill-tree) (GPL-3.0).
- Item, spell and food facts are adapted from the [Enshrouded Wiki](https://enshrouded.wiki.gg/) (CC BY-SA 4.0).
- Illustrations are original AI-generated artwork made for this site.

EnshroudedBuilder.com is an unofficial fan site. Enshrouded and all related assets are trademarks of Keen Games. Not affiliated with Keen Games.
