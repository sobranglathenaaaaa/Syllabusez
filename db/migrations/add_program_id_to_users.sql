ALTER TABLE `users`
  ADD COLUMN `program_id` VARCHAR(36) DEFAULT NULL COMMENT 'Reference to programs.id';

ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_program`
    FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
