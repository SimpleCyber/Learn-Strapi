"use client"

import type React from "react"

import { useGetLists } from "@/features/todos/api/use-get-lists"
import { useGetCards } from "@/features/todos/api/use-get-cards"
import { useCreateList } from "@/features/todos/api/use-create-list"
import { useCreateCard } from "@/features/todos/api/use-create-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import type { Id } from "../../../../convex/_generated/dataModel"
import { KanbanCard } from "./kanban-card"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"

interface KanbanBoardProps {
  boardId: Id<"todoBoards">
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const { data: lists, isLoading: listsLoading } = useGetLists({ boardId })
  const { mutate: createList, isPending: creatingList } = useCreateList()
  const { mutate: createCard, isPending: creatingCard } = useCreateCard()
  const moveCard = useMutation(api.todos.moveCard)

  const [newListTitle, setNewListTitle] = useState("")
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [newCardTitles, setNewCardTitles] = useState<Record<string, string>>({})
  const [showNewCardForms, setShowNewCardForms] = useState<Record<string, boolean>>({})

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newListTitle.trim()) return

    createList(
      {
        title: newListTitle.trim(),
        boardId,
      },
      {
        onSuccess: () => {
          setNewListTitle("")
          setShowNewListForm(false)
          toast.success("List created successfully")
        },
        onError: () => {
          toast.error("Failed to create list")
        },
      },
    )
  }

  const handleCreateCard = async (listId: Id<"todoLists">) => {
    const title = newCardTitles[listId]
    if (!title?.trim()) return

    createCard(
      {
        title: title.trim(),
        listId,
        boardId,
      },
      {
        onSuccess: () => {
          setNewCardTitles((prev) => ({ ...prev, [listId]: "" }))
          setShowNewCardForms((prev) => ({ ...prev, [listId]: false }))
          toast.success("Card created successfully")
        },
        onError: () => {
          toast.error("Failed to create card")
        },
      },
    )
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    try {
      await moveCard({
        cardId: draggableId as Id<"todoCards">,
        sourceListId: source.droppableId as Id<"todoLists">,
        destinationListId: destination.droppableId as Id<"todoLists">,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      })
    } catch (error) {
      toast.error("Failed to move card")
      console.error(error)
    }
  }

  if (listsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full p-4 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {lists?.map((list) => (
            <ListColumn
              key={list._id}
              list={list}
              boardId={boardId}
              newCardTitle={newCardTitles[list._id] || ""}
              setNewCardTitle={(title) => setNewCardTitles((prev) => ({ ...prev, [list._id]: title }))}
              showNewCardForm={showNewCardForms[list._id] || false}
              setShowNewCardForm={(show) => setShowNewCardForms((prev) => ({ ...prev, [list._id]: show }))}
              onCreateCard={() => handleCreateCard(list._id)}
              creatingCard={creatingCard}
            />
          ))}

          <div className="flex-shrink-0 w-72">
            {showNewListForm ? (
              <Card className="bg-white/90">
                <CardContent className="p-3">
                  <form onSubmit={handleCreateList}>
                    <Input
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title..."
                      className="mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={creatingList || !newListTitle.trim()}>
                        {creatingList ? "Adding..." : "Add List"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNewListForm(false)
                          setNewListTitle("")
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="ghost"
                className="w-full h-12 bg-white/20 hover:bg-white/30 text-white border-dashed border-2 border-white/30"
                onClick={() => setShowNewListForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add a list
              </Button>
            )}
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}

interface ListColumnProps {
  list: any
  boardId: Id<"todoBoards">
  newCardTitle: string
  setNewCardTitle: (title: string) => void
  showNewCardForm: boolean
  setShowNewCardForm: (show: boolean) => void
  onCreateCard: () => void
  creatingCard: boolean
}

function ListColumn({
  list,
  boardId,
  newCardTitle,
  setNewCardTitle,
  showNewCardForm,
  setShowNewCardForm,
  onCreateCard,
  creatingCard,
}: ListColumnProps) {
  const { data: cards, isLoading: cardsLoading } = useGetCards({ listId: list._id })

  return (
    <div className="flex-shrink-0 w-72">
      <Card className="bg-white/90 h-full flex flex-col">
        <CardContent className="p-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{list.title}</h3>
            <span className="text-xs text-muted-foreground">{cards?.length || 0}</span>
          </div>

          <Droppable droppableId={list._id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 space-y-2 min-h-[100px] ${snapshot.isDraggingOver ? "bg-blue-50 rounded-lg" : ""}`}
              >
                {cardsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  cards?.map((card, index) => (
                    <Draggable key={card._id} draggableId={card._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? "rotate-3" : ""}
                        >
                          <KanbanCard card={card} />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="mt-3">
            {showNewCardForm ? (
              <div className="space-y-2">
                <Input
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter a title for this card..."
                  className="text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      onCreateCard()
                    }
                    if (e.key === "Escape") {
                      setShowNewCardForm(false)
                      setNewCardTitle("")
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={onCreateCard} disabled={creatingCard || !newCardTitle.trim()}>
                    {creatingCard ? "Adding..." : "Add card"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewCardForm(false)
                      setNewCardTitle("")
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:bg-gray-100"
                onClick={() => setShowNewCardForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add a card
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
