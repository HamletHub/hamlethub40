import { Post } from "@/interfaces/post";
import { getDatabase } from "./mongodb";

// Interface for MongoDB assets
interface AssetPost {
  _id: string;
  hubId: string;
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

// Map MongoDB asset to Post interface
function mapAssetToPost(asset: AssetPost): Post {
  return {
    slug: asset.alias || '',
    title: asset.title || '',
    date: asset.publishAt ? new Date(asset.publishAt).toISOString() : '',
    coverImage: asset.imageUrl || '',
    author: { name: 'HamletHub', picture: '' },
    excerpt: asset.metaDescription || '',
    ogImage: { url: asset.imageUrl || '' },
    content: asset.description || '',
  };
}

// Helper to handle timeout
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    
    promise.then(
      (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
};

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    console.log(`Fetching post with slug: ${slug}`);
    const db = await withTimeout(getDatabase(), 8000);
    
    // Only select the fields we need to improve performance
    const projection = {
      alias: 1,
      title: 1,
      publishAt: 1,
      imageUrl: 1,
      metaDescription: 1,
      description: 1
    };
    
    const asset = await withTimeout(
      db.collection('assets').findOne({ 
        alias: slug,
        type: "story",
        state: "published"
      }, { projection }),
      15000  // Increased from 5000ms to 15000ms (15 seconds)
    ) as AssetPost | null;

    if (!asset) {
      console.log(`No post found with slug: ${slug}`);
      return null;
    }
    
    console.log(`Found post: ${asset.title}`);
    return mapAssetToPost(asset);
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    console.log('Fetching all posts');
    const db = await withTimeout(getDatabase(), 8000);
    
    // Only select the fields we need
    const projection = {
      alias: 1,
      title: 1,
      publishAt: 1,
      imageUrl: 1,
      metaDescription: 1
    };
    
    const assets = await withTimeout(
      db.collection('assets').find({ 
        type: "story",
        state: "published"
      }, { projection })
      .sort({ publishAt: -1 })
      .limit(10) // Reduced limit to prevent timeouts
      .toArray(),
      15000 // Increased timeout
    ) as AssetPost[];

    console.log(`Found ${assets.length} posts`);
    return assets.map(mapAssetToPost);
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
}
