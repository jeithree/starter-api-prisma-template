/*
  Warnings:

  - Made the column `usernameShorthand` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `usernameShorthand` VARCHAR(191) NOT NULL;
