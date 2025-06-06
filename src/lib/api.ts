import { Post } from "@/interfaces/post";
import { getDatabase } from "./mongodb";
import { getTownSlugFromHubId } from "./hubs";
import { convertToGcsUrl } from "./imageUtils";

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
function mapAssetToPost(asset: AssetPost, imageSubfolder?: string): Post {
  // Convert S3 image URLs to GCS URLs with specified subfolder
  const imageUrl = asset.imageUrl ? convertToGcsUrl(asset.imageUrl, imageSubfolder) : '';
  
  return {
    slug: asset.alias || '',
    title: asset.title || '',
    date: asset.publishAt ? new Date(asset.publishAt).toISOString() : '',
    coverImage: imageUrl,
    author: { name: 'HamletHub', picture: '' },
    excerpt: asset.metaDescription || '',
    ogImage: { url: imageUrl },
    content: asset.description || '',
    hubId: asset.hubId || '',
    townSlug: getTownSlugFromHubId(asset.hubId) || '',
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

export async function getPostBySlug(slug: string, imageSubfolder?: string): Promise<Post | null> {
  try {
    console.log(`Fetching post with slug: ${slug}`);
    const db = await withTimeout(getDatabase(), 15000);
    
    // Only select the fields we need to improve performance
    const projection = {
      alias: 1,
      title: 1,
      publishAt: 1,
      imageUrl: 1,
      metaDescription: 1,
      description: 1,
      hubId: 1
    };
    
    const asset = await withTimeout(
      db.collection('assets').findOne({ 
        alias: slug,
        type: "story",
        state: "published"
      }, { projection }),
      30000
    ) as AssetPost | null;

    if (!asset) {
      console.log(`No post found with slug: ${slug}`);
      return null;
    }
    
    console.log(`Found post: ${asset.title}`);
    return mapAssetToPost(asset, imageSubfolder);
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null;
  }
}

export async function getAllPosts(imageSubfolder?: string): Promise<Post[]> {
  try {
    console.log('Fetching all posts');
    const db = await withTimeout(getDatabase(), 15000);
    
    // Only select the fields we need
    const projection = {
      alias: 1,
      title: 1,
      publishAt: 1,
      imageUrl: 1,
      metaDescription: 1,
      description: 1,
      hubId: 1
    };
    
    const assets = await withTimeout(
      db.collection('assets').find({ 
        type: "story",
        state: "published"
      }, { projection })
      .sort({ publishAt: -1 })
      .limit(10)
      .toArray(),
      30000
    ) as AssetPost[];

    console.log(`Found ${assets.length} posts`);
    return assets.map(asset => mapAssetToPost(asset, imageSubfolder));
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
}
