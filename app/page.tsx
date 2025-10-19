"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type YouTubeVideo = {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium?: { url: string };
      high?: { url: string };
    };
  };
};

export default function DashboardPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/video");
        const data = await res.json();
        setVideos(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  if (loading) return <p className="p-4">Loading videos...</p>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div
          key={video.id}
          className=" rounded-2xl shadow hover:shadow-lg transition p-4 flex flex-col cursor-pointer"
          onClick={() => router.push(`/video/${video.id}`)}
        >
          <h2 className="text-lg font-semibold line-clamp-2 mb-2">
            {video.snippet.title}
          </h2>
          <img
            src={
              video.snippet.thumbnails.high?.url ||
              video.snippet.thumbnails.medium?.url ||
              "/placeholder.png"
            }
            alt={video.snippet.title}
            className="w-full h-auto rounded-lg mb-3"
          />
          <p className="text-sm text-gray-600 line-clamp-2 flex-grow">
            {video.snippet.description}
          </p>
        </div>
      ))}
    </div>
  );
}
