import React from 'react';
import { LegalLayout, Section } from '@/components/LegalLayout';

export const metadata = {
  title: 'Terms of Service — Scrapyard',
  description: 'Terms and conditions governing the Scrapyard marketplace for abandoned code and salvageable software modules.',
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="Last updated: November 2026. Please read these terms carefully before uploading, listing, or purchasing source code on Scrapyard."
    >
      <Section title="1. Overview and Acceptance">
        <p>
          Scrapyard is an online developer repository and secondary marketplace where software engineers, founders, and hobbyists deposit abandoned, shelved, or sunset software projects so others may salvage reusable modules, shaders, parsers, algorithms, and architectures.
        </p>
        <p>
          By accessing, browsing, submitting, or purchasing any project or source code archive on Scrapyard, you unconditionally agree to be bound by these Terms of Service. If you do not agree with any provision herein, you must refrain from using the platform.
        </p>
      </Section>

      <Section title="2. Strict “As-Is” Software Disclaimer (Zero Warranty)" boxed>
        <p>
          <strong>ALL SOURCE CODE, REPOSITORIES, SCRIPTS, CONFIGURATIONS, AND DIGITAL ARCHIVES ARE PROVIDED EXCLUSIVELY “AS-IS”, “WITH ALL FAULTS”, AND WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong>
        </p>
        <p>
          Projects deposited on Scrapyard are by definition abandoned, incomplete, deprecated, or halted. Neither Scrapyard nor the depositing author makes any representations or guarantees regarding compilation success, bug-free execution, fitness for a particular purpose, merchantability, stability, documentation completeness, or cybersecurity soundness. You assume all risk and liability for auditing, sanitizing, and testing any code obtained from the platform prior to running or integrating it into production environments.
        </p>
      </Section>

      <Section title="3. Seller Ownership & Copyright Warranty">
        <p>
          When submitting any repository, snippet, or source code archive (whether offered as a Free Salvage or For Sale), you explicitly represent and warrant that:
        </p>
        <ul>
          <li>You are the original author of the code or possess full legal authority and explicit commercial distribution rights from the copyright holder.</li>
          <li>The uploaded material is not stolen, scraped, decompiled from proprietary commercial software, or taken from an employer in breach of confidentiality or intellectual property assignment agreements.</li>
          <li>You have removed all production API keys, database credentials, authentication tokens, private secrets, and customer personal data from the archive before upload.</li>
        </ul>
      </Section>

      <Section title="4. Buyer Commercial Salvage License">
        <p>
          Purchasing a “For Sale” project grants the purchasing account a worldwide, perpetual, non-exclusive, irrevocable commercial license to:
        </p>
        <ul>
          <li>Inspect, compile, refactor, and incorporate the source code into private, open-source, or commercial software products.</li>
          <li>Distribute compiled, transpiled, or bundled binaries containing the salvaged modules without paying ongoing royalties to the seller.</li>
          <li>Modify, adapt, and build derivative works upon the salvaged architecture.</li>
        </ul>
        <p>
          Unless explicitly negotiated otherwise with the author, purchase does not constitute an assignment of registered trademarks, business entity ownership, or exclusive patent rights. Buyers may not re-upload the raw unaltered source archive to resell as a standalone package on Scrapyard or competing digital asset marketplaces.
        </p>
      </Section>

      <Section title="5. Marketplace Payments & Platform Fee">
        <p>
          All financial transactions on Scrapyard are processed through Stripe and Stripe Connect. Scrapyard retains a non-refundable ten percent (10%) platform commission on gross transaction volume to cover hosting, archive scanning, fraud prevention, and infrastructure costs. The remaining ninety percent (90%) is disbursed to the seller’s verified Stripe Connect account.
        </p>
        <p>
          Sellers are solely responsible for all income taxes, VAT, sales taxes, and regulatory filings associated with funds received through the platform.
        </p>
      </Section>

      <Section title="6. Limitation of Liability">
        <p>
          Under no circumstances shall Scrapyard, its operators, affiliates, or contributors be held liable for direct, indirect, incidental, punitive, special, or consequential damages (including loss of profits, data corruption, security breaches, system outages, or business interruption) arising out of the use, inability to use, or reliance upon any salvaged code or data obtained from this service.
        </p>
      </Section>

      <Section title="7. Modifications to Agreement">
        <p>
          We reserve the right to revise these Terms of Service at any time. Continued use of Scrapyard after amendments are published constitutes acceptance of the modified terms.
        </p>
      </Section>
    </LegalLayout>
  );
}