"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {youtube_v3} from "googleapis"
import CommentUI from "@/app/components/CommentUI";

type Video = {
  id: string;
  snippet: {
    title: string;
    description: string;
  };
};

type Comment = {
  id: string;
  text: string;
  replies?: {
    id: string;
    text: string
  }[]
};

export default function VideoPage() {
  const params = useParams();
  const videoId = params.videoId;

  const [video, setVideo] = useState<Video | null>(null);
  const [title, setTitle] = useState("");
  const [videoPlayId, setVideoPlayId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // Fetch video details
  useEffect(() => {
    async function fetchVideo() {
      try {
        const res = await fetch(`/api/video?id=${videoId}`);
        const data = await res.json();
        const vid = (data.items as any[]).find(item => item?.id as string === videoId);
        if(!vid) throw new Error("video not found") // assuming API returns { items: [...] }
        setVideo(vid);
        setTitle(vid.snippet.title);
        setDescription(vid.snippet.description);
        setVideoPlayId(vid.contentDetails.videoId);
        console.log({vid})
      } catch (err) {
        console.error(err);
      }
    }
    fetchVideo();
  }, [videoId]);

  // Fetch comments
  useEffect(() => {
    if(!videoPlayId) return
    async function fetchComments() {
      try {
        const res = await fetch(`/api/comments?videoId=${videoPlayId}`);
        console.log({res})
        const data = (await res.json()).data as youtube_v3.Schema$CommentThreadListResponse
        console.log({data})
        const comments = data.items?.map(item => ({
          text: item.snippet?.topLevelComment?.snippet?.textDisplay as string, 
          id: item.id,
          replies: item.replies?.comments?.map(reply => ({
            text: reply.snippet?.textDisplay,
            id: reply.id
          }))
        })) as Comment[]
        setComments(comments)
      } catch (err) {
        console.error(err);
      }
    }
    fetchComments();
  }, [videoPlayId]);

  // Update title/description
  async function handleUpdate() {
    await fetch("/api/video", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, title, description }),
    });
    alert("Updated successfully!");
  }

  // Add comment
  async function handleAddComment() {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: videoPlayId, text: newComment }),
    });
    const data = (await res.json()).data as youtube_v3.Schema$CommentThread
    console.log({addedComment: data})
    const comment = {
      text: data.snippet?.topLevelComment?.snippet?.textDisplay as string,
      id: data.id
    } as Comment
    setComments(prev => [comment,...prev])
    setNewComment("");
  }

  // Delete comment
  async function handleDeleteComment(commentId: string) {
    await fetch("/api/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  async function handleReplyComment(commentId: string, reply: string) {
    const res = await fetch(`/api/comments/${commentId}/replies`,{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: reply })
    })

    const data = (await res.json()).data as youtube_v3.Schema$Comment
    console.log({addReply: data})
    const newComments = [...comments]
    const index = newComments.findIndex(item => item.id === commentId)
    console.log({index})
    if(index === -1) return
    newComments[index].replies?.push({
      id: data.id as string,
      text: data.snippet?.textDisplay as string
    })

    console.log({newComments})

    setComments(newComments)
  }

  async function handleDeleteReply(commentId: string, replyId: string) {
    await fetch("/api/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replyId }),
    });
    setComments((prev) => {
      const newState = [...prev]

      const replies = newState.find(comment => comment.id === commentId)?.replies
      const replyIndex = replies?.findIndex(reply => reply.id === replyId)
      if(!replyIndex) return prev

      replies?.splice(replyIndex, 1)
      return newState;
    })
  }

  if (!video) return <p className="p-4">Loading video...</p>;


  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Video Edit Section */}
      <div className="space-y-2">
      { videoPlayId && <iframe
        width="853"
        height="480"
        src={`https://www.youtube.com/embed/${videoPlayId}?rel=0`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded youtube"
      />}
        <input
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleUpdate}
        >
          Update Video
        </button>
      </div>

      {/* Comments Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Comments</h3>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow p-2 border rounded"
            placeholder="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
            onClick={handleAddComment}
          >
            Add
          </button>
        </div>
        <div className="space-y-5">
          {comments?.map((c) => (
            <CommentUI 
              text={c.text} 
              key={c.id} 
              replies={c.replies} 
              onDeleteClick={() => handleDeleteComment(c.id)} 
              onDeleteReply={(id) => handleDeleteReply(c.id, id)}
              onSubmitReply={(reply) => handleReplyComment(c.id, reply)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
