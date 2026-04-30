-- Add soft-delete support to messages
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
