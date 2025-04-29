import Container from "@/app/_components/container";
import { MoreStories } from "@/app/_components/more-stories";
import { getDatabase } from "@/lib/mongodb";
import { Post } from "@/interfaces/post";

// Define type for MongoDB assets
interface AssetPost {
  _id: string;
  hubId: any; // Allow for ObjectId type without importing it
  hub?: {
    _id?: string;
    id?: string;
    name?: string;
  };
  title: string;
  alias: string;
  description: string;
  type: string;
  status: string;
  state: string;
  createdAt: string;
  occurAt: string | null;
  isPublic: boolean;
  imageUrl: string;
  metaDescription: string;
  metaKeywords: string;
  publishAt: string;
}

export const metadata = {
  title: 'Ridgefield Connecticut Stories | HamletHub',
  description: 'Latest stories from Ridgefield, Connecticut'
};

export default async function RidgefieldPage() {
  let db;
  let errorMessage = "Error loading posts. Please try again later.";
  
  try {
    console.log("Attempting to connect to database...");
    db = await getDatabase();
    console.log("Database connection successful");
    
    try {
      console.log("Executing query for Ridgefield stories...");
      // Since hubId is stored as an ObjectId, use $toString operator in MongoDB to compare strings
      // This works without importing the ObjectId type
      const assetPosts = await db.collection('assets').find({
        type: "story",
        state: "published",
        $expr: { 
          $eq: [
            { $toString: "$hubId" }, 
            "657a0795ef68cad2ad47912c"
          ]
        }
      })
      .sort({ publishAt: -1 })
      .limit(10)
      .toArray() as AssetPost[];
      
      console.log(`Query completed successfully. Found ${assetPosts.length} Ridgefield stories`);
      
      // Map to required format
      const allPosts = assetPosts.map((post: AssetPost) => ({
        slug: post.alias || '',
        title: post.title || '',
        date: post.publishAt ? new Date(post.publishAt).toISOString() : '',
        coverImage: post.imageUrl || '',
        author: { name: 'HamletHub', picture: '' },
        excerpt: post.metaDescription || '',
        ogImage: { url: post.imageUrl || '' },
        content: post.description || '',
      })) as Post[];

      return (
        <main>
          <Container>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight md:pr-8 mb-8">
              Ridgefield, Connecticut
            </h1>
            {allPosts.length > 0 ? (
              <MoreStories posts={allPosts} />
            ) : (
              <p>No stories found for Ridgefield.</p>
            )}
          </Container>
        </main>
      );
    } catch (queryError: unknown) {
      console.error('Error querying Ridgefield posts:', queryError);
      errorMessage = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? `Query error: ${queryError instanceof Error ? queryError.message : String(queryError)}` 
        : "Error loading posts. Please try again later.";
      throw queryError;
    }
  } catch (error: unknown) {
    console.error('Error details:', error);
    if (!db) {
      console.error('Database connection failed');
      errorMessage = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? `Database connection error: ${error instanceof Error ? error.message : String(error)}`
        : "Error connecting to database. Please try again later.";
    }
    
    return (
      <main>
        <Container>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight md:pr-8 mb-8">
            Ridgefield, Connecticut
          </h1>
          <p>{errorMessage}</p>
        </Container>
      </main>
    );
  }
} 