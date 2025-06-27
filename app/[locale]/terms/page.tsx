'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';

export default function TermsPage() {
  const t = useTranslations();
  const locale = useLocale();

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  return (
    <div className="min-h-screen clay-hero">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={getLocalizedPath('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blueberry to-ube rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Terms of Service</h1>
              <p className="text-sm text-gray-500">Last Updated: May 30, 2024</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <LanguageSwitcher variant="compact" />
          <UserMenu />
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blueberry to-ube"></div>
            <CardContent className="p-8">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-6">Terms of Service</h2>

                <p className="mb-4">
                  Please read these Terms of Service ("Terms") carefully before using the CulturalCompass website and services.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h3>

                <p className="mb-4">
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the 
                  terms, then you may not access the Service.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. Changes to Terms</h3>

                <p className="mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide 
                  notice of any changes by posting the new Terms on this page. Your continued use of the Service after any such 
                  changes constitutes your acceptance of the new Terms.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Access and Use of the Service</h3>

                <p className="mb-3">Our service is intended solely for users who are:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>At least 13 years of age</li>
                  <li>Able to form legally binding contracts</li>
                </ul>

                <p className="mb-4">
                  By using our Service, you represent and warrant that you meet all eligibility requirements outlined in these 
                  Terms. We may, at our sole discretion, refuse to offer the Service to any person or entity and change the 
                  eligibility criteria at any time.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Account Registration</h3>

                <p className="mb-4">
                  To access certain features of the Service, you may be required to register for an account. You agree to keep 
                  your account information accurate, current, and complete. You are responsible for maintaining the security of 
                  your account, and you are fully responsible for all activities that occur under your account.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Content and Conduct</h3>

                <p className="mb-3">Our Service allows you to post, link, store, share and otherwise make available certain information, 
                text, graphics, or other material. You are responsible for the content that you post to the Service, including its 
                legality, reliability, and appropriateness.</p>

                <p className="mb-4">
                  When you create or make available any content, you represent and warrant that:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>The creation and use of your content doesn't violate any third party rights</li>
                  <li>Your content is accurate and not misleading</li>
                  <li>Your content doesn't violate any applicable law or regulation</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">6. Intellectual Property</h3>

                <p className="mb-4">
                  The Service and its original content, features and functionality are and will remain the exclusive property of 
                  CulturalCompass and its licensors. The Service is protected by copyright, trademark, and other laws of both the 
                  United States and foreign countries. Our trademarks and trade dress may not be used in connection with any 
                  product or service without the prior written consent of CulturalCompass.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">7. Links to Other Websites</h3>

                <p className="mb-4">
                  Our Service may contain links to third-party websites or services that are not owned or controlled by CulturalCompass.
                  CulturalCompass has no control over, and assumes no responsibility for, the content, privacy policies, or practices of 
                  any third party websites or services. You further acknowledge and agree that CulturalCompass shall not be responsible 
                  or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use 
                  of or reliance on any such content, goods or services available on or through any such websites or services.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">8. Termination</h3>

                <p className="mb-4">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
                  including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately 
                  cease. If you wish to terminate your account, you may simply discontinue using the Service.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">9. Limitation of Liability</h3>

                <p className="mb-4">
                  In no event shall CulturalCompass, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
                  for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
                  data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or 
                  use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; 
                  and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort 
                  (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">10. Disclaimer</h3>

                <p className="mb-4">
                  Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service 
                  is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties 
                  of merchantability, fitness for a particular purpose, non-infringement or course of performance.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">11. Governing Law</h3>

                <p className="mb-4">
                  These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its 
                  conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a 
                  waiver of those rights.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">12. Contact Us</h3>

                <p>
                  If you have any questions about these Terms, please contact us at:<br />
                  <a href="mailto:legal@culturalcompass.ai" className="text-blueberry hover:underline">legal@culturalcompass.ai</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}