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
  try {
    const db = await getDatabase();
    
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
    
    console.log(`Found ${assetPosts.length} Ridgefield stories`);
    
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
  } catch (error) {
    console.error('Error fetching Ridgefield posts:', error);
    return (
      <main>
        <Container>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight md:pr-8 mb-8">
            Ridgefield, Connecticut
          </h1>
          <p>Error loading posts. Please try again later.</p>
        </Container>
      </main>
    );
  }
} 