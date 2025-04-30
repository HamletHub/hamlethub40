import Container from "@/app/_components/container";
import { MoreStories } from "@/app/_components/more-stories";
import { getDatabase } from "@/lib/mongodb";
import { Post } from "@/interfaces/post";
// @ts-ignore
import { notFound } from "next/navigation";

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

// Define type for MongoDB hubs
interface Hub {
  _id: string;
  name: string;
  alias: string;
  state: string;
}

// Define params type for Next.js 15
interface PageParams {
  params: Promise<{
    town: string;
  }>;
}

export async function generateMetadata({ params }: PageParams) {
  try {
    // Await params before accessing properties
    const resolvedParams = await params;
    const townSlug = resolvedParams.town;
    
    const db = await getDatabase();
    const hub = await db.collection("hubs").findOne({ alias: townSlug }) as Hub;
    
    if (!hub) {
      return {
        title: 'Town Not Found | HamletHub',
        description: 'The requested town page could not be found.'
      };
    }

    return {
      title: `${hub.name} Stories | HamletHub`,
      description: `Latest stories from ${hub.name}`
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Town Stories | HamletHub',
      description: 'Latest town stories'
    };
  }
}

export default async function TownPage({ params }: PageParams) {
  try {
    // Await params before accessing properties
    const resolvedParams = await params;
    const townSlug = resolvedParams.town;
    
    const db = await getDatabase();
    
    // Find the hub information by matching the alias to the town slug
    const hub = await db.collection("hubs").findOne({ alias: townSlug }) as Hub;
    
    if (!hub) {
      console.error(`No hub found with alias: ${townSlug}`);
      return notFound();
    }

    console.log(`Found hub: ${hub.name} with id: ${hub._id}`);
    
    // Now fetch stories for this hub using its ID
    const assetPosts = await db.collection('assets').find({
      type: "story",
      state: "published",
      $expr: { 
        $eq: [
          { $toString: "$hubId" }, 
          { $toString: hub._id }
        ]
      }
    })
    .sort({ publishAt: -1 })
    .limit(10)
    .toArray() as AssetPost[];
    
    console.log(`Found ${assetPosts.length} stories for ${hub.name}`);
    
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
      hubId: post.hubId ? post.hubId.toString() : '',
      townSlug: townSlug
    })) as Post[];

    return (
      <main>
        <Container>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight md:pr-8 mb-8">
            {hub.name}
          </h1>
          {allPosts.length > 0 ? (
            <MoreStories posts={allPosts} />
          ) : (
            <p>No stories found for {hub.name}.</p>
          )}
        </Container>
      </main>
    );
  } catch (error) {
    console.error('Error fetching town posts:', error);
    return (
      <main>
        <Container>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight md:pr-8 mb-8">
            Town Stories
          </h1>
          <p>Error loading posts. Please try again later.</p>
        </Container>
      </main>
    );
  }
} 