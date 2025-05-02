import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import EditorForm from '@/app/_components/EditorForm';

export default async function EditorPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return <div>You are not authorized to access this page. Please <a href="/login">log in</a>.</div>;
  }
  
  // Pass an empty storyData object to EditorForm
  const emptyStoryData = {
    id: '',
    title: '',
    description: '',
    metadescription: '',
    town: null,
    imageUrl: ''
  };
  
  return <EditorForm storyData={emptyStoryData} isEditing={false} />;
}