import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto } from "./dto/create-post.dto";

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async listPosts(options: { page?: number; categorySlug?: string } = {}) {
    const take = 12;
    const skip = ((options.page ?? 1) - 1) * take;

    const where: { published: boolean; category?: { slug: string } } = { published: true };
    if (options.categorySlug) {
      where.category = { slug: options.categorySlug };
    }

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          category: { select: { name: true, slug: true } },
          tags: { select: { name: true, slug: true } },
          author: { select: { displayName: true, avatar: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { posts, total, pages: Math.ceil(total / take) };
  }

  async getPost(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        tags: { select: { name: true, slug: true } },
        author: { select: { displayName: true, avatar: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { displayName: true, avatar: true } },
          },
        },
      },
    });
    if (!post || !post.published) throw new NotFoundException("Articolo non trovato");
    return post;
  }

  async listCategories() {
    return this.prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
  }

  async createPost(authorId: string, dto: CreatePostDto) {
    const { tagIds, ...data } = dto;
    return this.prisma.blogPost.create({
      data: {
        ...data,
        authorId,
        publishedAt: data.published ? new Date() : null,
        tags: tagIds?.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
    });
  }

  async updatePost(id: string, dto: Partial<CreatePostDto>) {
    const { tagIds, ...data } = dto;
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Articolo non trovato");

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.published && !existing.published ? new Date() : undefined,
        tags: tagIds !== undefined
          ? { set: tagIds.map((tid) => ({ id: tid })) }
          : undefined,
      },
    });
  }

  async deletePost(id: string) {
    await this.prisma.blogPost.delete({ where: { id } });
    return { deleted: true };
  }

  async addComment(postId: string, authorId: string, content: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post || !post.published) throw new NotFoundException("Articolo non trovato");
    return this.prisma.blogComment.create({
      data: { postId, authorId, content },
      include: { author: { select: { displayName: true, avatar: true } } },
    });
  }
}
