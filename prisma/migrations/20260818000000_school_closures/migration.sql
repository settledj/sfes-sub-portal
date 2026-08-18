-- Calendar days the school is closed (holidays, breaks), with a reason label.
CREATE TABLE "school_closures" (
    "id" TEXT NOT NULL,
    "dk" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "school_closures_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "school_closures_dk_key" ON "school_closures"("dk");
