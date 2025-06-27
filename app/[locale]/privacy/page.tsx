'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';

export default function PrivacyPolicyPage() {
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
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Privacy Policy</h1>
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
                <h2 className="text-2xl font-bold mb-6">Privacy Policy</h2>

                <p className="mb-4">
                  At CulturalCompass, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                  disclose, and safeguard your information when you use our website and services.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Information We Collect</h3>

                <p className="mb-3">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Personal identification information (name, email address, etc.)</li>
                  <li>Account information and preferences</li>
                  <li>Location data (when you provide it or enable location services)</li>
                  <li>Content you submit through our services</li>
                  <li>Communications with us</li>
                </ul>

                <p className="mb-3">We also automatically collect certain information when you use our services:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Log data (IP address, browser type, pages visited, etc.)</li>
                  <li>Device information</li>
                  <li>Usage information</li>
                  <li>Cookies and similar technologies</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">How We Use Your Information</h3>

                <p className="mb-3">We use the information we collect for various purposes, including to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send administrative messages and communications</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Personalize content and experiences</li>
                  <li>Monitor and analyze usage patterns</li>
                  <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Sharing of Information</h3>

                <p className="mb-3">We may share the information we collect in various ways, including:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>With vendors and service providers who need access to such information to perform services on our behalf</li>
                  <li>In response to a request for information if we believe disclosure is in accordance with applicable law</li>
                  <li>If we believe your actions are inconsistent with our user agreements or policies</li>
                  <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition</li>
                  <li>With your consent or at your direction</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Data Security</h3>

                <p className="mb-4">
                  We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized 
                  access, disclosure, alteration, and destruction. However, no security system is impenetrable and we cannot 
                  guarantee the security of our systems 100%.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Your Rights and Choices</h3>

                <p className="mb-3">Depending on your location, you may have certain rights regarding your personal information, including:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate or incomplete information</li>
                  <li>Deletion of your personal information</li>
                  <li>Restriction or objection to our use of your information</li>
                  <li>Portability of your information</li>
                  <li>Withdrawal of consent</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Children's Privacy</h3>

                <p className="mb-4">
                  Our services are not directed to children under 13, and we do not knowingly collect personal information 
                  from children under 13. If we learn we have collected personal information from a child under 13, we will 
                  delete such information.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Changes to this Privacy Policy</h3>

                <p className="mb-4">
                  We may modify this Privacy Policy from time to time. If we make material changes, we will provide notice 
                  appropriate to the circumstances, such as by displaying a prominent notice within the Service or sending 
                  you an email.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Contact Us</h3>

                <p>
                  If you have any questions about this Privacy Policy, please contact us at:<br />
                  <a href="mailto:privacy@culturalcompass.ai" className="text-blueberry hover:underline">privacy@culturalcompass.ai</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}