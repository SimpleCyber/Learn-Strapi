"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Plus, X, MoreHorizontal, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useCreateList } from "@/features/todos/api/use-create-list"
import { useCreateCard } from "@/features/todos/api/use-create-card"
import { useUpdateCard } from "@/features/todos/api/use-update-card"
import { KanbanCard } from "./kanban-card"
import { useGetCards } from "@/features/todos/api/use-get-cards"
import { toast } from "sonner"
import type { Id } from "../../../../convex/_generated/dataModel"

interface KanbanBoardProps {
  boardId: Id<"todoBoards">
  lists: Array<{
    _id: Id<"todoLists">
    name: string
    position: number
    boardId: Id<"todoBoards">
    memberId: Id<"members">
    workspaceId: Id<"workspaces">
    createdAt: number
    updatedAt: number
  }>
}

export const KanbanBoard = ({ boardId, lists }: KanbanBoardProps) => {
  const [isAddingList, setIsAddingList] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [addingCardToList, setAddingCardToList] = useState<Id<"todoLists"> | null>(null)
  const [newCardTitle, setNewCardTitle] = useState("")

  const { mutate: createList, isPending: isCreatingList } = useCreateList()
  const { mutate: createCard, isPending: isCreatingCard } = useCreateCard()
  const { mutate: updateCard } = useUpdateCard()

  const handleCreateList = () => {
    if (!newListName.trim()) return

    createList(
      {
        name: newListName.trim(),
        boardId,
      },
      {
        onSuccess: () => {
          setNewListName("")
          setIsAddingList(false)
          toast.success("List created successfully!")
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create list")
        },
      },
    )
  }

  const handleCreateCard = (listId: Id<"todoLists">) => {
    if (!newCardTitle.trim()) return

    createCard(
      {
        title: newCardTitle.trim(),
        listId,
      },
      {
        onSuccess: () => {
          setNewCardTitle("")
          setAddingCardToList(null)
          toast.success("Card created successfully!")
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create card")
        },
      },
    )
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // Handle card movement between lists
    if (source.droppableId !== destination.droppableId) {
      const cardId = draggableId as Id<"todoCards">
      const newListId = destination.droppableId as Id<"todoLists">

      updateCard(
        {
          cardId,
          listId: newListId,
          position: destination.index,
        },
        {
          onError: (error) => {
            toast.error(error.message || "Failed to move card")
          },
        },
      )
    }
  }

  const sortedLists = [...lists].sort((a, b) => a.position - b.position)

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 p-4 overflow-x-auto">
        {sortedLists.map((list) => (
          <KanbanList
            key={list._id}
            list={list}
            isAddingCard={addingCardToList === list._id}
            newCardTitle={newCardTitle}
            setNewCardTitle={setNewCardTitle}
            onAddCard={() => setAddingCardToList(list._id)}
            onCancelAddCard={() => setAddingCardToList(null)}
            onCreateCard={() => handleCreateCard(list._id)}
            isCreatingCard={isCreatingCard}
          />
        ))}

        {/* Add List Column */}
        <div className="flex-shrink-0 w-72">
          {isAddingList ? (
            <Card>
              <CardContent className="p-3">
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list title..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateList()
                    } else if (e.key === "Escape") {
                      setIsAddingList(false)
                      setNewListName("")
                    }
                  }}
                  autoFocus
                  disabled={isCreatingList}
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={handleCreateList} disabled={!newListName.trim() || isCreatingList}>
                    Add List
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingList(false)
                      setNewListName("")
                    }}
                    disabled={isCreatingList}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="ghost"
              className="w-full h-12 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
              onClick={() => setIsAddingList(true)}
            >
              <Plus className="size-4 mr-2" />
              Add a list
            </Button>
          )}
        </div>
      </div>
    </DragDropContext>
  )
}

interface KanbanListProps {
  list: {
    _id: Id<"todoLists">
    name: string
    position: number
    boardId: Id<"todoBoards">
    memberId: Id<"members">
    workspaceId: Id<"workspaces">
    createdAt: number
    updatedAt: number
  }
  isAddingCard: boolean
  newCardTitle: string
  setNewCardTitle: (title: string) => void
  onAddCard: () => void
  onCancelAddCard: () => void
  onCreateCard: () => void
  isCreatingCard: boolean
}

const KanbanList = ({
  list,
  isAddingCard,
  newCardTitle,
  setNewCardTitle,
  onAddCard,
  onCancelAddCard,
  onCreateCard,
  isCreatingCard,
}: KanbanListProps) => {
  const { data: cards, isLoading } = useGetCards({ listId: list._id })

  const sortedCards = cards ? [...cards].sort((a, b) => a.position - b.position) : []

  return (
    <div className="flex-shrink-0 w-72">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{list.name}</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <Droppable droppableId={list._id}>
          {(provided, snapshot) => (
            <CardContent
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-2 min-h-[100px] ${snapshot.isDraggingOver ? "bg-muted/50" : ""}`}
            >
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader className="size-4 animate-spin" />
                </div>
              ) : (
                sortedCards.map((card, index) => (
                  <Draggable key={card._id} draggableId={card._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? "rotate-2" : ""}
                      >
                        <KanbanCard card={card} />
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}

              {isAddingCard ? (
                <div className="space-y-2">
                  <Input
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="Enter a title for this card..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onCreateCard()
                      } else if (e.key === "Escape") {
                        onCancelAddCard()
                      }
                    }}
                    autoFocus
                    disabled={isCreatingCard}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={onCreateCard} disabled={!newCardTitle.trim() || isCreatingCard}>
                      Add card
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onCancelAddCard} disabled={isCreatingCard}>
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={onAddCard}
                >
                  <Plus className="size-4 mr-2" />
                  Add a card
                </Button>
              )}
            </CardContent>
          )}
        </Droppable>
      </Card>
    </div>
  )
}
