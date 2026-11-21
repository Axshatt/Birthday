# A birthday postcard for Shivangi
A mobile-first pixel-art birthday wish from Strawberry. The postcard opens directly with Shivangi’s portrait, a cutout signature, a personal letter, candles and a scratch-off gift.

## Personalize
Edit the names, letter, optional age, voucher message and WhatsApp number in `src/config.ts`. Use international digits without a plus sign. Send the actual voucher separately. The displayed photos are in `public/photos/`. The sender sticker uses a CSS outline fitted to this photo.

## Local preview
With Node 20 installed, run `npm install`, then `npm run dev`. Run `npm run build` for the static output and `npm run preview` to preview that build.

## GitHub Pages
Push the project to main. In Settings → Pages → Source choose GitHub Actions. The deployment workflow builds and uploads dist. Open the published link after deployment succeeds. All assets use repository-relative paths. Microphone candles also have a tap fallback.
