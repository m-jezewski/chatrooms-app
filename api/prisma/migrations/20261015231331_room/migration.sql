-- CreateIndex
CREATE INDEX "Message_textChannelId_createdAt_idx" ON "Message"("textChannelId", "createdAt");

-- CreateIndex
CREATE INDEX "TextChannel_expiresAt_idx" ON "TextChannel"("expiresAt");
