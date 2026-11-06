# Scrapyard — Final Touch-Ups & Marketplace TODO

## 1. UI & Core Polish (Current Touch-Ups)

* [x] **Card Layout Consistency:** Verify project cards handle missing screenshots, long titles, and multi-line "cause of death" / "salvage" notes cleanly without breaking grid height.

* [x] **Profile Pictures / Avatars:**

  * [x] Ensure fallback avatar renders when a user hasn't uploaded a custom profile picture.

  * [x] Verify image uploads compress/resize properly or validate max file size (e.g., `< 5MB`).

* [x] **Search & Filter Controls:**

  * [x] Add a **Price Range filter** (e.g., Free only, Under $25, $25–$100, $100+, or Min/Max inputs) to the main feed filter bar.

  * [x] Sync price range filter state with URL search params (`?min=...&max=...`).

* [x] **Form Validation & States:**

  * [x] Add loading spinners / disabled states on the `/submit` button to prevent double-submissions.

  * [x] Validate GitHub URLs (`https://github.com/...`) before saving.

* [x] **Empty & Error States:** Add clean fallback states when filters return `0` projects or when an API fetch fails.

## 2. Marketplace & Monetization ("Sell Project" Feature)

* [x] **Database Fields Update:**

  * [x] Add `is_for_sale` (boolean) and `price` (number) to the `projects` collection/table.

  * [x] Add `sold` (boolean) or `license_type` (`multiple_clones` vs `one_time_buyout`).

  * [x] Add `archive_file` (or private repo identifier) field that stays hidden from public API responses until purchased.

* [x] **Seller Onboarding (Stripe Connect):**

  * [x] Add `stripe_account_id` and `stripe_onboarded` (boolean) to the `users` table.

  * [x] Create `/api/stripe/connect` route to generate an onboarding link for sellers.

* [x] **Checkout & Platform Cut:**

  * [x] Create `/api/stripe/checkout` route using `application_fee_amount` (e.g., 10% platform fee).

  * [x] Create `/api/stripe/webhook` listening for `checkout.session.completed` to record the purchase in a `purchases` table.

* [x] **Code Delivery Flow:**

  * [x] Unlock the `.zip` download link or trigger a GitHub collaborator invite on the project page once `purchases` confirms the user bought it.

## 3. Legal & Marketplace Compliance Pages

* [x] **Terms of Service (`/terms`):**

  * [x] **"As-Is" Code Disclaimer:** Explicitly state that all abandoned/salvaged code is provided "as-is" with zero warranty, and neither Scrapyard nor the seller is liable if the code is broken or causes issues.

  * [x] **Seller Ownership Agreement:** Require sellers to confirm they actually wrote and own the rights to the code they are uploading/selling (and didn't just rip someone else's repo).

  * [x] **License Definition:** Clarify what a buyer actually gets when they buy a project (e.g., non-exclusive commercial right to use/modify the source code vs. full IP transfer).

* [x] **Privacy Policy (`/privacy`):**

  * [x] Disclose what data is collected (email, username, profile picture, GitHub handle, IP address).

  * [x] State that payment details are processed securely via Stripe and never stored on your servers.

  * [x] Explain cookie/session usage for authentication.

* [x] **Refund & Dispute Policy (`/refunds`):**

  * [x] **All Sales Final Policy:** Because buyers get instant access to raw source code / `.zip` files (which cannot be "returned"), state that all digital sales are final.

  * [x] **Exception Clause:** Outline the only valid refund reason (e.g., the seller uploaded an empty/corrupted archive or completely misrepresented the repo contents) and set a 48-hour window to report it.

* [x] **DMCA / Copyright Takedown (`/dmca`):**

  * [x] Provide an email address (`legal@yourdomain.com` or `dmca@yourdomain.com`) where original authors can report if someone tries to sell their stolen GitHub repo, so you have Safe Harbor protection.

* [x] **Footer & Submission Checkboxes:**

  * [x] Add links to `/terms`, `/privacy`, `/refunds`, and `/dmca` in the global site footer (Stripe requires visible Terms, Privacy, and Refund policies before approving live payouts).

  * [x] Add a required checkbox on `/submit`: *"I confirm I own the rights to this code and agree to the Terms of Service."*

## 4. Infrastructure & Custom `api.` Domain

* [ ] **API Subdomain Routing:**

  * [ ] Point DNS `A` record (or Cloudflare Tunnel `CNAME`) for `api.yourdomain.com` to your backend / PocketBase instance.

  * [ ] Update `.env.production` with `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`.

* [ ] **CORS & File Serving:**

  * [ ] Lock down CORS on the backend so only `yourdomain.com` can make write requests.

  * [ ] Add `api.yourdomain.com` to `images.remotePatterns` in `next.config.ts` so Next.js `<Image />` renders avatars and project screenshots without errors.

## 5. Pre-Launch Seed & Release

* [x] **Seed Initial Projects:** Upload 3–5 of your own shelved projects (mix of Free Salvage and $10–$25 For Sale items) so the feed looks active on day one.

* [ ] **OpenGraph / Social Preview:** Add `og:image` and clean meta tags so links shared on X, Discord, and Reddit render a crisp preview card.

* [x] **Smoke Test:** Do one full test run in production (Sign up -> Upload avatar -> Post free project -> Post paid project -> Test checkout).
