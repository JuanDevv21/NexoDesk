-- CreateTable
CREATE TABLE `RequestChange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('CREATED', 'ASSIGNED', 'STATUS_CHANGED') NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `requestId` INTEGER NOT NULL,
    `actorId` INTEGER NOT NULL,

    INDEX `RequestChange_requestId_createdAt_id_idx`(`requestId`, `createdAt`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RequestChange` ADD CONSTRAINT `RequestChange_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `ServiceRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestChange` ADD CONSTRAINT `RequestChange_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
