# Shivangi’s Birthday Rescue 🍓
A static, mobile-first birthday arcade by Strawberry. Unlock the arcade, catch 60 points, blow out the candles, then scratch the gold card to discover the gift.

## Run locally
Use Node 20 and npm. From the project folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Run `npm run build` to type-check and generate the static site in `dist/`. Run `npm run preview` to inspect the production build. The game uses one HTML page and all gameplay, audio and animation run on the device.

## Personalize before gifting
Edit **src/config.ts**. Change the names, optional age, question and accepted answers, birthday letter, final sign-off, hazards, roast lines, memory cards, voucher copy and winning score. The starter answer is **Strawberry** or **🍓**. Matching ignores surrounding whitespace and capitalization. The gate is a playful puzzle. Everything in the build is publicly readable.

Enter your WhatsApp number as digits in international format, including country code, without a plus sign. Leaving it blank opens WhatsApp’s recipient picker. The site reveals your message. You send the actual voucher separately in WhatsApp before giving her the game.

Replace the five transparent PNGs in **public/face/** with cutouts of your face. Keep the names **happy.png**, **shocked.png**, **smirk.png**, **crying.png**, and **laughing.png**. A missing reaction image displays a strawberry emoji. The illustrated arcade cover is separate from the replaceable reaction portraits.

Place memory photos in **public/memories/** and use paths like `memories/cafe.webp` in the memoryCards array. Keep each asset smaller than 200 KB. The four short WAV sounds in **public/sounds/** load on demand. You may replace or omit them.

## Controls
Drag across the playfield or press the left and right arrow keys. Treats score points. Gifts unlock cards in order. Missing treats breaks the combo. Hazards take a heart. Chai slows falling objects for five seconds, headphones double points for eight seconds, and a star absorbs one hit. Difficulty increases every ten successful catches. After the warm-up come Exam Season and the Overthinking Shivangi boss. The best score and unlocked memories persist on the current browser when storage is available.

Allow the microphone on the candle screen and blow, or use Tap to blow. Microphone access requires HTTPS or localhost. Rub the scratch card with a finger or mouse. A keyboard-accessible button can also reveal it. Tap the reaction cam five times quickly for a surprise.

## Deploy to GitHub Pages
1. Create a GitHub repository and put the project files at its root on the **main** branch. Include the hidden **.github/workflows/deploy.yml** and the package lockfile. Exclude node_modules and dist.
2. Open the repository’s **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Push to main, or open **Actions → Deploy birthday arcade → Run workflow**.
4. After the deployment job succeeds, open the published URL from the job or **Settings → Pages**. The relative Vite base supports project URLs such as `https://USERNAME.github.io/REPO/`.
5. For changes, edit the source and push to main again.

## Project structure
```text
.github/workflows/deploy.yml   Build and publish with Node 20
public/art/                   Original pixel landscape, mascot and display font
public/face/                  Five replaceable reaction portraits
public/sounds/                Four original sound cues
src/config.ts                 Personalization
src/game.ts                   Canvas loop, controls, levels and collisions
src/main.ts                   Screens, mic, scratch card, audio and storage
src/style.css                 Responsive layout and Tailwind utilities
index.html                    Entry point, favicon and Open Graph metadata
vite.config.ts                Relative deployment base
postcss.config.js             Tailwind build integration
tailwind.config.js            Tailwind source scanning
tsconfig.json                 TypeScript settings
package.json                  Commands and dependencies
package-lock.json             Reproducible dependency versions
```
# Birthday
