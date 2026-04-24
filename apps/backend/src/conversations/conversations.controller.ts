import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const conversationInclude = {
  participants: {
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePic: true,
        },
      },
    },
  },
  messages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          profilePic: true,
        },
      },
    },
  },
}

// GET /api/conversations — get all conversations for logged in user
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try{
    const userId = req.user!.id

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {userId},
        },
      },

      include: conversationInclude,
      orderBy: { updatedAt: "desc" }
    })

    res.status(200).json(conversations)
  }catch(err){
    console.error("getConversations error: ", err)
    res.status(500).json({ message: 'Internal server error '})
  }
}

// POST /api/conversations/dm/:userId — get or create a DM
export const getOrCreateDM = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user!.id
    const otherUserId = req.params.userId

    if (currentUserId === otherUserId) {
      res.status(400).json({ message: "Cannot create DM with yourself" });
      return;
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: currentUserId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: conversationInclude,
    });

    if (existing) {
      res.status(200).json(existing);
      return;
    }

    // Create new DM conversation
    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: currentUserId },
            { userId: otherUserId },
          ],
        },
      },
      include: conversationInclude,
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error("getOrCreateDM error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/conversations/group — create group chat
export const createGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const { name, memberIds } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ message: "Group name must be at least 2 characters" });
      return;
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length < 2) {
      res.status(400).json({ message: "Group must have at least 2 other members" });
      return;
    }

    // Deduplicate and ensure current user is included
    const allMemberIds = [...new Set([currentUserId, ...memberIds])];

    const conversation = await prisma.conversation.create({
      data: {
        name: name.trim(),
        isGroup: true,
        adminId: currentUserId,
        participants: {
          create: allMemberIds.map((userId) => ({ userId })),
        },
      },
      include: conversationInclude,
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error("createGroup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/conversations/group/:id — update group name/icon
export const updateGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const { id } = req.params;
    const { name } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation || !conversation.isGroup) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (conversation.adminId !== currentUserId) {
      res.status(403).json({ message: "Only the group admin can update the group" });
      return;
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: { name },
      include: conversationInclude,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("updateGroup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/conversations/group/:id/members — add member
export const addGroupMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const { id } = req.params;
    const { userId } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!conversation || !conversation.isGroup) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (conversation.adminId !== currentUserId) {
      res.status(403).json({ message: "Only the group admin can add members" });
      return;
    }

    const alreadyMember = conversation.participants.some((p) => p.userId === userId);
    if (alreadyMember) {
      res.status(400).json({ message: "User is already a member" });
      return;
    }

    await prisma.conversationParticipant.create({
      data: { userId, conversationId: id },
    });

    const updated = await prisma.conversation.findUnique({
      where: { id },
      include: conversationInclude,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("addGroupMember error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/conversations/group/:id/members/:userId — remove member
export const removeGroupMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const { id, userId } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation || !conversation.isGroup) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (conversation.adminId !== currentUserId) {
      res.status(403).json({ message: "Only the group admin can remove members" });
      return;
    }

    if (userId === currentUserId) {
      res.status(400).json({ message: "Admin cannot remove themselves" });
      return;
    }

    await prisma.conversationParticipant.deleteMany({
      where: { userId, conversationId: id },
    });

    const updated = await prisma.conversation.findUnique({
      where: { id },
      include: conversationInclude,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("removeGroupMember error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/conversations/users — get all users except self (for sidebar)
export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;

    const users = await prisma.user.findMany({
      where: { id: { not: currentUserId } },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePic: true,
      },
      orderBy: { fullName: "asc" },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

