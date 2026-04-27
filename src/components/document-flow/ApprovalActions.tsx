"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ApprovalActions({ 
  documentId, 
  userId 
}: { 
  documentId: string;
  userId: string;
}) {
  const router = useRouter();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const performAction = async (action: "approve" | "reject", comment?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/workflow", {
        method: "POST",
        body: JSON.stringify({ action, documentId, comment }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error();
      
      router.refresh();
      if (action === "reject") {
        setRejectDialogOpen(false);
        setComment("");
      }
    } catch {
      alert("Ошибка при выполнении действия");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button 
        variant="outline" 
        className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
        onClick={() => performAction("approve")}
        disabled={loading}
      >
        Одобрить
      </Button>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            disabled={loading}
          >
            Отклонить
          </Button>
        </DialogTrigger>
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
              onClick={() => performAction("reject", comment)}
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
