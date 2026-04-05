# My-Portfolio
A simple portfolio for myself to show my works.

Please, check it out.

## Secure Contact Form Setup (Vercel + GitHub Pages)

This project now sends contact form messages through a secure backend endpoint:

- Frontend calls `/api/contact` on Vercel (or your configured API URL)
- Secrets stay on the server (never in `index.html`)

### 1) Configure Vercel environment variables

Use `.env.vercel.example` as reference and add these in Vercel Project Settings:

- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`
- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_PRIVATE_KEY`

### 2) Configure GitHub Pages frontend

If your frontend runs on GitHub Pages, update `js/site-config.js`:

- Set `contactApiUrl` to your deployed Vercel API URL
- Example: `https://your-vercel-domain.vercel.app/api/contact`

### 3) Security note

- Never commit EmailJS private key into HTML/JS in the browser
- If a private key was previously exposed, rotate/revoke it immediately in EmailJS