"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckSquare } from "lucide-react"
import { useState } from "react"
import { CardDetailModal } from "./card-detail-modal"

interface KanbanCardProps {
  card: any
}

export function KanbanCard({ card }: KanbanCardProps) {
  const [showModal, setShowModal] = useState(false)

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()
  const isDueSoon =
    card.dueDate &&
    new Date(card.dueDate) > new Date() &&
    new Date(card.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000)

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white" onClick={() => setShowModal(true)}>
        <CardContent className="p-3">
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0"
                  style={{
                    backgroundColor: getLabelColor(label),
                    color: "white",
                  }}
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}

          <h4 className="text-sm font-medium mb-2 line-clamp-3">{card.title}</h4>

          {card.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{card.description}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {card.dueDate && (
                <div
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                    isOverdue
                      ? "bg-red-100 text-red-700"
                      : isDueSoon
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {new Date(card.dueDate).toLocaleDateString()}
                </div>
              )}

              {card.isCompleted && (
                <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                  <CheckSquare className="w-3 h-3" />
                  Done
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* You can add more icons here for attachments, comments, etc. */}
            </div>
          </div>
        </CardContent>
      </Card>

      <CardDetailModal card={card} open={showModal} onOpenChange={setShowModal} />
    </>
  )
}

function getLabelColor(label: string): string {
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
