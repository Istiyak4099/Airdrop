import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Bot, Clock, Inbox, BarChart2, Star, Zap } from 'lucide-react';
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';

export default function Home() {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Instant Auto-Replies',
      description: 'Provide immediate, AI-powered responses to customer inquiries. Address FAQs, resolve common issues, and boost customer satisfaction around the clock.',
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: 'Smart Workflow Automation',
      description: 'Automate key business processes like appointment booking, lead qualification, and task assignment with intelligent, customizable AI workflows.',
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: 'Customer Insights',
      description: 'Analyze customer interactions to identify key trends, preferences, and pain points. Use AI-driven insights to improve your services and tailor solutions.',
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$49',
      features: ['1 Social Media Integration', '1,000 Messages/mo', 'Basic Analytics', 'Email Support'],
    },
    {
      name: 'Pro',
      price: '$99',
      features: ['5 Social Media Integrations', '10,000 Messages/mo', 'Advanced Analytics', 'Priority Support'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Contact Us',
      features: ['Unlimited Integrations', 'Unlimited Messages', 'Custom Analytics', 'Dedicated Support'],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <section id="hero" className="relative py-20 md:py-32 text-center bg-white dark:bg-gray-900 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-purple-100/[0.05] dark:bg-grid-purple-900/[0.2]"></div>
          <div className="container mx-auto px-4 z-10 relative">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary">
              Airdrop
            </h1>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-2">
              AI-Powered Customer Assistant
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300">
              Automate your customer messaging, respond instantly on any platform, and handle digital tasks 24/7. Save time, delight customers, and grow your business with Rareflex.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="transition-transform duration-300 hover:scale-105">
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="transition-transform duration-300 hover:scale-105">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            <div className="mt-16">
              <Image
                src="https://placehold.co/1200x600.png"
                alt="Airdrop Dashboard"
                width={1200}
                height={600}
                className="rounded-lg shadow-2xl mx-auto"
                data-ai-hint="dashboard analytics"
              />
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
                Key Features
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything You Need to Succeed</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Airdrop is packed with powerful features to help your business thrive in the digital age.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="text-left bg-white dark:bg-gray-900/50 rounded-2xl shadow-lg transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl p-6">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 md:py-28 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Flexible Pricing for Teams of All Sizes</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Choose a plan that scales with your business.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-1 lg:grid-cols-3 items-center">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`transform transition-transform duration-300 hover:shadow-2xl ${plan.popular ? 'border-primary scale-105 shadow-2xl' : 'hover:-translate-y-2'}`}>
                  <CardHeader className="text-center">
                    {plan.popular && <div className="text-primary font-semibold mb-2">Most Popular</div>}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold my-4">{plan.price}</div>
                    <p className="text-muted-foreground">{plan.price.startsWith('$') ? '/ month' : ''}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                      {plan.price.startsWith('$') ? 'Choose Plan' : 'Contact Sales'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary/10 dark:bg-primary/5 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold">Ready to Transform Your Customer Service?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of businesses already automating their support with AI.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="transition-transform duration-300 hover:scale-105">
                <Link href="/signup">Start Your Free Trial</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
