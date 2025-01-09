-- CreateTable
CREATE TABLE "_UserOptionalItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserOptionalItems_AB_unique" ON "_UserOptionalItems"("A", "B");
CREATE INDEX "_UserOptionalItems_B_index" ON "_UserOptionalItems"("B");

-- Copy existing relationships to the new join table
INSERT INTO "_UserOptionalItems" ("A", "B")
SELECT "id", "pesertaId"
FROM "OptionalItem";

-- AddForeignKey
ALTER TABLE "_UserOptionalItems" ADD CONSTRAINT "_UserOptionalItems_A_fkey" FOREIGN KEY ("A") REFERENCES "OptionalItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_UserOptionalItems" ADD CONSTRAINT "_UserOptionalItems_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Now it's safe to remove the old column
ALTER TABLE "OptionalItem" DROP COLUMN "pesertaId";
