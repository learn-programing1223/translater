'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MessageSquare, Mic, Globe, Zap, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCatalogStore } from '@/stores/catalogStore';

export default function Home() {
  const router = useRouter();
  const { syncCatalog } = useCatalogStore();

  useEffect(() => {
    // Initialize catalog on app load
    syncCatalog();
  }, [syncCatalog]);

  const features = [
    {
      icon: <Globe className="h-8 w-8 text-[#28C6B1]" />,
      title: '100+ Languages',
      description: 'From English to Zulu, speak in your language and get answers in your language.',
    },
    {
      icon: <Zap className="h-8 w-8 text-[#28C6B1]" />,
      title: 'Instant Answers',
      description: 'No sign-ups, no downloads. Just open and start asking about products.',
    },
    {
      icon: <Shield className="h-8 w-8 text-[#28C6B1]" />,
      title: 'Privacy First',
      description: 'Your conversations stay on your device. No personal data stored.',
    },
    {
      icon: <Smartphone className="h-8 w-8 text-[#28C6B1]" />,
      title: 'Works Everywhere',
      description: 'Use on any device - phone, tablet, or computer. Always accessible.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Shop in <span className="text-[#28C6B1]">Any Language</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Transform your shopping experience with AI that speaks your language. 
            Ask about products, prices, and locations in over 100 languages.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              size="lg"
              onClick={() => router.push('/chat')}
              className="gap-2"
            >
              <MessageSquare className="h-5 w-5" />
              Start Chat
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/voice')}
              className="gap-2"
            >
              <Mic className="h-5 w-5" />
              Use Voice
            </Button>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute -top-24 right-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="relative aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#28C6B1] to-[#10B981] opacity-20 sm:w-[72.1875rem]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Built for real shoppers with real needs
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title} className="relative pl-16">
                  <CardContent className="pt-6">
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      <div className="absolute left-4 top-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#28C6B1]/10">
                        {feature.icon}
                      </div>
                      {feature.title}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-600">
                      {feature.description}
                    </dd>
                  </CardContent>
                </Card>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Start Shopping?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            No downloads, no sign-ups. Just open and start asking questions in your language.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              size="lg"
              onClick={() => router.push('/chat')}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Get Started Free
            </Button>
          </div>
        </div>
        <svg
          viewBox="0 0 1024 1024"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          aria-hidden="true"
        >
          <circle cx={512} cy={512} r={512} fill="url(#gradient)" fillOpacity="0.7" />
          <defs>
            <radialGradient id="gradient">
              <stop stopColor="#28C6B1" />
              <stop offset={1} stopColor="#10B981" />
            </radialGradient>
          </defs>
        </svg>
      </section>
    </div>
  );
}
