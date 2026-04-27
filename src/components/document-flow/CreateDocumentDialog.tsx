"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDocument } from "@/lib/actions/workflow";
import { User } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  FilePlus,
  Users,
  MessageSquare,
  Info,
  Upload,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUpload } from "./FileUpload";

export function CreateDocumentDialog({
  authorId,
  managers,
}: {
  authorId: string;
  managers: User[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [approverIds, setApproverIds] = useState<string[]>([""]);
  const [attachments, setAttachments] = useState<
    { name: string; url: string }[]
  >([]);

  const handleAddApprover = () => setApproverIds([...approverIds, ""]);
  const handleRemoveApprover = (index: number) => {
    const newIds = approverIds.filter((_, i) => i !== index);
    setApproverIds(newIds.length > 0 ? newIds : [""]);
  };
  const handleApproverChange = (index: number, value: string | null) => {
    const newIds = [...approverIds];
    newIds[index] = value || "";
    setApproverIds(newIds);
  };

  const handleFilesChange = (files: { name: string; url: string }[]) => {
    setAttachments(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validApproverIds = approverIds.filter((id) => id !== "");
    if (validApproverIds.length === 0) {
      alert("Выберите хотя бы одного согласующего");
      return;
    }

    await createDocument({
      title,
      content,
      authorId,
      approverIds: validApproverIds,
      attachments: attachments,
    });

    setOpen(false);
    setTitle("");
    setContent("");
    setApproverIds([""]);
    setAttachments([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" /> Создать документ
          </Button>
        }
      />
      <DialogContent className="min-w-4xl max-h-[90vh] flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="pb-2 p">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FilePlus className="h-6 w-6 text-blue-600" />
              Новый документ
            </DialogTitle>
            <DialogDescription>
              Заполните основные данные и настройте цепочку согласования.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 py-2 max-h-[calc(90vh-250px)]">
            <div className="space-y-6 py-4">
              <div className="space-y-4 px-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  <Info className="h-4 w-4" /> Основная информация
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Напр.: Заявление на отпуск"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Содержание документа</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Опишите суть вашего обращения..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    <Users className="h-4 w-4" /> Цепочка согласования
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={handleAddApprover}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Добавить
                  </Button>
                </div>
                <div className="space-y-3">
                  {approverIds.map((id, index) => (
                    <div key={index} className="flex gap-2 items-center group">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 flex-shrink-0">
                        {index + 1}
                      </div>

                      <Select
                        value={id}
                        onValueChange={(value) =>
                          handleApproverChange(index, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Выберите руководителя">
                            {managers.find((m) => m.id === id)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {managers.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name || "Без имени"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {approverIds.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveApprover(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    <FilePlus className="h-4 w-4" /> Приложения
                  </div>
                </div>

                <FileUpload onFilesChange={handleFilesChange} />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 bg-gray-50 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="mr-auto"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              Отправить на согласование
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
