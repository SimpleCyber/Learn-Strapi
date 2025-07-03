"use client"

import { useGetBoard } from "@/features/todos/api/use-get-board"
import { KanbanBoard } from "@/features/todos/components/kanban-board"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Id } from "../../../../../convex/_generated/dataModel"

interface BoardPageProps {
  params: {
    workspaceId: Id<"workspaces">
    boardId: Id<"todoBoards">
  }
}

export default function BoardPage({ params }: BoardPageProps) {
  const router = useRouter()
  const { data: board, isLoading } = useGetBoard({ boardId: params.boardId })

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Board not found</h2>
          <p className="text-muted-foreground mb-4">The board you're looking for doesn't exist.</p>
          <Button onClick={() => router.push(`/todo/${params.workspaceId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Boards
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: board.backgroundColor || "#0079bf" }}>
      <div className="flex items-center justify-between p-4 bg-black/10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/todo/${params.workspaceId}`)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">{board.title}</h1>
            {board.description && <p className="text-white/80 text-sm">{board.description}</p>}
          </div>
        </div>

        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard boardId={params.boardId} />
      </div>
    </div>
  )
}
