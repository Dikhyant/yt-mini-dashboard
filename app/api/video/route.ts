import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";


export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !(session as any).accessToken) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  const accessToken = (session as any).accessToken;

  try {
    // Step 1: get uploads playlist
    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const channelData = await channelRes.json();
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Step 2: fetch videos from uploads playlist
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const playlistData = await playlistRes.json();
    return new Response(JSON.stringify(playlistData), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
