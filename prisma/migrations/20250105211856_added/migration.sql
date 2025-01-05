-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_courseId_fkey";

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
