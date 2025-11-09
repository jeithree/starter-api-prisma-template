/*
  Warnings:

  - You are about to drop the `RecoverPassword` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `RecoverPassword` DROP FOREIGN KEY `RecoverPassword_userId_fkey`;

-- DropTable
DROP TABLE `RecoverPassword`;

-- CreateTable
CREATE TABLE `ResetPassword` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `resetPasswordToken` VARCHAR(191) NULL,
    `resetPasswordTokenExpiresAt` DATETIME(3) NULL,

    UNIQUE INDEX `ResetPassword_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ResetPassword` ADD CONSTRAINT `ResetPassword_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
