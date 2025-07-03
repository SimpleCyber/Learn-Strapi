"use client"

import type React from "react"

import { useGetBoards } from "@/features/todos/api/use-get-boards"
import { useCreateBoard } from "@/features/todos/api/use-create-board"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, CheckSquare } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Id } from "../../../../convex/_generated/dataModel"
import { toast } from "sonner"

interface TodoPageProps {
  params: {
    workspaceId: Id<"workspaces">
  }
}

export default function TodoPage({ params }: TodoPageProps) {
  const router = useRouter()
  const { data: boards, isLoading } = useGetBoards({ workspaceId: params.workspaceId })
  const { mutate: createBoard, isPending } = useCreateBoard()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("#0079bf")

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Board title is required")
      return
    }

    createBoard(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        workspaceId: params.workspaceId,
        backgroundColor,
      },
      {
        onSuccess: (boardId) => {
          toast.success("Board created successfully")
          setIsDialogOpen(false)
          setTitle("")
          setDescription("")
          setBackgroundColor("#0079bf")
          if (boardId) {
            router.push(`/todo/${params.workspaceId}/board/${boardId}`)
          }
        },
        onError: (error) => {
          toast.error("Failed to create board")
          console.error(error)
        },
      },
    )
  }

  const backgroundColors = [
    "#0079bf",
    "#d29034",
    "#519839",
    "#b04632",
    "#89609e",
    "#cd5a91",
    "#4bbf6b",
    "#00aecc",
    "#838c91",
  ]

  if (isLoading) {
    return (
      <div className="h-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Boards</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Boards</h1>
          <p className="text-muted-foreground">Organize your tasks with Kanban boards</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Board
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <Label htmlFor="title">Board Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter board title..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this board about?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2 mt-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded border-2 ${
                        backgroundColor === color ? "border-white shadow-lg" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBackgroundColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Board"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {boards?.map((board) => (
          <Card
            key={board._id}
            className="h-32 cursor-pointer hover:shadow-lg transition-shadow group"
            style={{ backgroundColor: board.backgroundColor || "#0079bf" }}
            onClick={() => router.push(`/todo/${params.workspaceId}/board/${board._id}`)}
          >
            <CardContent className="p-4 h-full flex flex-col justify-between text-white">
              <div>
                <h3 className="font-semibold text-lg mb-1 group-hover:underline">{board.title}</h3>
                {board.description && <p className="text-sm opacity-90 line-clamp-2">{board.description}</p>}
              </div>
              <div className="flex items-center gap-4 text-xs opacity-75">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(board.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {boards?.length === 0 && (
          <Card className="h-32 border-dashed border-2 flex items-center justify-center col-span-full">
            <div className="text-center text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">No boards yet</p>
              <p className="text-sm">Create your first board to get started</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
