"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Document, User, WorkflowStep, Attachment } from "@prisma/client";
import {
  FileIcon,
  Clock,
  CheckCircle2,
  XCircle,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DocumentWithAll = Document & {
  author: User;
  attachments: Attachment[];
  steps: (WorkflowStep & { user: User })[];
};

export function DocumentDetailDialog({
  document,
  children,
  open,
  onOpenChange,
}: {
  document: DocumentWithAll;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Завершено</Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">Отклонено</Badge>;
      case "IN_PROGRESS":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            В работе
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger>
          {typeof children === "string" ? (
            <button>{children}</button>
          ) : (
            children
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-150 max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl font-bold">
              {document.title}
            </DialogTitle>
            {getStatusBadge(document.status)}
          </div>
          <DialogDescription className="flex items-center gap-2">
            <UserIcon className="h-3 w-3" />
            Автор: {document.author.name} •{" "}
            {new Date(document.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Separator className="mt-4" />

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Содержание
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {document.content || "Содержание отсутствует"}
              </div>
            </section>

            {document.attachments.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Прикрепленные файлы
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {document.attachments.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 transition-colors group"
                    >
                      <FileIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium truncate group-hover:text-blue-600">
                        {file.name}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                История согласования
              </h4>
              <div className="space-y-4">
                {document.steps.map((step, index) => {
                  const isActive =
                    document.currentStep === index &&
                    document.status === "IN_PROGRESS";
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "relative flex gap-4 pl-2",
                        isActive &&
                          "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500 before:rounded-full",
                      )}
                    >
                      <div className="mt-0.5">{getStepIcon(step.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {step.user.name}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {step.completedAt
                              ? new Date(step.completedAt).toLocaleString()
                              : "Ожидает"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          Шаг {index + 1}
                        </p>
                        {step.comment && (
                          <div className="mt-2 bg-red-50 border border-red-100 rounded p-2 text-xs text-red-800">
                            <strong>Комментарий:</strong> {step.comment}
                          </div>
                        )}
                        {step.status === "APPROVED" && (
                          <p className="text-[11px] text-green-600 font-medium">
                            Одобрено
                          </p>
                        )}
                        {isActive && (
                          <p className="text-[11px] text-blue-600 font-bold animate-pulse">
                            На подписи сейчас
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
