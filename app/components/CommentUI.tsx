"use client"

import React from "react";

interface CommentUIProps {
    text: string;
    replies?: {
        id: string,
        text: string
    }[];
    onDeleteClick?: () => void
    onDeleteReply?: (id: string) => void
    onSubmitReply?: (reply: string) => void
}
export default function CommentUI ({
    text, replies, onDeleteClick, onDeleteReply, onSubmitReply
}:CommentUIProps) {

  const [isReplyInputActive, setIsReplyInputActive] = React.useState<boolean>(false)


  return (
    <div>
        <div className="flex items-center" >
            <p className="text-white" >{text}</p>
            <button
                className="ml-auto"
                onClick={() => setIsReplyInputActive(true)} >Reply</button>
            <button
                className="ml-2"
                onClick={onDeleteClick} >Delete</button>
        </div>
        {
            isReplyInputActive && (
                <form className="flex items-center" onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target as HTMLFormElement)
                    const reply = formData.get("reply") as string
                    if(!reply) return
                    onSubmitReply?.(reply)
                    setIsReplyInputActive(false)
                    formData.set("reply","")
                }} >
                    <input name="reply" />
                    <button className="ml-auto" type="submit" >Reply</button>
                    <button className="ml-2" onClick={() => setIsReplyInputActive(false)} >Cancel</button>
                </form>
            )
        }
        {
            replies && replies?.map(item => {
                return (
                    <div className="flex items-center ml-6" >
                        <p className="text-white" >{item.text}</p>
                        <button className="ml-auto" onClick={() => {
                            onDeleteReply?.(item.id)
                        }} >Delete</button>
                    </div>
                )
            })
        }
    </div>
  )
}

