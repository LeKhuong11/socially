"use client"

import { createComment, deletePost, getPosts, toogleLike } from "@/actions/post.action";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow, formatRelative, subDays } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { DeleteAlertDialog } from "./delete-alert-dialog";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useLocale } from "next-intl";
import { useAppContext } from "@/app/context-provider";
import SignInModal from "./signin-modal";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];
const CHAR_LIMIT = 300;

function PostCard({ post, dbUserId, isOwnPost }: { post: Post; dbUserId: string | null, isOwnPost: boolean }) {
    const { user } = useAppContext();
    const [ newComment, setNewComment ] = useState("");
    const [ isCommenting, setIsCommenting ] = useState(false);
    const [ isLiking, setIsLiking ] = useState(false);
    const [ isDeleting, setIsDeleting ] = useState(false);
    const [ hasLiked, setHasLiked ] = useState(false);
    const [ optimisticLikes, setOptimisticLikes ] = useState(post._count.likes);
    const [showComments, setShowComments] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const locale = useLocale();

    const plainText = post.content ? post.content.replace(/<br\s*\/?>/gi, '\n') : ''
    const isLong = plainText.length > CHAR_LIMIT
    const shortContent = post.content ? post.content.slice(0, post.content.indexOf(plainText[CHAR_LIMIT])) + '...' : ''
    const handleToggleExpanded = () => setExpanded(!expanded)

    useEffect(() => {
      if (dbUserId !== null) {
        const isLiked = post.likes.some(like => like.userId === dbUserId);
        setHasLiked(isLiked);
      }
    }, [])

    const handleLike = async () => {
        if (isLiking) return;
        
        try {
          setIsLiking(true);
          setHasLiked(prev => !prev);
          setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));

          await toogleLike(post.id);
        } catch (error) {
            console.error("Failed to like post:", error);
            setOptimisticLikes(post._count.likes);
            setHasLiked(post.likes.some((like) => like.userId === dbUserId));
        } finally {
            setIsLiking(false);
        }
    }

    const handleAddComment = async () => {
      if(!newComment.trim() || isCommenting) return;

      try {
        setIsCommenting(true);
        const result = await createComment(post.id, newComment);
        if (result?.success) {
          toast.success("Comment posted successfully");
          setNewComment("");
        }
      } catch {
        toast.error("Failed to add comment");
      } finally {
        setIsCommenting(false);
      }
    }

    const handleDeletePost = async () => {
      if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post deleted successfully");
      else throw new Error(result.error);
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
    }
    
  return (
    <div className="mb-4">
      <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image || '/images/avatar-default.jpg'} />
              </Avatar>
            </Link>

            {/* POST HEADER & TEXT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>
                  <div style={{ margin: 0 }} className="text-xs text-muted-foreground">
                    <span>{formatRelative(subDays(new Date(post.createdAt), 3), new Date(), { locale: locale === 'vi' ? vi : enUS })}</span>
                  </div>
                </div>
                {/* Check if current user is the post author */}
                {isOwnPost && (
                  <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                )}
              </div>
              <div
                className="mt-2 text-sm text-foreground break-words"
                dangerouslySetInnerHTML={{
                  __html: expanded || !isLong ? post.content || '' : shortContent,
                }}
              />
              {isLong && (
                <button
                  className="text-blue-600 font-medium mt-2 hover:underline"
                  onClick={handleToggleExpanded}
                >
                  {expanded ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          </div>

          {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
            </div>
          )}

          {/* LIKE & COMMENT BUTTONS */}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 ${ hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500" }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInModal>
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInModal>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`} />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-4 ml-3 ">
                {/* DISPLAY COMMENTS */}
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-2">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage src={comment.author.image || "/images/avatar-default.jpg"} />
                    </Avatar>
                    <div>
                      <div className="flex-1 min-w-0 dark:bg-[#303031] bg-[#f3f3f3] py-1 px-3 rounded-lg">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 \">
                          <span className="font-bold text-sm">{comment.author.name}</span>
                        </div>
                        <p className="text-sm font-thin break-words">{comment.content}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: locale === 'vi' ? vi : enUS })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {user ? (
                <div className="flex space-x-3 px-2">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.image || "/images/avatar-default.jpg"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Posting..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <SignInModal>
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInModal>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

export default PostCard
