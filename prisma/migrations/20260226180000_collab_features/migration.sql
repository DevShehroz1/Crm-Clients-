-- Add columns to TaskComment for threads and rich text
ALTER TABLE "TaskComment" ADD COLUMN IF NOT EXISTS "parentCommentId" TEXT;
ALTER TABLE "TaskComment" ADD COLUMN IF NOT EXISTS "bodyRichText" JSONB;
ALTER TABLE "TaskComment" ADD COLUMN IF NOT EXISTS "authorEmail" TEXT;
ALTER TABLE "TaskComment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add columns to ChannelMessage
ALTER TABLE "ChannelMessage" ADD COLUMN IF NOT EXISTS "bodyRichText" JSONB;
ALTER TABLE "ChannelMessage" ADD COLUMN IF NOT EXISTS "authorEmail" TEXT;
ALTER TABLE "ChannelMessage" ADD COLUMN IF NOT EXISTS "parentMessageId" TEXT;

-- Create Mention
CREATE TABLE IF NOT EXISTS "Mention" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "mentionedEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "TaskComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create CommentReaction
CREATE TABLE IF NOT EXISTS "CommentReaction" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "TaskComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Watcher
CREATE TABLE IF NOT EXISTS "Watcher" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watcher_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Watcher" ADD CONSTRAINT "Watcher_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorEmail" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "url" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "snoozedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Create NotificationPreference
CREATE TABLE IF NOT EXISTS "NotificationPreference" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "memberEmail" TEXT NOT NULL,
    "emailOnMention" BOOLEAN NOT NULL DEFAULT true,
    "emailOnAssignment" BOOLEAN NOT NULL DEFAULT true,
    "emailOnDueSoon" BOOLEAN NOT NULL DEFAULT true,
    "pushOnMention" BOOLEAN NOT NULL DEFAULT true,
    "digestFrequency" TEXT NOT NULL DEFAULT 'off',

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- Create ChannelUpdate
CREATE TABLE IF NOT EXISTS "ChannelUpdate" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "body" TEXT NOT NULL,
    "actorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelUpdate_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ChannelUpdate" ADD CONSTRAINT "ChannelUpdate_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
