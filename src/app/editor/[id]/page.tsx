import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';
import EditorForm from '@/app/_components/EditorForm';

export default async function EditStoryPage({ params }) {
  // Check if the user is logged in
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return <div className="p-4">You need to be logged in to edit stories. Please <a href="/login" className="text-blue-500 hover:underline">log in</a>.</div>;
  }
  
  try {
    // Await params before accessing properties
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const db = await getDatabase();
    
    // Validate the ID - check if it's a valid ObjectId
    if (!ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId format: ${id}`);
      return notFound();
    }
    
    // Convert string ID to ObjectId
    const objectId = new ObjectId(id);
    
    // Fetch the story
    const story = await db.collection('assets').findOne({ _id: objectId });
    
    if (!story) {
      return notFound();
    }
    
    // Fetch the hub/town info
    const hub = await db.collection('hubs').findOne({ _id: story.hubId });
    
    // Format the story data for the editor form
    const storyData = {
      id: story._id.toString(),
      title: story.title,
      description: story.description,
      metadescription: story.metaDescription || '',
      town: hub ? {
        id: hub._id.toString(),
        title: hub.title
      } : null,
      imageUrl: story.imageUrl || ''
    };
    
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Story</h1>
        <EditorForm storyData={storyData} isEditing={true} />
      </div>
    );
  } catch (error) {
    console.error('Error loading story for editing:', error);
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to load the story for editing. Please try again later.</p>
      </div>
    );
  }
} 