"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const GREEN = "#26A55B";
const GREEN_LIGHT = "#e8f7ef";
const TEXT = "#111111";
const TEXT_SOFT = "#374151";
const BORDER = "#D4D4D4";
const MUTED = "#4b5563";
const BG = "#f5f5f5";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  author: { displayName: string | null; avatar: string | null };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        style={{
          background: "#fff",
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          overflow: "hidden",
          transition: "border-color .2s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.borderColor = GREEN)
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.borderColor = BORDER)
        }
      >
        {/* Cover image or placeholder */}
        <div
          style={{
            height: 180,
            background: post.coverImage
              ? `url(${post.coverImage}) center/cover`
              : GREEN_LIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!post.coverImage && (
            <span style={{ fontSize: "2.5rem" }}>📝</span>
          )}
        </div>

        <div style={{ padding: "1.1rem" }}>
          {post.category && (
            <span
              style={{
                display: "inline-block",
                background: GREEN_LIGHT,
                color: GREEN,
                fontSize: ".7rem",
                fontWeight: 700,
                padding: ".18rem .5rem",
                borderRadius: 4,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                marginBottom: ".5rem",
              }}
            >
              {post.category.name}
            </span>
          )}
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: TEXT,
              margin: "0 0 .45rem",
              lineHeight: 1.4,
            }}
          >
            {post.title}
          </h2>
          {post.excerpt && (
            <p
              style={{
                fontSize: ".83rem",
                color: MUTED,
                margin: "0 0 .75rem",
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              } as React.CSSProperties}
            >
              {post.excerpt}
            </p>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: ".75rem",
              color: MUTED,
            }}
          >
            <span>{post.author.displayName ?? "LandRetrieve"}</span>
            {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/blog/categories`)
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (activeCategory) params.set("category", activeCategory);
    fetch(`${API}/api/blog/posts?${params}`)
      .then((r) => r.json())
      .then((data: { posts: PostSummary[]; total: number; pages: number }) => {
        setPosts(data.posts ?? []);
        setTotalPages(data.pages ?? 1);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [page, activeCategory]);

  function selectCategory(slug: string) {
    setActiveCategory(slug);
    setPage(1);
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", paddingTop: 72 }}>
      {/* Hero */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "2.5rem 1.5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: TEXT, margin: "0 0 .4rem" }}>
            Blog LandRetrieve
          </h1>
          <p style={{ fontSize: ".95rem", color: MUTED, margin: 0 }}>
            Guide, approfondimenti e news sul mercato immobiliare rurale italiano.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "2rem", alignItems: "start" }}>
          {/* Main content */}
          <div>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    border: `3px solid ${BORDER}`,
                    borderTopColor: GREEN,
                    borderRadius: "50%",
                    animation: "spin .8s linear infinite",
                  }}
                />
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <p style={{ fontSize: "1.1rem", color: MUTED }}>Nessun articolo disponibile.</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1.25rem",
                    marginBottom: "1.75rem",
                  }}
                >
                  {posts.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", gap: ".5rem", justifyContent: "center" }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 6,
                          border: `1.5px solid ${n === page ? GREEN : BORDER}`,
                          background: n === page ? GREEN : "#fff",
                          color: n === page ? "#fff" : TEXT_SOFT,
                          fontSize: ".85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: "1.5rem" }}>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: "1.1rem",
              }}
            >
              <h3
                style={{
                  fontSize: ".8rem",
                  fontWeight: 700,
                  color: MUTED,
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  margin: "0 0 .85rem",
                }}
              >
                Categorie
              </h3>
              <button
                onClick={() => selectCategory("")}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: ".4rem .5rem",
                  background: !activeCategory ? GREEN_LIGHT : "transparent",
                  color: !activeCategory ? GREEN : TEXT_SOFT,
                  border: "none",
                  borderRadius: 6,
                  fontSize: ".85rem",
                  fontWeight: !activeCategory ? 700 : 400,
                  cursor: "pointer",
                  marginBottom: ".2rem",
                }}
              >
                Tutti gli articoli
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.slug)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    textAlign: "left",
                    padding: ".4rem .5rem",
                    background: activeCategory === cat.slug ? GREEN_LIGHT : "transparent",
                    color: activeCategory === cat.slug ? GREEN : TEXT_SOFT,
                    border: "none",
                    borderRadius: 6,
                    fontSize: ".85rem",
                    fontWeight: activeCategory === cat.slug ? 700 : 400,
                    cursor: "pointer",
                    marginBottom: ".2rem",
                  }}
                >
                  <span>{cat.name}</span>
                  <span
                    style={{
                      fontSize: ".7rem",
                      background: BORDER,
                      color: MUTED,
                      padding: ".1rem .4rem",
                      borderRadius: 10,
                    }}
                  >
                    {cat._count.posts}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
