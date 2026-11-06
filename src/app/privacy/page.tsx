import React from 'react';
import { LegalLayout, Section } from '@/components/LegalLayout';

export const metadata = {
  title: 'Privacy Policy — Scrapyard',
  description: 'How Scrapyard collects, handles, and protects developer information and transaction data.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="Last updated: November 2026. This policy explains what information Scrapyard collects, why we collect it, and how your privacy is guarded."
    >
      <Section title="1. Information We Collect">
        <p>
          We collect only the minimum data required to facilitate code repository deposits, identity verification, and marketplace transactions:
        </p>
        <ul>
          <li>
            <strong>Account Credentials:</strong> When creating an account, we store your chosen username, email address, encrypted password hash, and optional profile avatar.
          </li>
          <li>
            <strong>Project Submissions:</strong> Titles, descriptions of why projects were abandoned, salvageable code excerpts, uploaded preview images, tags, public GitHub repository links, and uploaded source archives (.zip).
          </li>
          <li>
            <strong>Transaction Records:</strong> When purchasing or selling a project, we record the buyer ID, seller ID, project ID, transaction amount, and Stripe checkout session identifiers.
          </li>
          <li>
            <strong>Technical Telemetry:</strong> Anonymized server logs, basic IP addresses for rate limiting and DDoS defense, and browser user-agent headers.
          </li>
        </ul>
      </Section>

      <Section title="2. Payment Processing Security via Stripe" boxed>
        <p>
          Scrapyard does not store, process, or transmit raw credit card numbers, CVVs, expiration dates, or bank account credentials on our infrastructure. All checkout flows and seller payouts are executed directly via PCI-DSS Level 1 certified Stripe infrastructure.
        </p>
        <p>
          When sellers onboard via Stripe Connect, their financial data and identity verification documents are collected directly by Stripe under their privacy policy.
        </p>
      </Section>

      <Section title="3. Cookies & Local Storage">
        <p>
          Scrapyard uses minimal authentication session cookies and browser storage (such as localStorage for offline cached favorites and active search filters) strictly necessary for the service to function:
        </p>
        <ul>
          <li>Maintaining your authenticated session state across page reloads.</li>
          <li>Preserving your search, tag, and price filter preferences in the catalog.</li>
          <li>Caching recent draft submissions so progress is not lost on network disconnections.</li>
        </ul>
        <p>
          We do not employ third-party surveillance cookies, advertising tracking pixels, or cross-site tracking scripts.
        </p>
      </Section>

      <Section title="4. How We Use and Share Information">
        <p>
          Your data is utilized strictly to provide, maintain, and protect the Scrapyard platform. We never sell, rent, or monetize your personal information to third-party data brokers or marketing firms.
        </p>
        <p>
          Public project metadata (titles, screenshots, postmortems, salvage snippets, and public GitHub links) is displayed to all catalog visitors. Private source archives (.zip) are restricted strictly to authorized buyers and the original author.
        </p>
      </Section>

      <Section title="5. Data Retention & User Rights">
        <p>
          You maintain full control over your profile information. You may update your display username, profile avatar, or delete your posted projects at any time through your Profile dashboard.
        </p>
        <p>
          To request a complete account deletion and erasure of personal data, contact support at{' '}
          <a href="mailto:privacy@scrapyard.dev">privacy@scrapyard.dev</a>. Note that anonymized transaction receipts may be retained as required by financial record-keeping regulations.
        </p>
      </Section>
    </LegalLayout>
  );
}