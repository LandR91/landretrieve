import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { MessagingService } from "./messaging.service";
import { MESSAGING_QUEUE } from "./messaging.processor";

const OFFLINE_DELAY_MS = 2 * 60 * 1000; // 2 minutes

interface AuthSocket extends Socket {
  data: { userId: string; email: string; role: string };
}

@WebSocketGateway({
  namespace: "/messaging",
  cors: { origin: process.env.FRONTEND_URL ?? "http://localhost:3000", credentials: true },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  /** userId → Set of socketIds (user may have multiple tabs) */
  private onlineUsers = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private messagingService: MessagingService,
    @InjectQueue(MESSAGING_QUEUE) private notifQueue: Queue,
  ) {}

  // ── Connection lifecycle ───────────────────────────────────────────────────

  async handleConnection(client: AuthSocket) {
    try {
      const raw =
        client.handshake.auth?.token ??
        client.handshake.headers?.authorization ??
        "";
      const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

      const payload = this.jwtService.verify<{ sub: string; email: string; role: string }>(
        token,
        { secret: this.config.get<string>("JWT_SECRET") },
      );

      client.data = { userId: payload.sub, email: payload.email, role: payload.role };
      client.join(`user:${payload.sub}`);

      if (!this.onlineUsers.has(payload.sub)) {
        this.onlineUsers.set(payload.sub, new Set());
      }
      this.onlineUsers.get(payload.sub)!.add(client.id);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthSocket) {
    const userId = client.data?.userId;
    if (!userId) return;

    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) this.onlineUsers.delete(userId);
    }
  }

  isOnline(userId: string): boolean {
    return (this.onlineUsers.get(userId)?.size ?? 0) > 0;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  @SubscribeMessage("join_thread")
  handleJoinThread(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() { threadId }: { threadId: string },
  ) {
    client.join(`thread:${threadId}`);
    return { event: "joined", data: { threadId } };
  }

  @SubscribeMessage("leave_thread")
  handleLeaveThread(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() { threadId }: { threadId: string },
  ) {
    client.leave(`thread:${threadId}`);
    return { event: "left", data: { threadId } };
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody()
    payload: {
      threadId: string;
      message: string;
      attachments?: Array<{ url: string; name: string; type: string; size: number }>;
    },
  ) {
    const { userId } = client.data;

    // Content validation
    try {
      this.messagingService.validateMessage(payload.message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Messaggio non valido.";
      throw new WsException(message);
    }

    // Persist
    const saved = await this.messagingService.saveMessage(
      payload.threadId,
      userId,
      payload.message,
      payload.attachments,
    );

    // Broadcast to thread room (sender sees it too)
    this.server.to(`thread:${payload.threadId}`).emit("new_message", saved);

    // Email notification if receiver offline >2min
    const participants = await this.messagingService.getThreadParticipants(payload.threadId);
    if (participants) {
      const receiverId =
        participants.senderId === userId
          ? participants.receiverId
          : participants.senderId;
      const receiver =
        participants.senderId === userId
          ? participants.receiver
          : participants.sender;
      const sender =
        participants.senderId === userId
          ? participants.sender
          : participants.receiver;

      const senderName = sender.displayName ?? sender.firstName ?? "Utente";

      if (!this.isOnline(receiverId)) {
        await this.notifQueue.add(
          "offline-notification",
          {
            receiverId,
            threadId: payload.threadId,
            senderName,
            receiverEmail: receiver.email,
          },
          { delay: OFFLINE_DELAY_MS, removeOnComplete: true, removeOnFail: true },
        );
      } else {
        // Deliver confirmation if online
        this.server
          .to(`user:${receiverId}`)
          .emit("message_delivered", { messageId: saved.id, threadId: payload.threadId });
      }
    }

    return { event: "message_sent", data: { messageId: saved.id } };
  }

  @SubscribeMessage("typing_start")
  handleTypingStart(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() { threadId }: { threadId: string },
  ) {
    client.to(`thread:${threadId}`).emit("user_typing", {
      userId: client.data.userId,
      threadId,
    });
  }

  @SubscribeMessage("typing_stop")
  handleTypingStop(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() { threadId }: { threadId: string },
  ) {
    client.to(`thread:${threadId}`).emit("user_stop_typing", {
      userId: client.data.userId,
      threadId,
    });
  }

  @SubscribeMessage("mark_read")
  async handleMarkRead(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() { threadId }: { threadId: string },
  ) {
    const { userId } = client.data;
    await this.messagingService.markRead(threadId, userId);
    client.to(`thread:${threadId}`).emit("message_read", {
      threadId,
      readByUserId: userId,
    });
    return { event: "marked_read", data: { threadId } };
  }
}
