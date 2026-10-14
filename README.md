# Fashion X — storefront and secure checkout

Fashion X is a responsive apparel storefront rebuilt from the repository's original static demo. It includes product discovery, product details and sizing, a persistent local bag and saved list, Firebase email/Google authentication, account order history, and a Stripe-hosted checkout flow with server-side price validation and signed webhook confirmation.

## Run locally

```sh
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The store catalog is sample content with demo pricing in USD; replace product copy, photos, and prices with inventory you are authorized to sell before accepting orders.

## Connect Firebase

1. Create or select a Firebase project and register a Web app.
2. Enable **Authentication → Sign-in method → Email/Password** and optionally Google. Add the deployed domain to **Authentication → Settings → Authorized domains**.
3. Create a Firestore database.
4. Put the Web app config in the `NEXT_PUBLIC_FIREBASE_*` variables in `.env.local`.
5. Create a Firebase service account for the server and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`. Keep the service-account key server-only; never use a `NEXT_PUBLIC_` prefix.
6. Deploy the included deny-by-default rules and order query index:

   ```sh
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,firestore:indexes --project YOUR_FIREBASE_PROJECT_ID
   ```

Orders are written and read through authenticated server routes using Firebase Admin. The browser is not allowed direct Firestore access by `firestore.rules`.

## Connect Stripe

1. Start with Stripe test-mode API keys and add `STRIPE_SECRET_KEY` to local/Vercel server environment variables.
2. Create a Stripe webhook endpoint at `https://YOUR_DOMAIN/api/stripe/webhook`.
3. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `checkout.session.expired`; put the endpoint signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Test a complete purchase with Stripe's test card before using live keys. Checkout pricing is looked up on the server from `src/lib/catalog.ts`; client-provided prices are never trusted.

Checkout currently offers USD shipping to the US, Canada, UK, Australia, and India; shipping is $8 below $100 and complimentary at $100. Tax calculation, inventory reservation, fulfillment, refunds, and store-admin/catalog management are not included. Sample product names, copy, images, and prices must be replaced with approved inventory, and return terms and support contact details must be published before live sales. Configure tax, shipping, and operational policies for the actual business before launch.

## Deploy on Vercel

Import `rahulgarg55/Ecommerce-Website-Clone` into Vercel with the repository root as the project root. Add all Firebase and Stripe environment variables to the Vercel project, deploy Firestore rules/indexes, and redeploy. Configure the Stripe webhook against the Vercel production domain. Never commit `.env.local`, Firebase service-account keys, or Stripe secret keys.

Until credentials are configured, the storefront remains browseable, but account creation, order history, and checkout are intentionally unavailable. Do not advertise real payments as enabled until Firebase and Stripe test-mode checkout have both been verified end to end.
