"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Document, User, WorkflowStep, Attachment } from "@prisma/client";
import { ApprovalActions } from "./ApprovalActions";
import { DocumentDetailDialog } from "./DocumentDetailDialog";
import { FileText, ChevronRight } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

type DocumentWithAll = Document & {
  author: User;
  attachments: Attachment[];
  steps: (WorkflowStep & { user: User })[];
};

export function DocumentList({ 
  documents, 
  currentUserId,
  type = "all"
}: { 
  documents: DocumentWithAll[];
  currentUserId: string;
  type?: "all" | "inbox";
}) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithAll | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Завершено</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Отклонено</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">В работе</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">Документ</TableHead>
            <TableHead>Автор</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Текущий шаг</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-gray-400 italic">
                Список пуст
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => {
              const currentStep = doc.steps[doc.currentStep];
              return (
                <TableRow 
                  key={doc.id} 
                  className="group cursor-pointer hover:bg-blue-50/40 transition-colors"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-gray-900 line-clamp-1">{doc.title}</span>
                        {doc.attachments.length > 0 && (
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                            Файлов: {doc.attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {doc.author.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-600">{doc.author.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell>
                    {currentStep ? (
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-xs font-bold text-gray-900">
                          {currentStep.user.name}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                          Шаг {doc.currentStep + 1} из {doc.steps.length}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {/* {new Date(doc.createdAt).toLocaleDateString()} */}
                      {format(new Date(doc.createdAt), "dd MMM yyyy", { locale: uk })} {/* Используем форматирование даты */}
                    </span>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {type === "inbox" && (
                        <ApprovalActions 
                          documentId={doc.id} 
                          userId={currentUserId} 
                        />
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {selectedDoc && (
        <DocumentDetailDialog 
          document={selectedDoc} 
          open={!!selectedDoc} 
          onOpenChange={(open) => !open && setSelectedDoc(null)} 
        />
      )}
    </div>
  );
}
