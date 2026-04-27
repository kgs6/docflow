import db from "@/lib/db";
import { getSession } from "@/lib/actions/auth";
import { DocumentList } from "@/components/document-flow/DocumentList";
import { redirect } from "next/navigation";

export default async function InboxPage() {
  const user = await getSession();

  if (!user || user.role !== "MANAGER") {
    redirect("/my-documents");
  }

  // Находим документы, где пользователь есть в шагах и статус PENDING
  const allRelatedDocs = await db.document.findMany({
    where: {
      status: "IN_PROGRESS",
      steps: {
        some: {
          userId: user.id,
          status: "PENDING",
        }
      }
    },
    include: {
      author: true,
      attachments: true,
      steps: {
        include: {
          user: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const inboxDocuments = allRelatedDocs.filter(doc => {
    const currentStep = doc.steps[doc.currentStep];
    return currentStep && currentStep.userId === user.id && currentStep.status === "PENDING";
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Входящие</h2>
        <p className="text-muted-foreground">
          Документы, ожидающие вашей подписи.
        </p>
      </div>
      
      <DocumentList 
        documents={inboxDocuments} 
        currentUserId={user.id} 
        type="inbox"
      />
    </div>
  );
}
