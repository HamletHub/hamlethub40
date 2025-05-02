import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Query the hubs collection for documents with type: "town"
    const towns = await db
      .collection('hubs')
      .find({ type: 'town' })
      .project({ _id: 1, title: 1 })
      .sort({ title: 1 })
      .toArray();
    
    // Map through the towns and convert the _id to string
    const townsWithStringIds = towns.map(town => ({
      ...town,
      _id: town._id.toString()
    }));
    
    console.log(`Found ${townsWithStringIds.length} towns`);
    
    return NextResponse.json({
      success: true,
      towns: townsWithStringIds
    });
  } catch (error) {
    console.error('Error fetching towns:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch towns'
    }, { status: 500 });
  }
} 