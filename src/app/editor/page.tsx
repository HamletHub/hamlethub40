import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import EditorForm from '@/app/_components/EditorForm';

export default async function EditorPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return <div>You are not authorized to access this page. Please <a href="/login">log in</a>.</div>;
  }
  return <EditorForm />;
}