import db from "@/lib/db";
import { getSession } from "@/lib/actions/auth";
import { CreateDocumentDialog } from "@/components/document-flow/CreateDocumentDialog";
import { DocumentList } from "@/components/document-flow/DocumentList";
import { Document, User, WorkflowStep, Attachment } from "@prisma/client";

type DocumentWithAll = Document & {
  author: User;
  attachments: Attachment[];
  steps: (WorkflowStep & { user: User })[];
};

export default async function MyDocumentsPage() {
  const user = await getSession();
  
  // Получаем документы, где пользователь либо автор, либо участник цепочки
  const allRelatedDocs = await db.document.findMany({
    where: {
      OR: [
        { authorId: user?.id },
        {
          steps: {
            some: {
              userId: user?.id,
            }
          }
        }
      ]
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

  // Фильтруем на уровне приложения согласно бизнес-логике:
  // Документ видит автор ИЛИ текущий согласующий
  const visibleDocuments = allRelatedDocs.filter(doc => {
    // Автор видит всегда
    if (doc.authorId === user?.id) return true;
    
    // Руководитель видит только если сейчас его очередь (currentStep)
    const currentStep = doc.steps[doc.currentStep];
    return currentStep?.userId === user?.id;
  });

  const managers = await db.user.findMany({
    where: { role: "MANAGER" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Документооборот
          </h2>
          <p className="text-muted-foreground">
            Список доступных вам заявок и их текущий статус.
          </p>
        </div>
        <CreateDocumentDialog 
          authorId={user?.id || ""} 
          managers={managers} 
        />
      </div>
      
      <DocumentList 
        documents={visibleDocuments as DocumentWithAll[]} 
        currentUserId={user?.id || ""} 
      />
    </div>
  );
}
