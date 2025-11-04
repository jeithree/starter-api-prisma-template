/*
  Warnings:

  - You are about to alter the column `gender` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `gender` ENUM('MALE', 'FEMALE') NULL;
