# Haven website

Marketing page, Privacy Policy, and Terms of Use for Haven (Next.js, static).

- `npm install && npm run dev` to preview at http://localhost:3000
- Company name, contact email, state, and effective date live in `app/site.js`.
- Update the effective date whenever the policy text changes.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project**, import the repo, set **Root Directory** to `website`.
3. Deploy. The privacy policy URL is `https://<project>.vercel.app/privacy`.
