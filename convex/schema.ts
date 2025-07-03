import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const schema = defineSchema({
  workspaces: defineTable({
    name: v.string(),
    userId: v.id("users"),
    joinCode: v.string(),
  }),
  members: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("lead")),
  })
    .index("by_user_id", ["userId"])
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_id_user_id", ["workspaceId", "userId"]),
  channels: defineTable({
    name: v.string(),
    workspaceId: v.id("workspaces"),
  }).index("by_workspace_id", ["workspaceId"]),
  conversations: defineTable({
    workspaceId: v.id("workspaces"),
    memberOneId: v.id("members"),
    memberTwoId: v.id("members"),
  }).index("by_workspace_id", ["workspaceId"]),
  messages: defineTable({
    body: v.string(),
    image: v.optional(v.id("_storage")),
    memberId: v.id("members"),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    parentMessageId: v.optional(v.id("messages")),
    conversationId: v.optional(v.id("conversations")),
    updatedAt: v.optional(v.number()),
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_member_id", ["memberId"])
    .index("by_channel_id", ["channelId"])
    .index("by_conversation_id", ["conversationId"])
    .index("by_parent_message_id", ["parentMessageId"])
    .index("by_channel_id_parent_message_id_conversation_id", ["channelId", "parentMessageId", "conversationId"]),
  reactions: defineTable({
    workspaceId: v.id("workspaces"),
    messageId: v.id("messages"),
    memberId: v.id("members"),
    value: v.string(),
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_message_id", ["messageId"])
    .index("by_member_id", ["memberId"]),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  }).index("by_email", ["email"]),
  attendance: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    date: v.string(),
    checkInTime: v.optional(v.number()),
    checkOutTime: v.optional(v.number()),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    adminApproval: v.optional(v.boolean()),
    reason: v.optional(v.string()),
  })
    .index("by_user_workspace", ["userId", "workspaceId"])
    .index("by_workspace_date", ["workspaceId", "date"])
    .index("by_date", ["date"]),
  attendanceComments: defineTable({
    attendanceId: v.id("attendance"),
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    content: v.string(),
    image: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_attendance", ["attendanceId"])
    .index("by_workspace", ["workspaceId"]),
  // Todo/Kanban tables
  todoBoards: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    backgroundColor: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_workspace", ["userId", "workspaceId"])
    .index("by_workspace", ["workspaceId"]),
  todoLists: defineTable({
    title: v.string(),
    boardId: v.id("todoBoards"),
    userId: v.id("users"),
    position: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_board", ["boardId"])
    .index("by_user", ["userId"]),
  todoCards: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    listId: v.id("todoLists"),
    boardId: v.id("todoBoards"),
    userId: v.id("users"),
    position: v.number(),
    dueDate: v.optional(v.number()),
    isCompleted: v.boolean(),
    labels: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_list", ["listId"])
    .index("by_board", ["boardId"])
    .index("by_user", ["userId"]),
  todoChecklists: defineTable({
    cardId: v.id("todoCards"),
    title: v.string(),
    items: v.array(
      v.object({
        id: v.string(),
        text: v.string(),
        isCompleted: v.boolean(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_card", ["cardId"]),
})

export default schema
