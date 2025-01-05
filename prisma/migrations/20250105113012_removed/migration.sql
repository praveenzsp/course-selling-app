/*
  Warnings:

  - You are about to drop the `CourseContent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `courseId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseContent" DROP CONSTRAINT "CourseContent_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_courseContentId_fkey";

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "courseId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "CourseContent";

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
