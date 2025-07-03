"use client"

import { Loader, TriangleAlert } from "lucide-react"
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info"
import { useWorkspaceId } from "@/hooks/use-workspace-id"

const ProjectWorkspacePage = () => {
  const workspaceId = useWorkspaceId()
  const { data: workspace, isLoading } = useGetWorkspaceInfo({ id: workspaceId })

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-2">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-2">
        <TriangleAlert className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Workspace not found.</span>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[49px] items-center border-b bg-white px-4">
        <h1 className="text-lg font-semibold">Projects - {workspace.name}</h1>
      </div>
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-2xl font-bold">Project Management</h2>
          <p className="text-muted-foreground">Manage and track your projects for the {workspace.name} workspace.</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 text-lg font-semibold">Active Projects</h3>
              <p className="text-sm text-muted-foreground">View and manage your active projects.</p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 text-lg font-semibold">Project Templates</h3>
              <p className="text-sm text-muted-foreground">Create new projects from templates.</p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 text-lg font-semibold">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground">Collaborate with your team members.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectWorkspacePage
