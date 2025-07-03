"use client"

import { useState } from "react"
import { Calendar, Tag, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useUpdateCard } from "@/features/todos/api/use-update-card"
import { toast } from "sonner"
import { format } from "date-fns"
import type { Id } from "../../../../convex/_generated/dataModel"

interface CardDetailModalProps {
  card: {
    _id: Id<"todoCards">
    title: string
    description?: string
    listId: Id<"todoLists">
    boardId: Id<"todoBoards">
    memberId: Id<"members">
    workspaceId: Id<"workspaces">
    position: number
    dueDate?: number
    isCompleted?: boolean
    labels?: string[]
    attachments?: Id<"_storage">[]
    createdAt: number
    updatedAt: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CardDetailModal = ({ card, open, onOpenChange }: CardDetailModalProps) => {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || "")
  const [dueDate, setDueDate] = useState(card.dueDate ? format(card.dueDate, "yyyy-MM-dd") : "")
  const [newLabel, setNewLabel] = useState("")
  const [labels, setLabels] = useState(card.labels || [])

  const { mutate: updateCard, isPending } = useUpdateCard()

  const handleSave = () => {
    updateCard(
      {
        cardId: card._id,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        labels: labels.length > 0 ? labels : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Card updated successfully!")
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update card")
        },
      },
    )
  }

  const handleAddLabel = () => {
    if (!newLabel.trim() || labels.includes(newLabel.trim())) return
    setLabels([...labels, newLabel.trim()])
    setNewLabel("")
  }

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((label) => label !== labelToRemove))
  }

  const handleToggleComplete = () => {
    updateCard(
      {
        cardId: card._id,
        isCompleted: !card.isCompleted,
      },
      {
        onSuccess: () => {
          toast.success(card.isCompleted ? "Card marked as incomplete" : "Card marked as complete")
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update card")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card title..." />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={4}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {labels.map((label) => (
                <Badge key={label} variant="secondary" className="flex items-center gap-1">
                  <Tag className="size-3" />
                  {label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveLabel(label)}
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add a label..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddLabel()
                  }
                }}
              />
              <Button variant="outline" onClick={handleAddLabel} disabled={!newLabel.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant={card.isCompleted ? "outline" : "default"}
                onClick={handleToggleComplete}
                disabled={isPending}
              >
                {card.isCompleted ? "Mark Incomplete" : "Mark Complete"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending || !title.trim()}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
