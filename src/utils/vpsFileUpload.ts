import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file (or fetch+upload a remote URL) directly to DigitalOcean Spaces
 * via the `do-file-upload` edge function. Supabase Storage is no longer used.
 */
export const uploadFileToVPS = async (file: File | { url: string; type: string }) => {
  // URL upload case (remote file -> DO Spaces via edge function fetch)
  if (typeof (file as any).url === "string") {
    const fileUrl = (file as any).url;
    const fileType = (file as any).type || "";

    const { data, error } = await supabase.functions.invoke("do-file-upload", {
      body: { url: fileUrl, fileType },
    });
    if (error) {
      console.error("Error calling DO upload function (URL mode):", error);
      throw error;
    }
    return { url: data.url };
  }

  // Direct file upload
  if (!file) throw new Error("No file provided");
  const realFile = file as File;
  if (realFile.size === 0 && realFile.name === "remote-file") {
    throw new Error("Invalid file object");
  }

  const form = new FormData();
  form.append("file", realFile, realFile.name);
  form.append("folder", "uploads");

  // Get current session token for the edge function call
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("You must be logged in to upload files");

  const projectId = (import.meta as any).env.VITE_SUPABASE_PROJECT_ID;
  const endpoint = `https://${projectId}.functions.supabase.co/do-file-upload`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("DO upload failed:", res.status, text);
    throw new Error(`Upload failed: ${res.status}`);
  }

  const data = await res.json();
  if (!data?.url) throw new Error("Upload did not return a URL");
  return { url: data.url };
};
