-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_edition_fkey" FOREIGN KEY ("edition") REFERENCES "VideoEdition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_edition_fkey" FOREIGN KEY ("edition") REFERENCES "VideoEdition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
