import React from 'react';
import { LegalLayout, Section } from '@/components/LegalLayout';

export const metadata = {
  title: 'DMCA & Copyright Takedown — Scrapyard',
  description: 'Digital Millennium Copyright Act notice and intellectual property infringement reporting for Scrapyard.',
};

export default function DmcaPage() {
  return (
    <LegalLayout
      title="DMCA & Copyright Policy"
      intro="Scrapyard respects the intellectual property rights of software creators and complies strictly with the Digital Millennium Copyright Act (17 U.S.C. § 512)."
    >
      <Section title="1. Safe Harbor Commitment">
        <p>
          Scrapyard operates as a hosting service and marketplace platform for user-submitted software projects. While our automated intake pipeline inspects files for structural integrity and file count, we do not monitor or verify the copyright ownership of every uploaded line of code.
        </p>
        <p>
          Under the DMCA Safe Harbor provisions, we maintain an expeditious notice-and-takedown procedure to promptly remove or disable access to any material claimed to be infringing upon verified notice from the copyright owner or their authorized agent.
        </p>
      </Section>

      <Section title="2. Designated Copyright Agent Contact" boxed>
        <p>
          All formal copyright infringement notices and counter-notifications must be delivered to our designated DMCA agent:
        </p>
        <p>
          <strong>Agent:</strong> Scrapyard Legal & Copyright Enforcement
          <br />
          <strong>Email:</strong> <a href="mailto:dmca@scrapyard.dev">dmca@scrapyard.dev</a> / <a href="mailto:legal@scrapyard.dev">legal@scrapyard.dev</a>
          <br />
          <strong>Service:</strong> Scrapyard (troojin.com)
        </p>
      </Section>

      <Section title="3. Required Elements of a Valid DMCA Notice">
        <p>
          To expedite removal of infringing material, your written notification must include the following information pursuant to 17 U.S.C. § 512(c)(3):
        </p>
        <ol>
          <li>
            <strong>Identification of Work:</strong> A description or link to the copyrighted work you claim has been infringed (for example, a link to your original public GitHub repository, commit history, or copyright registration number).
          </li>
          <li>
            <strong>Identification of Infringing Listing:</strong> The specific Scrapyard URL, project title, or project ID of the listing hosting the disputed code.
          </li>
          <li>
            <strong>Your Contact Details:</strong> Your full name, mailing address, telephone number, and official email address.
          </li>
          <li>
            <strong>Good Faith Statement:</strong> A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
          </li>
          <li>
            <strong>Perjury Statement:</strong> A statement, made under penalty of perjury, that the information in the notification is accurate and that you are the copyright owner or authorized to act on behalf of the owner.
          </li>
          <li>
            <strong>Signature:</strong> A physical or electronic signature of the copyright owner or authorized representative.
          </li>
        </ol>
      </Section>

      <Section title="4. Takedown and Counter-Notification">
        <p>
          Upon receipt of a compliant DMCA notice, Scrapyard will immediately remove or disable access to the disputed listing, freeze any associated pending marketplace disbursements, and notify the depositing user.
        </p>
        <p>
          If the depositing user believes in good faith that the material was removed as a result of mistake or misidentification, they may file a formal counter-notification meeting the statutory requirements of 17 U.S.C. § 512(g)(3).
        </p>
      </Section>

      <Section title="5. Repeat Infringer Policy">
        <p>
          In accordance with federal copyright law, Scrapyard enforces a strict policy that terminates the accounts of users who are determined to be repeat copyright infringers. Any seller repeatedly uploading stolen repositories or commercial source code without permission will be permanently banned from the platform.
        </p>
      </Section>
    </LegalLayout>
  );
}