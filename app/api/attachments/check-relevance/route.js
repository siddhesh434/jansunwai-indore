// app/api/attachments/check-relevance/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { query, fileAnalysis, fileName } = await request.json();

    if (!fileAnalysis) {
      return NextResponse.json(
        { error: "File analysis is required" },
        { status: 400 }
      );
    }

    const safeQuery = typeof query === "string" ? query : "";
    const safeFileName = typeof fileName === "string" ? fileName : "attachment";

    // Simple relevance check logic
    // In a real implementation, you might use AI to analyze relevance
    const queryLower = safeQuery.toLowerCase();
    const fileContent = `${fileAnalysis.description || ""} ${fileAnalysis.summary || ""}`.toLowerCase();
    
    // Check for common municipal complaint keywords (including Indian context)
    const municipalKeywords = [
      // Basic infrastructure
      'sewage', 'water', 'electricity', 'road', 'street', 'garbage', 'waste',
      'construction', 'noise', 'traffic', 'parking', 'streetlight', 'drainage',
      'flood', 'pothole', 'maintenance', 'repair', 'service', 'utility',
      'complaint', 'issue', 'problem', 'damage', 'broken', 'leak', 'overflow',
      
      // Infrastructure components
      'pipe', 'drain', 'manhole', 'streetlight', 'lamp', 'pole', 'sign',
      'building', 'wall', 'fence', 'tree', 'plant', 'grass', 'sidewalk',
      'crossing', 'bridge', 'tunnel', 'underground', 'cable', 'wire',
      'meter', 'box', 'panel', 'switch', 'fuse', 'transformer', 'substation',
      
      // Transportation
      'vehicle', 'car', 'bus', 'truck', 'motorcycle', 'bicycle', 'pedestrian',
      'accident', 'collision', 'injury', 'emergency', 'fire', 'police',
      'ambulance', 'hospital', 'clinic', 'school', 'college', 'university',
      
      // Commercial and public spaces
      'market', 'shop', 'store', 'mall', 'office', 'factory', 'warehouse',
      'park', 'garden', 'playground', 'sports', 'ground', 'stadium',
      'temple', 'mosque', 'church', 'gurudwara', 'religious', 'place',
      
      // Government and services
      'government', 'municipal', 'corporation', 'council', 'department',
      'officer', 'employee', 'worker', 'contractor', 'vendor', 'supplier',
      
      // Indian municipal specific terms
      'nagar', 'palika', 'nigam', 'sabha', 'panchayat', 'gram', 'village',
      'colony', 'sector', 'block', 'area', 'locality', 'neighborhood',
      'chowk', 'crossing', 'junction', 'signal', 'traffic', 'light',
      'footpath', 'pavement', 'sidewalk', 'curb', 'gutter', 'drainage',
      'sewer', 'toilet', 'urinal', 'public', 'facility', 'amenity',
      'street', 'vendor', 'hawker', 'encroachment', 'illegal', 'construction',
      'demolition', 'eviction', 'notice', 'warning', 'fine', 'penalty',
      'tax', 'bill', 'payment', 'receipt', 'certificate', 'license',
      'permit', 'approval', 'sanction', 'clearance', 'inspection',
      'survey', 'measurement', 'assessment', 'evaluation', 'report',
      'complaint', 'grievance', 'redressal', 'helpline', 'support',
      'emergency', 'disaster', 'calamity', 'relief', 'rescue', 'aid',
      'medical', 'health', 'sanitation', 'hygiene', 'cleanliness',
      'pollution', 'environment', 'air', 'water', 'soil', 'noise',
      'dust', 'smoke', 'fumes', 'odor', 'smell', 'stink', 'filth',
      'dirt', 'mud', 'sludge', 'slime', 'grease', 'oil', 'chemical',
      'hazardous', 'toxic', 'dangerous', 'unsafe', 'risky', 'harmful'
    ];

    // Check if query contains municipal keywords
    const queryHasMunicipalKeywords = municipalKeywords.some(keyword => 
      queryLower.includes(keyword)
    );

    // Check if file content is related to the query
    const contentRelevance = municipalKeywords.some(keyword => 
      fileContent.includes(keyword)
    );

    // Check for image/video relevance indicators
    const isImageOrVideo = safeFileName.match(/\.(jpg|jpeg|png|gif|bmp|mp4|avi|mov|wmv)$/i);
    const hasVisualContent = isImageOrVideo && (fileAnalysis.description || "").length > 5;

    // Determine relevance
    let relevant = false;
    let reason = "";

    // If file content is too short and not a visual file, mark as irrelevant
    if (fileContent.length < 5 && !hasVisualContent) {
      relevant = false;
      reason = "Document appears to be empty or unreadable";
    }
    // For visual files (images/videos), check if they have relevant content
    else if (hasVisualContent) {
      // Check if the visual content description contains municipal keywords
      if (contentRelevance) {
        relevant = true;
        reason = "Visual content matches municipal complaint keywords";
      } else {
        relevant = false;
        reason = "Visual content doesn't relate to municipal issues";
      }
    }
    // For non-visual files, check if content relates to municipal keywords
    else if (contentRelevance) {
      relevant = true;
      reason = "Document content matches municipal complaint keywords";
    } else {
      relevant = false;
      reason = "Document content doesn't relate to municipal issues";
    }

    console.log(`Relevance check for ${safeFileName}:`, {
      query: queryLower,
      fileContent: fileContent.substring(0, 100),
      isImageOrVideo,
      hasVisualContent,
      queryHasMunicipalKeywords,
      contentRelevance,
      relevant,
      reason
    });

    return NextResponse.json({
      relevant,
      reason,
      queryKeywords: municipalKeywords.filter(keyword => queryLower.includes(keyword)),
      contentKeywords: municipalKeywords.filter(keyword => fileContent.includes(keyword))
    });

  } catch (error) {
    console.error("Error checking document relevance:", error);
    return NextResponse.json(
      { error: "Failed to check document relevance" },
      { status: 500 }
    );
  }
}
