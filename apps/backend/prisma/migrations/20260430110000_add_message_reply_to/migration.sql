-- Add reply-to support for messages (self-referential relation)
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "replyToId" TEXT;

-- AddForeignKey (only if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Message_replyToId_fkey'
    AND table_name = 'Message'
  ) THEN
    ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey"
      FOREIGN KEY ("replyToId") REFERENCES "Message"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
