import { getProviders } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Container from '@/app/_components/container';
import LoginForm from '@/app/_components/LoginForm';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to home if already logged in
  if (session) {
    redirect('/');
  }
  
  const providers = await getProviders();
  
  return (
    <Container>
      <div className="mx-auto max-w-md py-12">
        <h1 className="text-2xl font-bold mb-6">Log In</h1>
        <LoginForm providers={providers} />
      </div>
    </Container>
  );
}
