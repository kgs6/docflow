"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createDocument(formData: {
  title: string;
  content?: string;
  authorId: string;
  approverIds: string[];
  attachments?: { name: string; url: string }[];
}) {
  const { title, content, authorId, approverIds, attachments = [] } = formData;

  const document = await db.document.create({
    data: {
      title,
      content,
      authorId,
      status: "IN_PROGRESS",
      steps: {
        create: approverIds.map((userId, index) => ({
          userId,
          order: index,
          status: "PENDING",
        })),
      },
      attachments: {
        create: attachments,
      },
    },
  });

  revalidatePath("/my-documents");
  revalidatePath("/inbox");
  return document;
}

export async function approveStep(documentId: string, userId: string) {
  const doc = await db.document.findUnique({
    where: { id: documentId },
    include: {
      steps: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!doc) throw new Error("Document not found");

  const currentStep = doc.steps[doc.currentStep];

  if (currentStep.userId !== userId) {
    throw new Error("You are not the current approver");
  }

  const isLastStep = doc.currentStep === doc.steps.length - 1;

  await db.$transaction([
    db.workflowStep.update({
      where: { id: currentStep.id },
      data: {
        status: "APPROVED",
        completedAt: new Date(),
      },
    }),
    db.document.update({
      where: { id: documentId },
      data: {
        status: isLastStep ? "COMPLETED" : "IN_PROGRESS",
        currentStep: isLastStep ? doc.currentStep : doc.currentStep + 1,
      },
    }),
  ]);

  revalidatePath("/inbox");
  revalidatePath("/my-documents");
}

export async function rejectStep(documentId: string, userId: string, comment: string) {
  const doc = await db.document.findUnique({
    where: { id: documentId },
    include: {
      steps: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!doc) throw new Error("Document not found");

  const currentStepIndex = doc.currentStep;
  const currentStep = doc.steps[currentStepIndex];

  if (currentStep.userId !== userId) {
    throw new Error("You are not the current approver");
  }

  if (currentStepIndex === 0) {
    await db.$transaction([
      db.workflowStep.update({
        where: { id: currentStep.id },
        data: {
          status: "REJECTED",
          comment,
          completedAt: new Date(),
        },
      }),
      db.document.update({
        where: { id: documentId },
        data: {
          status: "REJECTED",
        },
      }),
    ]);
  } else {
    await db.$transaction([
      db.workflowStep.update({
        where: { id: currentStep.id },
        data: {
          status: "REJECTED",
          comment,
          completedAt: new Date(),
        },
      }),
      db.document.update({
        where: { id: documentId },
        data: {
          currentStep: currentStepIndex - 1,
        },
      }),
      db.workflowStep.update({
        where: { id: doc.steps[currentStepIndex - 1].id },
        data: {
          status: "PENDING",
        },
      }),
    ]);
  }

  revalidatePath("/inbox");
  revalidatePath("/my-documents");
}
