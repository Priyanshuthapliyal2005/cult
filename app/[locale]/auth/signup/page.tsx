'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, Loader2, Github, ToggleLeft as Google } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function SignUpPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to dashboard/home
      router.push(getLocalizedPath('/'));
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <header className="p-4">
        <div className="max-w-md mx-auto w-full flex justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href={getLocalizedPath('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <LanguageSwitcher variant="compact" />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blueberry to-ube rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blueberry to-ube"></div>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">{t('auth.signUp.title')}</CardTitle>
              <CardDescription className="text-center">
                {t('auth.signUp.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    {t('auth.signUp.name')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder={t('auth.signUp.namePlaceholder')}
                      required
                      className="pl-10"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t('auth.signUp.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('auth.signUp.emailPlaceholder')}
                      required
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    {t('auth.signUp.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder={t('auth.signUp.passwordPlaceholder')}
                      required
                      className="pl-10"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    {t('auth.signUp.confirmPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
                      required
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                    required
                  />
                  <label
                    htmlFor="agreeToTerms"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    I agree to the{' '}
                    <Link href={getLocalizedPath('/terms')} className="text-blueberry hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href={getLocalizedPath('/privacy')} className="text-blueberry hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blueberry to-ube text-white" 
                  disabled={isLoading || !formData.agreeToTerms}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.signUp.creating')}
                    </>
                  ) : (
                    t('auth.signUp.submit')
                  )}
                </Button>
              </form>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  <Google className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t px-6 py-4 bg-gray-50">
              <div className="text-sm text-center">
                {t('auth.signUp.haveAccount')}{' '}
                <Link 
                  href={getLocalizedPath('/auth/signin')}
                  className="text-blueberry font-medium hover:underline"
                >
                  {t('auth.signUp.signInLink')}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

const Globe = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
    <path d="M2 12h20"></path>
  </svg>
);