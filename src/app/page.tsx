import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Bot, Clock, Inbox, BarChart2, Star } from 'lucide-react';
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';

export default function Home() {
  const features = [
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Responses',
      description: 'Our AI generates human-like responses to customer messages instantly.',
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: '24/7 Automation',
      description: 'Airdrop works around the clock to ensure no customer is left waiting.',
    },
    {
      icon: <Inbox className="h-8 w-8 text-primary" />,
      title: 'Smart Inbox',
      description: 'A unified inbox for all your social media platforms, with smart filtering.',
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: 'In-Depth Analytics',
      description: 'Track performance, response times, and customer satisfaction with our dashboard.',
    },
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

  const testimonials = [
    {
      name: 'Sarah L.',
      role: 'E-commerce Manager',
      quote: "Airdrop has revolutionized our customer service. It's like having a 24/7 team member.",
      avatar: 'https://placehold.co/100x100',
    },
    {
      name: 'Mike R.',
      role: 'Startup Founder',
      quote: 'The AI is incredibly smart and handles most queries on its own. Our response times have dropped from hours to seconds.',
      avatar: 'https://placehold.co/100x100',
    },
     {
      name: 'Jessica P.',
      role: 'Marketing Head',
      quote: "The analytics dashboard gives us amazing insights into our customer interactions. Highly recommended!",
      avatar: 'https://placehold.co/100x100',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <section id="hero" className="relative py-20 md:py-32 text-center bg-white dark:bg-gray-900 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-purple-100/[0.05] dark:bg-grid-purple-900/[0.2]"></div>
          <div className="container mx-auto px-4 z-10 relative">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Automate Your Customer Communication
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300">
              Airdrop is an AI platform that handles comments, messages, and queries instantly with human-like responses.
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
                src="https://placehold.co/1200x600"
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
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Airdrop?</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Everything you need to streamline customer support and boost engagement.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="text-center transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
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

        <section id="testimonials" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by Businesses Worldwide</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Hear what our customers have to say about Airdrop.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={50}
                        height={50}
                        className="rounded-full"
                        data-ai-hint="person portrait"
                      />
                      <div>
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="italic">"{testimonial.quote}"</p>
                    <div className="flex mt-4 text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                    </div>
                  </CardContent>
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
