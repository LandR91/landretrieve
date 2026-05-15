import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

export const MESSAGING_QUEUE = "messaging-notifications";

interface OfflineNotificationJob {
  receiverId: string;
  threadId: string;
  senderName: string;
  receiverEmail: string;
}

@Processor(MESSAGING_QUEUE)
export class MessagingProcessor {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  @Process("offline-notification")
  async handleOfflineNotification(job: Job<OfflineNotificationJob>) {
    const { receiverId, threadId, senderName, receiverEmail } = job.data;

    // Only send email if there are still unread messages in that thread
    const unread = await this.prisma.message.count({
      where: { threadId, createdById: { not: receiverId }, isRead: false },
    });
    if (unread === 0) return;

    // Lazy-import Resend to avoid startup failure when key is not set
    const resendKey = this.config.get<string>("RESEND_API_KEY");
    if (!resendKey) return;

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const appUrl = this.config.get<string>("FRONTEND_URL", "https://landretrieve.com");
    const threadUrl = `${appUrl}/dashboard/messaggi?thread=${threadId}`;

    await resend.emails.send({
      from: "LandRetrieve <noreply@landretrieve.com>",
      to: receiverEmail,
      subject: `Hai un nuovo messaggio da ${senderName}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem">
          <h2 style="color:#111111">Hai ricevuto un messaggio</h2>
          <p style="color:#374151"><strong>${senderName}</strong> ti ha inviato un messaggio su LandRetrieve.com.</p>
          <a href="${threadUrl}" style="display:inline-block;margin-top:1rem;padding:.75rem 1.5rem;background:#26A55B;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Leggi il messaggio</a>
          <p style="margin-top:2rem;font-size:.8rem;color:#9ca3af">Ricevi questa email perché eri offline al momento dell'invio. Accedi a LandRetrieve.com per rispondere.</p>
        </div>
      `,
    });
  }
}
