-- CreateTable
CREATE TABLE `RequestComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `requestId` INTEGER NOT NULL,
    `authorId` INTEGER NOT NULL,

    INDEX `RequestComment_requestId_createdAt_id_idx`(`requestId`, `createdAt`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RequestComment` ADD CONSTRAINT `RequestComment_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `ServiceRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestComment` ADD CONSTRAINT `RequestComment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
