-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "statuses" TEXT NOT NULL DEFAULT 'Hit:green,Miss:red',
    CONSTRAINT "Session_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("createdAt", "id", "name", "ownerId", "shareCode", "statuses") SELECT "createdAt", "id", "name", "ownerId", "shareCode", "statuses" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_shareCode_key" ON "Session"("shareCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
