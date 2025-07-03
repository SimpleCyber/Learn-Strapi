"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Calendar, Tag, Trash2, Save, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useUpdateCard } from "@/features/todos/api/use-update-card"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"

interface CardDetailModalProps {
  card: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CardDetailModal({ card, open, onOpenChange }: CardDetailModalProps) {
  const { mutate: updateCard, isPending } = useUpdateCard()
  const deleteCard = useMutation(api.todos.deleteCard)

  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || "")
  const [dueDate, setDueDate] = useState(card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "")
  const [isCompleted, setIsCompleted] = useState(card.isCompleted)
  const [labels, setLabels] = useState<string[]>(card.labels || [])
  const [newLabel, setNewLabel] = useState("")

  useEffect(() => {
    setTitle(card.title)
    setDescription(card.description || "")
    setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "")
    setIsCompleted(card.isCompleted)
    setLabels(card.labels || [])
  }, [card])

  const handleSave = () => {
    updateCard(
      {
        cardId: card._id,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        isCompleted,
        labels,
      },
      {
        onSuccess: () => {
          toast.success("Card updated successfully")
          onOpenChange(false)
        },
        onError: () => {
          toast.error("Failed to update card")
        },
      },
    )
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this card?")) {
      try {
        await deleteCard({ cardId: card._id })
        toast.success("Card deleted successfully")
        onOpenChange(false)
      } catch (error) {
        toast.error("Failed to delete card")
      }
    }
  }

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()])
      setNewLabel("")
    }
  }

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter((label) => label !== labelToRemove))
  }

  const getLabelColor = (label: string): string => {
    const colors = [
      "#61bd4f",
      "#f2d600",
      "#ff9f1a",
      "#eb5a46",
      "#c377e0",
      "#0079bf",
      "#00c2e0",
      "#51e898",
      "#ff78cb",
      "#344563",
    ]

    let hash = 0
    for (let i = 0; i < label.length; i++) {
      hash = label.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Card title..."
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Labels */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Labels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {labels.map((label, index) => (
                <Badge
                  key={index}
                  className="text-white cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: getLabelColor(label) }}
                  onClick={() => removeLabel(label)}
                >
                  {label}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add a label..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addLabel()
                  }
                }}
              />
              <Button onClick={addLabel} size="sm" disabled={!newLabel.trim()}>
                <Tag className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              rows={4}
            />
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="dueDate" className="text-sm font-medium mb-2 block">
              Due Date
            </Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-auto"
              />
              {dueDate && (
                <Button variant="ghost" size="sm" onClick={() => setDueDate("")}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Completion Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completed"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="completed" className="text-sm">
              Mark as completed
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Card
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending || !title.trim()}>
                <Save className="w-4 h-4 mr-2" />
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
