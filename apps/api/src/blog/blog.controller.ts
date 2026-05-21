import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { BlogService } from "./blog.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { AdminGuard } from "../admin/admin.guard";

interface AuthRequest extends Express.Request {
  user: { id: string; role: string };
}

@Controller("blog")
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get("posts")
  listPosts(
    @Query("page") page?: string,
    @Query("category") category?: string,
  ) {
    return this.blogService.listPosts({
      page: page ? Number(page) : 1,
      categorySlug: category,
    });
  }

  @Get("categories")
  listCategories() {
    return this.blogService.listCategories();
  }

  @Get("posts/:slug")
  getPost(@Param("slug") slug: string) {
    return this.blogService.getPost(slug);
  }

  @Post("posts")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  createPost(@Request() req: AuthRequest, @Body() dto: CreatePostDto) {
    return this.blogService.createPost(req.user.id, dto);
  }

  @Patch("posts/:id")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  updatePost(@Param("id") id: string, @Body() dto: Partial<CreatePostDto>) {
    return this.blogService.updatePost(id, dto);
  }

  @Delete("posts/:id")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  deletePost(@Param("id") id: string) {
    return this.blogService.deletePost(id);
  }

  @Post("posts/:id/comments")
  @UseGuards(AuthGuard("jwt"))
  addComment(
    @Request() req: AuthRequest,
    @Param("id") postId: string,
    @Body("content") content: string,
  ) {
    return this.blogService.addComment(postId, req.user.id, content);
  }
}
