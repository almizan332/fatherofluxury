
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.445.0";

const DO_SPACES_KEY = Deno.env.get("DO_SPACES_KEY");
const DO_SPACES_SECRET = Deno.env.get("DO_SPACES_SECRET");
const DO_SPACES_ENDPOINT = Deno.env.get("DO_SPACES_ENDPOINT") || "https://nyc3.digitaloceanspaces.com";
const DO_SPACES_BUCKET = "shadow-copy-portal";
const DO_SPACES_REGION = "nyc3";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create S3 client (Digital Ocean Spaces uses S3 compatible API)
const s3Client = new S3Client({
  endpoint: DO_SPACES_ENDPOINT,
  region: DO_SPACES_REGION,
  credentials: {
    accessKeyId: DO_SPACES_KEY || "",
    secretAccessKey: DO_SPACES_SECRET || "",
  },
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, fileType } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the file from the provided URL
    const fileResponse = await fetch(url);
    if (!fileResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch file from URL: ${fileResponse.statusText}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileData = await fileResponse.arrayBuffer();
    const fileBuffer = new Uint8Array(fileData);

    // Generate a unique filename
    const fileExtension = getFileExtension(url, fileType);
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
    const filePath = `uploads/${filename}`;

    // Upload to Digital Ocean Spaces
    const contentType = fileType || fileResponse.headers.get("Content-Type") || "application/octet-stream";
    await s3Client.send(new PutObjectCommand({
      Bucket: DO_SPACES_BUCKET,
      Key: filePath,
      Body: fileBuffer,
      ACL: "public-read",
      ContentType: contentType,
    }));

    // Generate the public URL
    const publicUrl = `${DO_SPACES_ENDPOINT}/${DO_SPACES_BUCKET}/${filePath}`;

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to extract file extension from URL or fallback to fileType
function getFileExtension(url: string, fileType?: string): string {
  // Try to get extension from URL
  const urlExtension = url.split(/[#?]/)[0].split('.').pop()?.trim();
  if (urlExtension && urlExtension.length <= 5) {
    return `.${urlExtension}`;
  }

  // Fallback to fileType
  if (fileType) {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/quicktime': '.mov'
    };
    
    return mimeToExt[fileType] || '';
  }
  
  return '';
}
