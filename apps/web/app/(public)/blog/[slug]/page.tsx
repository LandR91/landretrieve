"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

const GREEN = "#26A55B";
const GREEN_LIGHT = "#e8f7ef";
const TEXT = "#111111";
const TEXT_SOFT = "#374151";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { displayName: string | null; avatar: string | null };
}

interface PostDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  publishedAt: string | null;
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  author: { displayName: string | null; avatar: string | null };
  comments: Comment[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken ?? "";

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API}/api/blog/posts/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data: PostDetail | null) => {
        if (data) setPost(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!accessToken) { router.push("/login"); return; }
    setSubmittingComment(true);
    setCommentError("");
    try {
      const res = await fetch(`${API}/api/blog/posts/${post!.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: comment.trim() }),
      });
      if (!res.ok) throw new Error();
      const newComment = await res.json() as Comment;
      setPost((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : prev
      );
      setComment("");
    } catch {
      setCommentError("Impossibile inviare il commento. Riprova.");
    } finally {
      setSubmittingComment(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: `3px solid ${BORDER}`,
            borderTopColor: GREEN,
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem", minHeight: "100vh" }}>
        <p style={{ fontSize: "1.2rem", fontWeight: 700, color: TEXT }}>Articolo non trovato</p>
        <Link href="/blog" style={{ color: GREEN, fontSize: ".9rem" }}>
          ← Torna al blog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", paddingTop: 72 }}>
      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            padding: ".65rem 1.5rem",
            fontSize: ".78rem",
            color: MUTED,
            display: "flex",
            gap: ".4rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" style={{ color: MUTED, textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/blog" style={{ color: MUTED, textDecoration: "none" }}>Blog</Link>
          {post.category && (
            <>
              <span>/</span>
              <Link
                href={`/blog?category=${post.category.slug}`}
                style={{ color: MUTED, textDecoration: "none" }}
              >
                {post.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: TEXT }}>{post.title}</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Article */}
        <article
          style={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: "1.5rem",
          }}
        >
          {/* Cover image */}
          {post.coverImage && (
            <div
              style={{
                height: 320,
                background: `url(${post.coverImage}) center/cover`,
              }}
            />
          )}

          <div style={{ padding: "2rem 2.5rem" }}>
            {/* Category + tags */}
            <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginBottom: ".8rem" }}>
              {post.category && (
                <Link
                  href={`/blog?category=${post.category.slug}`}
                  style={{
                    background: GREEN_LIGHT,
                    color: GREEN,
                    fontSize: ".7rem",
                    fontWeight: 700,
                    padding: ".18rem .5rem",
                    borderRadius: 4,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >
                  {post.category.name}
                </Link>
              )}
              {post.tags.map((tag) => (
                <span
                  key={tag.slug}
                  style={{
                    background: "#f3f4f6",
                    color: MUTED,
                    fontSize: ".7rem",
                    padding: ".18rem .5rem",
                    borderRadius: 4,
                    letterSpacing: ".04em",
                  }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: TEXT,
                margin: "0 0 .6rem",
                lineHeight: 1.3,
              }}
            >
              {post.title}
            </h1>

            {/* Meta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".75rem",
                fontSize: ".8rem",
                color: MUTED,
                marginBottom: "1.75rem",
                paddingBottom: "1.25rem",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <span>{post.author.displayName ?? "LandRetrieve"}</span>
              {post.publishedAt && (
                <>
                  <span>·</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </>
              )}
            </div>

            {/* Content */}
            <div
              style={{
                fontSize: ".93rem",
                color: TEXT_SOFT,
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {post.content}
            </div>
          </div>
        </article>

        {/* Comments */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: "1.5rem 2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: TEXT,
              margin: "0 0 1.25rem",
              paddingBottom: ".75rem",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            Commenti ({post.comments.length})
          </h2>

          {post.comments.length === 0 ? (
            <p style={{ fontSize: ".85rem", color: MUTED, marginBottom: "1.25rem" }}>
              Nessun commento ancora. Sii il primo!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              {post.comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: "1rem 1.25rem",
                    background: "#f9f9f9",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      marginBottom: ".5rem",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: GREEN_LIGHT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".85rem",
                        fontWeight: 700,
                        color: GREEN,
                        flexShrink: 0,
                      }}
                    >
                      {(c.author.displayName ?? "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: ".83rem", fontWeight: 600, color: TEXT }}>
                        {c.author.displayName ?? "Utente"}
                      </span>
                      <span style={{ fontSize: ".72rem", color: MUTED, marginLeft: ".5rem" }}>
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: ".85rem", color: TEXT_SOFT, margin: 0, lineHeight: 1.6 }}>
                    {c.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Comment form */}
          {session ? (
            <form onSubmit={submitComment}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Scrivi un commento..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  fontSize: ".875rem",
                  color: TEXT,
                  resize: "vertical",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: ".6rem",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = GREEN)}
                onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
              />
              {commentError && (
                <p style={{ fontSize: ".8rem", color: "#dc2626", marginBottom: ".5rem" }}>
                  {commentError}
                </p>
              )}
              <button
                type="submit"
                disabled={submittingComment || !comment.trim()}
                style={{
                  padding: ".55rem 1.25rem",
                  background: GREEN,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: ".85rem",
                  fontWeight: 600,
                  cursor: submittingComment || !comment.trim() ? "not-allowed" : "pointer",
                  opacity: submittingComment || !comment.trim() ? 0.6 : 1,
                  transition: "background-color .15s",
                }}
                onMouseEnter={(e) => {
                  if (!submittingComment && comment.trim())
                    e.currentTarget.style.backgroundColor = "#1d8a4b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = GREEN;
                }}
              >
                {submittingComment ? "Invio..." : "Pubblica commento"}
              </button>
            </form>
          ) : (
            <p style={{ fontSize: ".85rem", color: MUTED }}>
              <Link href="/login" style={{ color: GREEN, fontWeight: 600 }}>
                Accedi
              </Link>{" "}
              per lasciare un commento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
