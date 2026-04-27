import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, documentId, comment, title, content, approverIds, attachments } = body;

  try {
    if (action === "create") {
      const doc = await db.document.create({
        data: {
          title, content, authorId: userId, status: "IN_PROGRESS",
          steps: { create: approverIds.map((u: string, i: number) => ({ userId: u, order: i, status: "PENDING" })) },
          attachments: { create: attachments || [] },
        },
      });
      return NextResponse.json(doc);
    }

    if (action === "approve" || action === "reject") {
      const doc = await db.document.findUnique({ where: { id: documentId }, include: { steps: { orderBy: { order: "asc" } } }});
      if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const currentStep = doc.steps[doc.currentStep];
      if (currentStep.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      if (action === "approve") {
        const isLastStep = doc.currentStep === doc.steps.length - 1;
        await db.$transaction([
          db.workflowStep.update({ where: { id: currentStep.id }, data: { status: "APPROVED", completedAt: new Date() } }),
          db.document.update({ where: { id: documentId }, data: { status: isLastStep ? "COMPLETED" : "IN_PROGRESS", currentStep: isLastStep ? doc.currentStep : doc.currentStep + 1 } })
        ]);
      } else {
        // Reject logic
        if (doc.currentStep === 0) {
           await db.$transaction([
            db.workflowStep.update({ where: { id: currentStep.id }, data: { status: "REJECTED", comment, completedAt: new Date() } }),
            db.document.update({ where: { id: documentId }, data: { status: "REJECTED" } })
          ]);
        } else {
          await db.$transaction([
            db.workflowStep.update({ where: { id: currentStep.id }, data: { status: "REJECTED", comment, completedAt: new Date() } }),
            db.document.update({ where: { id: documentId }, data: { currentStep: doc.currentStep - 1 } }),
            db.workflowStep.update({ where: { id: doc.steps[doc.currentStep - 1].id }, data: { status: "PENDING" } })
          ]);
        }
      }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
