-- Add slug and logo to Team
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "logo" TEXT;
UPDATE "Team" SET "slug" = LOWER(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g')) WHERE "slug" IS NULL;
UPDATE "Team" SET "slug" = "id" WHERE "slug" IS NULL OR "slug" = '' OR "slug" = '-';
CREATE UNIQUE INDEX IF NOT EXISTS "Team_slug_key" ON "Team"("slug");

-- Add role and status to TeamMember
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'MEMBER';
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE';

-- Add columns to Channel
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "isPrivate" BOOLEAN DEFAULT false;
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "parentId" TEXT;

-- Add columns to Task
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "channelId" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "shortCode" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "assigneeId" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "reporterId" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "dueTime" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "estimate" INTEGER;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "timeTracked" INTEGER DEFAULT 0;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "points" INTEGER;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "orderIndex" INTEGER DEFAULT 0;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "boardColumnId" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "customFields" JSONB;
UPDATE "Task" t SET "channelId" = (SELECT c.id FROM "Channel" c WHERE c."teamId" = t."teamId" LIMIT 1) WHERE t."channelId" IS NULL;
DO $$ BEGIN
  ALTER TABLE "Task" ADD CONSTRAINT "Task_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add type and size to TaskAttachment
ALTER TABLE "TaskAttachment" ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'file';
ALTER TABLE "TaskAttachment" ADD COLUMN IF NOT EXISTS "size" INTEGER;

-- Create ChannelStatus
CREATE TABLE IF NOT EXISTS "ChannelStatus" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChannelStatus_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ChannelStatus" ADD CONSTRAINT "ChannelStatus_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Subtask
CREATE TABLE IF NOT EXISTS "Subtask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "assigneeId" TEXT,
    "dueDate" TIMESTAMP(3),
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create TaskDependency
CREATE TABLE IF NOT EXISTS "TaskDependency" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnTaskId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_dependsOnTaskId_fkey" FOREIGN KEY ("dependsOnTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create ActivityLog
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- Create ChannelTemplate
CREATE TABLE IF NOT EXISTS "ChannelTemplate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "channelData" JSONB,
    "tasks" JSONB,

    CONSTRAINT "ChannelTemplate_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ChannelTemplate" ADD CONSTRAINT "ChannelTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create TaskTemplate
CREATE TABLE IF NOT EXISTS "TaskTemplate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "channelId" TEXT,
    "name" TEXT NOT NULL,
    "taskData" JSONB,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create TaskRecurrence
CREATE TABLE IF NOT EXISTS "TaskRecurrence" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "onComplete" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" TIMESTAMP(3),

    CONSTRAINT "TaskRecurrence_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TaskRecurrence_taskId_key" ON "TaskRecurrence"("taskId");
ALTER TABLE "TaskRecurrence" ADD CONSTRAINT "TaskRecurrence_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
