"use client"

import { useState } from "react"
import { Calendar, MessageSquare, Paperclip, CheckSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CardDetailModal } from "./card-detail-modal"
import { format } from "date-fns"
import type { Id } from "../../../../convex/_generated/dataModel"

interface KanbanCardProps {
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
}

const labelColors = [
  "bg-red-100 text-red-800",
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
]

export const KanbanCard = ({ card }: KanbanCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isDueSoon = card.dueDate && card.dueDate < Date.now() + 24 * 60 * 60 * 1000
  const isOverdue = card.dueDate && card.dueDate < Date.now()

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white" onClick={() => setIsModalOpen(true)}>
        <CardContent className="p-3 space-y-2">
          

          {/* Title */}
          <h4 className="text-sm font-medium leading-tight">{card.title}</h4>

          {/* Description preview */}
          {card.description && <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>}

          {/* Due date */}
          {card.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />
              <span
                className={`text-xs ${
                  isOverdue
                    ? "text-red-600 font-medium"
                    : isDueSoon
                      ? "text-yellow-600 font-medium"
                      : "text-muted-foreground"
                }`}
              >
                {format(card.dueDate, "MMM d")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.labels.slice(0, 3).map((label, index) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className={`text-xs px-2 py-0.5 ${labelColors[index % labelColors.length]}`}
                >
                  {label}
                </Badge>
              ))}
              {card.labels.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{card.labels.length - 3}
                </Badge>
              )}
            </div>
          )}
            {card.isCompleted && <CheckSquare className="size-4 text-green-600" />}
          </div>
        </CardContent>
      </Card>

      <CardDetailModal card={card} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
