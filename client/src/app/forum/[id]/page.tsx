"use client";

/**
 * Тема + комментарии: GET post, GET/POST comments
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getMe } from "@/app/actions/me";
import {
  checkForumPostLiked,
  createForumComment,
  deleteForumPost,
  getForumComments,
  getForumPost,
  toggleForumPostLike,
  type ForumCommentItem,
  type ForumPostDetail,
} from "@/app/actions/forum";
import { flag } from "@/lib/mock-data";
import { forumAuthorName, formatForumTime } from "@/lib/forum";
import { ArrowLeft, Loader2, ThumbsUp, Trash2 } from "lucide-react";

function CommentBlock({
  comment,
  onReply,
}: {
  comment: ForumCommentItem;
  onReply: (parentId: string) => void;
}) {
  return (
    <div className={comment.parentCommentId ? "ml-6 mt-2" : ""}>
      <div className="flex gap-2 p-3 rounded-xl bg-white/5 border border-border">
        <div className="size-8 rounded-full bg-gradient-primary grid place-items-center text-xs font-semibold shrink-0">
          {forumAuthorName(comment.author)[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {forumAuthorName(comment.author)}
            </span>
            {" · "}
            {formatForumTime(comment.createdAt)}
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          {!comment.parentCommentId && (
            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="text-xs text-primary mt-2 hover:underline"
            >
              Reply
            </button>
          )}
        </div>
      </div>
      {comment.replies?.map((r) => (
        <CommentBlock key={r.id} comment={r} onReply={onReply} />
      ))}
    </div>
  );
}

export default function ForumTopicPage() {
  const params = useParams();
  const router = useRouter();
  const postId = typeof params.id === "string" ? params.id : "";

  const [post, setPost] = useState<ForumPostDetail | null>(null);
  const [comments, setComments] = useState<ForumCommentItem[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  const load = useCallback(async () => {
    const [p, c, me] = await Promise.all([
      getForumPost(postId),
      getForumComments(postId),
      getMe(),
    ]);
    if ("error" in p && p.error) setError(p.error);
    else if (p && "id" in p) setPost(p as ForumPostDetail);
    if (Array.isArray(c)) setComments(c);
    setMeId(me?.id ?? null);
    if (me?.id) {
      const status = await checkForumPostLiked(postId);
      setLiked(!!status.liked);
    }
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [postId, load]);

  const isAuthor = !!(post && meId && post.authorId === meId);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await createForumComment(postId, {
      content: reply,
      parentCommentId: replyToId ?? undefined,
    });
    setSubmitting(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    setReply("");
    setReplyToId(null);
    const c = await getForumComments(postId);
    if (Array.isArray(c)) setComments(c);
  }

  async function handleLike() {
    setLikeBusy(true);
    const result = await toggleForumPostLike(postId);
    setLikeBusy(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    if ("liked" in result) {
      setLiked(result.liked);
      setPost((prev) =>
        prev ? { ...prev, likesCount: result.likesCount } : prev,
      );
    }
  }

  async function handleDeleteTopic() {
    if (!confirm("Delete this topic?")) return;
    setDeleting(true);
    const result = await deleteForumPost(postId);
    setDeleting(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    router.push("/forum");
    router.refresh();
  }

  if (loading) {
    return (
      <AppShell title="Forum">
        <div className="flex justify-center py-24">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error || !post) {
    return (
      <AppShell title="Forum">
        <p className="text-destructive text-sm">{error ?? "Not found"}</p>
        <Link href="/forum" className="text-primary text-sm mt-4 inline-block">
          ← Forum
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={post.title}>
      <Link
        href="/forum"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="size-4" /> All topics
      </Link>

      <article className="glass rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="font-medium text-foreground">{forumAuthorName(post.author)}</span>
          {post.author.profile?.country && (
            <span>
              {flag(post.author.profile.country)} {post.author.profile.country}
            </span>
          )}
          <span>{formatForumTime(post.createdAt)}</span>
          <span>{post.viewsCount} views</span>
        </div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        {post.industry && (
          <span className="mt-3 inline-block px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs">
            {post.industry}
          </span>
        )}
        <p className="mt-4 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>

        <button
          type="button"
          disabled={likeBusy}
          onClick={handleLike}
          className={`mt-4 h-9 px-4 rounded-lg border text-sm inline-flex items-center gap-2 transition disabled:opacity-60 ${
            liked
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border hover:border-primary/40"
          }`}
        >
          <ThumbsUp className={`size-4 ${liked ? "fill-current" : ""}`} />
          {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}
        </button>

        {isAuthor && (
          <button
            type="button"
            disabled={deleting}
            onClick={handleDeleteTopic}
            className="mt-6 h-9 px-4 rounded-lg border border-destructive/50 text-destructive text-xs inline-flex items-center gap-2"
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete topic
          </button>
        )}
      </article>

      <section className="space-y-4">
        <h2 className="font-semibold">Comments ({comments.length} top-level)</h2>

        {comments.map((c) => (
          <CommentBlock
            key={c.id}
            comment={c}
            onReply={(id) => {
              setReplyToId(id);
              setReply(`@${forumAuthorName(c.author)} `);
            }}
          />
        ))}

        <form onSubmit={handleComment} className="glass rounded-2xl p-4 space-y-3">
          {replyToId && (
            <p className="text-xs text-muted-foreground">
              Replying to a comment ·{" "}
              <button
                type="button"
                className="text-primary"
                onClick={() => {
                  setReplyToId(null);
                  setReply("");
                }}
              >
                Cancel
              </button>
            </p>
          )}
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply…"
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm resize-none"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="h-9 px-4 rounded-lg bg-gradient-primary text-white text-xs font-medium disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post reply"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
