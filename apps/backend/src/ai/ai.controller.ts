import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateWithFallback } from "../config/gemini";

export const summariseConversation = async(req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params
    const userId = req.user!.id

    //how many messages to include in the summary
    const limit = Math.min(
      parseInt(req.query.limit as string) || 50, 100
    )

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: { userId, conversationId }
      }
    })

    if(!participant){
      res.status(404).json({message: "You are not a participant of this conversation"})
      return
    }

    //fetch recent messages with sender names
    const messages = await prisma.message.findMany({
      where: {
        conversationId
      },
      include: {
        sender: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: "asc"},
      take: limit
    })

    if(messages.length === 0){
      res.status(404).json({message: "No messages to summarise"})
      return
    }

    // Reverse so oldest is first (natural reading order)
    const ordered = messages.reverse();

    // Get conversation info
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { name: true, isGroup: true },
    });

    // build transcript for gemini
    const transcript = ordered
    .map((msg) => {
      const time = new Date(msg.createdAt).toLocaleTimeString([],{
        hour: "2-digit",
        minute: "2-digit"
      });
      const content = msg.image && !msg.text? 
      "[sent an image]" 
      : msg.image && msg.text
      ? `${msg.text} [+image]`
      : msg.text || ""

      return `[${time}] ${msg.sender.fullName}: ${content}`;
    })
    .join("\n")

    const conversationLabel = conversation?.isGroup
    ? `group chat named "${conversation.name}"`
    : "private conversation";

    const prompt = `
    You are summarizing a ${conversationLabel} for a user who wants to catch up quickly.

    Here are the last ${ordered.length} messages:

    ${transcript}

    Please provide:
    1. A brief 2-3 sentence overview of what was discussed
    2. Key decisions or action items (if any)
    3. The overall mood/tone of the conversation

    Keep the summary concise, friendly, and easy to read.
    Format it with clear sections using simple headings like "Overview:", "Key Points:", "Mood:".
    Do not include any preamble — start directly with the summary.
    `.trim();

    const summary = await generateWithFallback(prompt);

    res.status(200).json({
      summary,
      messageCount: ordered.length,
      from: ordered[0].createdAt,
      to: ordered[ordered.length - 1].createdAt,
    });
  } catch (error: any) {
    console.error("summarise Conversation error:", error);
    const status = error?.status ?? error?.statusCode;
    if (status === 503 || status === 429) {
      res.status(503).json({
        message: "The AI service is currently overloaded. Please try again in a few moments."
      });
      return;
    }
    res.status(500).json({ message: "Failed to generate summary" });
  }
}