"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveStep, rejectStep } from "@/lib/actions/workflow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ApprovalActions({ 
  documentId, 
  userId 
}: { 
  documentId: string;
  userId: string;
}) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveStep(documentId, userId);
    } catch {
      alert("Ошибка при одобрении");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment) return;
    setLoading(true);
    try {
      await rejectStep(documentId, userId, comment);
      setRejectDialogOpen(false);
      setComment("");
    } catch {
      alert("Ошибка при отклонении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button 
        variant="outline" 
        className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
        onClick={handleApprove}
        disabled={loading}
      >
        Одобрить
      </Button>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogTrigger
          render={
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              disabled={loading}
            >
              Отклонить
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить документ</DialogTitle>
            <DialogDescription>
              Укажите причину отклонения. Документ будет возвращен на предыдущий шаг или автору.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Неверно указаны сроки..."
              required
            />
          </div>
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!comment || loading}
            >
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
