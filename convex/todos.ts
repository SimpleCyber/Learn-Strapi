import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"

// Board operations
export const createBoard = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
    backgroundColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const boardId = await ctx.db.insert("todoBoards", {
      title: args.title,
      description: args.description,
      userId,
      workspaceId: args.workspaceId,
      backgroundColor: args.backgroundColor,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return boardId
  },
})

export const getBoards = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    const boards = await ctx.db
      .query("todoBoards")
      .withIndex("by_user_workspace", (q) => q.eq("userId", userId).eq("workspaceId", args.workspaceId))
      .collect()

    return boards
  },
})

export const getBoard = query({
  args: {
    boardId: v.id("todoBoards"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const board = await ctx.db.get(args.boardId)
    if (!board || board.userId !== userId) {
      return null
    }

    return board
  },
})

export const updateBoard = mutation({
  args: {
    boardId: v.id("todoBoards"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const board = await ctx.db.get(args.boardId)
    if (!board || board.userId !== userId) {
      throw new Error("Board not found or unauthorized")
    }

    const updates: any = { updatedAt: Date.now() }
    if (args.title !== undefined) updates.title = args.title
    if (args.description !== undefined) updates.description = args.description
    if (args.backgroundColor !== undefined) updates.backgroundColor = args.backgroundColor

    await ctx.db.patch(args.boardId, updates)
  },
})

export const deleteBoard = mutation({
  args: {
    boardId: v.id("todoBoards"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const board = await ctx.db.get(args.boardId)
    if (!board || board.userId !== userId) {
      throw new Error("Board not found or unauthorized")
    }

    // Delete all cards in the board
    const cards = await ctx.db
      .query("todoCards")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect()

    for (const card of cards) {
      await ctx.db.delete(card._id)
    }

    // Delete all lists in the board
    const lists = await ctx.db
      .query("todoLists")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect()

    for (const list of lists) {
      await ctx.db.delete(list._id)
    }

    // Delete the board
    await ctx.db.delete(args.boardId)
  },
})

// List operations
export const createList = mutation({
  args: {
    title: v.string(),
    boardId: v.id("todoBoards"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const board = await ctx.db.get(args.boardId)
    if (!board || board.userId !== userId) {
      throw new Error("Board not found or unauthorized")
    }

    // Get the highest position
    const lists = await ctx.db
      .query("todoLists")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect()

    const maxPosition = Math.max(...lists.map((l) => l.position), -1)

    const listId = await ctx.db.insert("todoLists", {
      title: args.title,
      boardId: args.boardId,
      userId,
      position: maxPosition + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return listId
  },
})

export const getLists = query({
  args: {
    boardId: v.id("todoBoards"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    const board = await ctx.db.get(args.boardId)
    if (!board || board.userId !== userId) {
      return []
    }

    const lists = await ctx.db
      .query("todoLists")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect()

    return lists.sort((a, b) => a.position - b.position)
  },
})

export const updateList = mutation({
  args: {
    listId: v.id("todoLists"),
    title: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const list = await ctx.db.get(args.listId)
    if (!list || list.userId !== userId) {
      throw new Error("List not found or unauthorized")
    }

    const updates: any = { updatedAt: Date.now() }
    if (args.title !== undefined) updates.title = args.title
    if (args.position !== undefined) updates.position = args.position

    await ctx.db.patch(args.listId, updates)
  },
})

export const deleteList = mutation({
  args: {
    listId: v.id("todoLists"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const list = await ctx.db.get(args.listId)
    if (!list || list.userId !== userId) {
      throw new Error("List not found or unauthorized")
    }

    // Delete all cards in the list
    const cards = await ctx.db
      .query("todoCards")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect()

    for (const card of cards) {
      await ctx.db.delete(card._id)
    }

    // Delete the list
    await ctx.db.delete(args.listId)
  },
})

// Card operations
export const createCard = mutation({
  args: {
    title: v.string(),
    listId: v.id("todoLists"),
    boardId: v.id("todoBoards"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const list = await ctx.db.get(args.listId)
    if (!list || list.userId !== userId) {
      throw new Error("List not found or unauthorized")
    }

    // Get the highest position in the list
    const cards = await ctx.db
      .query("todoCards")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect()

    const maxPosition = Math.max(...cards.map((c) => c.position), -1)

    const cardId = await ctx.db.insert("todoCards", {
      title: args.title,
      description: args.description,
      listId: args.listId,
      boardId: args.boardId,
      userId,
      position: maxPosition + 1,
      dueDate: undefined,
      isCompleted: false,
      labels: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return cardId
  },
})

export const getCards = query({
  args: {
    listId: v.id("todoLists"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    const list = await ctx.db.get(args.listId)
    if (!list || list.userId !== userId) {
      return []
    }

    const cards = await ctx.db
      .query("todoCards")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect()

    return cards.sort((a, b) => a.position - b.position)
  },
})

export const getCard = query({
  args: {
    cardId: v.id("todoCards"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const card = await ctx.db.get(args.cardId)
    if (!card || card.userId !== userId) {
      return null
    }

    return card
  },
})

export const updateCard = mutation({
  args: {
    cardId: v.id("todoCards"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    isCompleted: v.optional(v.boolean()),
    labels: v.optional(v.array(v.string())),
    listId: v.optional(v.id("todoLists")),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const card = await ctx.db.get(args.cardId)
    if (!card || card.userId !== userId) {
      throw new Error("Card not found or unauthorized")
    }

    const updates: any = { updatedAt: Date.now() }
    if (args.title !== undefined) updates.title = args.title
    if (args.description !== undefined) updates.description = args.description
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate
    if (args.isCompleted !== undefined) updates.isCompleted = args.isCompleted
    if (args.labels !== undefined) updates.labels = args.labels
    if (args.listId !== undefined) updates.listId = args.listId
    if (args.position !== undefined) updates.position = args.position

    await ctx.db.patch(args.cardId, updates)
  },
})

export const deleteCard = mutation({
  args: {
    cardId: v.id("todoCards"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const card = await ctx.db.get(args.cardId)
    if (!card || card.userId !== userId) {
      throw new Error("Card not found or unauthorized")
    }

    await ctx.db.delete(args.cardId)
  },
})

export const moveCard = mutation({
  args: {
    cardId: v.id("todoCards"),
    sourceListId: v.id("todoLists"),
    destinationListId: v.id("todoLists"),
    sourceIndex: v.number(),
    destinationIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const card = await ctx.db.get(args.cardId)
    if (!card || card.userId !== userId) {
      throw new Error("Card not found or unauthorized")
    }

    // Update the card's list and position
    await ctx.db.patch(args.cardId, {
      listId: args.destinationListId,
      position: args.destinationIndex,
      updatedAt: Date.now(),
    })

    // Update positions of other cards in source list
    if (args.sourceListId === args.destinationListId) {
      // Moving within the same list
      const cards = await ctx.db
        .query("todoCards")
        .withIndex("by_list", (q) => q.eq("listId", args.sourceListId))
        .collect()

      for (const c of cards) {
        if (c._id === args.cardId) continue

        if (args.sourceIndex < args.destinationIndex) {
          // Moving down
          if (c.position > args.sourceIndex && c.position <= args.destinationIndex) {
            await ctx.db.patch(c._id, { position: c.position - 1 })
          }
        } else {
          // Moving up
          if (c.position >= args.destinationIndex && c.position < args.sourceIndex) {
            await ctx.db.patch(c._id, { position: c.position + 1 })
          }
        }
      }
    } else {
      // Moving between different lists
      // Update source list positions
      const sourceCards = await ctx.db
        .query("todoCards")
        .withIndex("by_list", (q) => q.eq("listId", args.sourceListId))
        .collect()

      for (const c of sourceCards) {
        if (c.position > args.sourceIndex) {
          await ctx.db.patch(c._id, { position: c.position - 1 })
        }
      }

      // Update destination list positions
      const destCards = await ctx.db
        .query("todoCards")
        .withIndex("by_list", (q) => q.eq("listId", args.destinationListId))
        .collect()

      for (const c of destCards) {
        if (c._id !== args.cardId && c.position >= args.destinationIndex) {
          await ctx.db.patch(c._id, { position: c.position + 1 })
        }
      }
    }
  },
})
