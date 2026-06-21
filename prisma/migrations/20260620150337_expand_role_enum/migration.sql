-- Custom migration: rename STUDENT to COLABORADOR and add new role values
-- PostgreSQL supports ALTER TYPE ... RENAME VALUE since v10

-- Step 1: Rename existing STUDENT value to COLABORADOR
ALTER TYPE "Role" RENAME VALUE 'STUDENT' TO 'COLABORADOR';

-- Step 2: Add new role values
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERVISAO';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GERENTE';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GESTAO';

-- Step 3: Update default (handled by Prisma schema update)
-- The default is changed in schema.prisma from STUDENT to COLABORADOR
-- Existing rows with role='STUDENT' are now automatically 'COLABORADOR'
-- due to the rename above

-- Step 4: Update PlatformConfig default string (no DB change needed, handled in schema)
ALTER TABLE "PlatformConfig" ALTER COLUMN "platformName" SET DEFAULT 'Universo Mil';
