import Container from "@/app/_components/container";
import { MoreStories } from "@/app/_components/more-stories";
import TownHeader from "@/app/_components/TownHeader";
import { getDatabase } from "@/lib/mongodb";
import { Post } from "@/interfaces/post";
import { convertToGcsUrl } from "@/lib/imageUtils";
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
  title: string;
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
      title: `${hub.title} Stories | HamletHub`,
      description: `Latest stories from ${hub.title}`
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

    console.log(`Found hub: ${hub.title} with id: ${hub._id}`);
    
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
    
    console.log(`Found ${assetPosts.length} stories for ${hub.title}`);
    
    // Map to required format with 1_1 subfolder for town page images
    const allPosts = assetPosts.map((post: AssetPost) => ({
      slug: post.alias || '',
      title: post.title || '',
      date: post.publishAt ? new Date(post.publishAt).toISOString() : '',
      coverImage: post.imageUrl ? convertToGcsUrl(post.imageUrl, "1_1") : '',
      author: { name: 'HamletHub', picture: '' },
      excerpt: post.metaDescription || '',
      ogImage: { url: post.imageUrl ? convertToGcsUrl(post.imageUrl, "1_1") : '' },
      content: post.description || '',
      hubId: post.hubId ? post.hubId.toString() : '',
      townSlug: townSlug
    })) as Post[];

    return (
      <main>
        <Container>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <TownHeader hubTitle={hub.title} />
              <h2 className="mb-6 text-3xl md:text-4xl leading-tight font-vollkorn text-green-medium">
                Stories
              </h2>

              {allPosts.length > 0 ? (
                <MoreStories posts={allPosts} imageSubfolder="1_1" />
              ) : (
                <p>No stories found for {hub.title}.</p>
              )}
            </div>
            <div className="w-[300px] shrink-0 px-[15px]">
              {/* Right column content goes here */}
            </div>
          </div>
        </Container>
      </main>
    );
  } catch (error) {
    console.error('Error fetching town posts:', error);
    return (
      <main>
        <Container>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <TownHeader hubTitle="Town Stories" />
              <p>Error loading posts. Please try again later.</p>
            </div>
            <div className="w-[300px] shrink-0 px-[15px]">
              {/* Right column content goes here */}
            </div>
          </div>
        </Container>
      </main>
    );
  }
} 