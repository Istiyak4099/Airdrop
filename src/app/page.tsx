import { redirect } from 'next/navigation';

/**
 * Root page redirects to the Dashboard to make it the default landing experience.
 */
export default function Home() {
  redirect('/dashboard');
}
