import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const BadWordsFilter = require("bad-words");

// Matches any http/https URL that is NOT landretrieve.com
const EXTERNAL_LINK_RE = /https?:\/\/(?!(?:www\.)?landretrieve\.com)[^\s<>"']+/gi;

@Injectable()
export class MessagingService {
  private profanityFilter: { isProfane: (s: string) => boolean };

  constructor(private prisma: PrismaService) {
    this.profanityFilter = new BadWordsFilter();
  }

  // ── Content guards ──────────────────────────────────────────────────────────

  hasProfanity(text: string): boolean {
    try {
      return this.profanityFilter.isProfane(text);
    } catch {
      return false;
    }
  }

  hasExternalLinks(text: string): boolean {
    return EXTERNAL_LINK_RE.test(text);
  }

  validateMessage(text: string): void {
    if (!text || !text.trim()) {
      throw new BadRequestException("Il messaggio non può essere vuoto.");
    }
    if (this.hasExternalLinks(text)) {
      throw new BadRequestException(
        "I link esterni non sono consentiti. Puoi condividere solo link a landretrieve.com.",
      );
    }
    if (this.hasProfanity(text)) {
      throw new BadRequestException(
        "Il messaggio contiene contenuti non consentiti.",
      );
    }
  }

  // ── Thread operations ───────────────────────────────────────────────────────

  async getOrCreateThread(senderId: string, receiverId: string, propertyId?: string) {
    const existing = await this.prisma.thread.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
        ...(propertyId ? { propertyId } : {}),
      },
    });

    if (existing) return existing;

    return this.prisma.thread.create({
      data: { senderId, receiverId, propertyId },
    });
  }

  async getThreads(userId: string) {
    const threads = await this.prisma.thread.findMany({
      where: {
        OR: [
          { senderId: userId, senderDeleted: false },
          { receiverId: userId, receiverDeleted: false },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            message: true,
            createdAt: true,
            createdById: true,
            isRead: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return threads.map((t) => {
      const other = t.senderId === userId ? t.receiver : t.sender;
      const lastMsg = t.messages[0] ?? null;
      const unreadCount = 0; // computed separately if needed
      return { ...t, other, lastMsg, unreadCount };
    });
  }

  async getMessages(threadId: string, userId: string) {
    const thread = await this.prisma.thread.findFirst({
      where: {
        id: threadId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });
    if (!thread) throw new ForbiddenException("Accesso non autorizzato al thread.");

    return this.prisma.message.findMany({
      where: { threadId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async saveMessage(
    threadId: string,
    senderId: string,
    message: string,
    attachments?: object,
  ) {
    const [msg] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          threadId,
          createdById: senderId,
          message,
          attachments: attachments ?? undefined,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      }),
      // touch thread updatedAt (no explicit field — just re-save)
      this.prisma.thread.update({
        where: { id: threadId },
        data: { seen: false },
      }),
    ]);
    return msg;
  }

  async markRead(threadId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        threadId,
        createdById: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async unreadCount(threadId: string, userId: string): Promise<number> {
    return this.prisma.message.count({
      where: { threadId, createdById: { not: userId }, isRead: false },
    });
  }

  async getThreadParticipants(threadId: string) {
    return this.prisma.thread.findUnique({
      where: { id: threadId },
      select: {
        senderId: true,
        receiverId: true,
        sender: { select: { email: true, firstName: true, displayName: true } },
        receiver: { select: { email: true, firstName: true, displayName: true } },
      },
    });
  }
}
