import React from 'react';
import { LegalLayout, Section } from '@/components/LegalLayout';

export const metadata = {
  title: 'Refund & Dispute Policy — Scrapyard',
  description: 'Digital asset refund policy and 48-hour buyer protection terms on Scrapyard.',
};

export default function RefundsPage() {
  return (
    <LegalLayout
      title="Refund & Dispute Policy"
      intro="Last updated: November 2026. Because Scrapyard provides instant, irrevocable access to digital source code, all sales are governed by the following strict terms."
    >
      <Section title="1. General Policy: All Digital Sales Are Final" boxed>
        <p>
          Upon successful checkout via Stripe, buyers are immediately granted full read and download permissions to the seller’s source code archive (.zip). Because digital code assets cannot be physically returned, revoked, or un-downloaded, all sales are considered final and non-refundable by default.
        </p>
        <p>
          Refunds are not granted due to buyer’s remorse, lack of technical ability to compile the project, changes in your tech stack, or the realization that third-party dependencies have deprecated over time.
        </p>
      </Section>

      <Section title="2. The Scam-Proof Guarantee (Valid Refund Exceptions)">
        <p>
          Scrapyard stands firmly against fraudulent or deceptive listings. A full refund will be promptly issued if you demonstrate that the purchase falls under one of the following verified conditions:
        </p>
        <ul>
          <li>
            <strong>Corrupted or Unreadable Archive:</strong> The uploaded archive file is damaged, password-protected without credentials provided, or cannot be decompressed using standard ZIP utilities.
          </li>
          <li>
            <strong>Gross Misrepresentation:</strong> The uncompressed contents of the archive fundamentally differ from the listing description (for example: the archive contains empty placeholder files, hello-world scripts, or software completely unrelated to the title and screenshots).
          </li>
          <li>
            <strong>Malicious Payloads:</strong> The source code contains deliberate obfuscated malware, backdoors, ransomware, or cryptocurrency miners.
          </li>
        </ul>
      </Section>

      <Section title="3. 48-Hour Reporting Window">
        <p>
          To qualify for an investigation and potential refund under the Scam-Proof Guarantee, you must submit a dispute within <strong>forty-eight (48) hours</strong> of the completed transaction timestamp.
        </p>
        <p>
          Disputes submitted after the 48-hour window has lapsed cannot be refunded, as seller earnings are released for automated Stripe Connect payout disbursement.
        </p>
      </Section>

      <Section title="4. How to Submit a Dispute">
        <p>
          To file a claim, email our dispute review team at{' '}
          <a href="mailto:disputes@scrapyard.dev">disputes@scrapyard.dev</a> with the subject line:{' '}
          <code>DISPUTE: [Project ID or Title]</code>. Please include:
        </p>
        <ul>
          <li>Your account email and Stripe checkout receipt / session ID.</li>
          <li>A clear description of the defect or misrepresentation.</li>
          <li>Terminal logs or uncompressed file tree output supporting your claim.</li>
        </ul>
        <p>
          Our engineering team inspects the archive snapshot directly from server storage within 24 business hours. If approved, 100% of the purchase amount is reversed to your original payment card via Stripe.
        </p>
      </Section>

      <Section title="5. Seller Penalties for Fraud">
        <p>
          Any seller discovered uploading fake repositories, dummy archives, or malicious payloads will immediately have their pending payouts frozen, their Stripe account reported for fraud, and their account permanently banned from Scrapyard.
        </p>
      </Section>
    </LegalLayout>
  );
}