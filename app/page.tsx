import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

// This page only renders when the user visits the root path without a locale
export default function RootPage() {
  // Redirect to the default locale
  redirect(`/${defaultLocale}`);
}