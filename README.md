# Nicole Connect - Web Magazine (EmDash on Cloudflare)

> **📌 管理画面・クイックアクセス**
> - **ローカル管理画面（自動ログイン）**: [http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin](http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin)
> - **ローカル管理画面（通常）**: [http://localhost:4321/_emdash/admin](http://localhost:4321/_emdash/admin)
> - **ローカルサイト**: [http://localhost:4321/](http://localhost:4321/)
> - **本番管理画面**: [https://my-emdash-site.kaz130.workers.dev/_emdash/admin](https://my-emdash-site.kaz130.workers.dev/_emdash/admin)
> - **本番サイト**: [https://my-emdash-site.kaz130.workers.dev/](https://my-emdash-site.kaz130.workers.dev/)

A clean, editorial web magazine built with [EmDash](https://github.com/emdash-cms/emdash) and deployed on Cloudflare Workers with D1 and R2.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/emdash-cms/templates/tree/main/blog-cloudflare)

![Blog template homepage](https://raw.githubusercontent.com/emdash-cms/emdash/main/assets/templates/blog/latest/homepage-light-desktop.jpg)

## What's Included

- Featured post hero on the homepage
- Post archive with reading time estimates
- Category and tag archives
- Full-text search
- RSS feed
- SEO metadata and JSON-LD
- Dark/light mode

## Pages

| Page | Route |
|---|---|
| Homepage | `/` |
| All posts | `/posts` |
| Single post | `/posts/:slug` |
| Category archive | `/category/:slug` |
| Tag archive | `/tag/:slug` |
| Search | `/search` |
| Static pages | `/pages/:slug` |
| 404 | fallback |

## Infrastructure

- **Runtime:** Cloudflare Workers
- **Database:** D1
- **Storage:** R2
- **Framework:** Astro with `@astrojs/cloudflare`

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:4321/_emdash/admin and complete the setup wizard. EmDash runs database migrations and applies the blog seed during setup. The site is available at http://localhost:4321.

## Deploying

```bash
npx wrangler login
npm run deploy
```

The first deployment provisions the named D1 database and R2 bucket from `wrangler.jsonc`. See [Deploy to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/) for production setup, or use the deploy button above.

## See Also

- [Node.js variant](../blog) -- same template using SQLite and local file storage
- [All templates](../)
- [EmDash documentation](https://docs.emdashcms.com/)
