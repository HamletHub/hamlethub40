import { getDatabase } from "@/lib/mongodb";
// @ts-ignore
import { NextResponse } from "next/server";

// Function to get all towns (limited to first 20 for safety)
export async function GET() {
  try {
    const db = await getDatabase();
    
    // Get all active hubs
    const hubs = await db.collection("hubs")
      .find({ state: "published" })
      .limit(20)
      .project({ name: 1, alias: 1 })
      .toArray();

    // Get a sample post for each hub
    const towns = [];
    for (const hub of hubs) {
      const post = await db.collection('assets')
        .findOne({
          type: "story",
          state: "published",
          $expr: { $eq: [{ $toString: "$hubId" }, { $toString: hub._id }] }
        }, { 
          projection: { alias: 1, title: 1 }
        });
      
      towns.push({
        town: hub.name,
        townSlug: hub.alias,
        hubId: hub._id.toString(),
        samplePost: post ? {
          slug: post.alias,
          title: post.title,
          url: `/${hub.alias}/${post.alias}`
        } : null
      });
    }

    return NextResponse.json({ success: true, towns });
  } catch (error: unknown) {
    console.error("Error in page debug API:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 