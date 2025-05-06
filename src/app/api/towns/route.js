import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('API: Towns endpoint called');
    const { db } = await connectToDatabase();
    console.log('API: Database connection established');
    
    // Query the hubs collection for all towns
    // We're now looking for type='town' and not filtering by state/status
    const allHubs = await db
      .collection('hubs')
      .find({ type: 'town' })  // Filter by type='town'
      .project({ _id: 1, title: 1, alias: 1, type: 1, status: 1 })
      .toArray();
    
    console.log(`API: Found ${allHubs.length} total hubs with type='town'`);
    
    // If no towns found, try a broader search
    let towns = allHubs;
    if (towns.length === 0) {
      console.log('API: No hubs with type="town" found, getting all hubs');
      
      towns = await db
        .collection('hubs')
        .find({})
        .limit(100)
        .project({ _id: 1, title: 1, alias: 1, type: 1, status: 1 })
        .toArray();
        
      // Log the first few records to debug
      if (towns.length > 0) {
        console.log('API: Sample hub structure:', JSON.stringify(towns[0]));
      }
    }
    
    // Map through the towns and convert the _id to string
    const townsWithStringIds = towns.map(town => ({
      _id: town._id.toString(),
      title: town.title || 'Unnamed Town', 
      alias: town.alias || town._id.toString(),
      type: town.type || 'unknown',
      status: town.status || 'unknown'
    }));
    
    console.log(`API: Returning ${townsWithStringIds.length} town records`);
    
    // Log a few examples to debug
    if (townsWithStringIds.length > 0) {
      console.log('API: First few towns:', townsWithStringIds.slice(0, 3));
    }
    
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