# Library references

Fetch these when you need an API you are unsure of. Prefer `llms.txt` where
listed: it is the docs index written for agents. Check the installed version in
the nearest `package.json` first; docs default to the latest release.

## TanStack (web)

Installed TanStack packages ship skills that match the installed version. Use
them before the website:

```bash
pnpm exec intent list                              # every skill, with its load command
pnpm exec intent load @tanstack/react-start#...    # print one skill
```

Packages without an Intent skill yet, and the full docs:

| Library     | Docs                                                              |
| ----------- | ----------------------------------------------------------------- |
| Index (all) | https://tanstack.com/llms.txt                                     |
| Start       | https://tanstack.com/start/latest/docs/framework/react/overview   |
| Router      | https://tanstack.com/router/latest/docs/framework/react/overview  |
| Query       | https://tanstack.com/query/latest/docs/framework/react/overview   |
| Form        | https://tanstack.com/form/latest/docs/framework/react/quick-start |
| Table       | https://tanstack.com/table/latest                                 |

## Backend

| Library       | Docs                                     |
| ------------- | ---------------------------------------- |
| NestJS        | https://docs.nestjs.com                  |
| Drizzle ORM   | https://orm.drizzle.team/llms.txt        |
| Drizzle Kit   | https://orm.drizzle.team/docs/migrations |
| node-postgres | https://node-postgres.com                |

## Shared

| Library  | Docs                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| Zod 4    | https://zod.dev/llms.txt                                                                                    |
| ts-rust  | https://github.com/komasayuki/ts-rust (README is the only doc; read `node_modules/ts-rust/dist/index.d.ts`) |
| Nx       | https://nx.dev/llms.txt                                                                                     |
| Vitest   | https://vitest.dev/llms.txt                                                                                 |
| oxlint   | https://oxc.rs/docs/guide/usage/linter.html                                                                 |
| Prettier | https://prettier.io/docs/options                                                                            |
