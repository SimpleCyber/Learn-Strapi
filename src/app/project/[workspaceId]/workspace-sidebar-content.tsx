"use client"

import { FolderOpen, Users, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceSection } from "@/app/workspace/[workspaceId]/workspace-section"

export const WorkspaceSidebarContent = () => {
  return (
    <>
      <div className="mt-3 flex flex-col px-2">
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <FolderOpen className="mr-1 size-3.5 shrink-0" />
          <span className="truncate text-sm">All Projects</span>
        </Button>
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <Users className="mr-1 size-3.5 shrink-0" />
          <span className="truncate text-sm">My Projects</span>
        </Button>
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <Calendar className="mr-1 size-3.5 shrink-0" />
          <span className="truncate text-sm">Timeline</span>
        </Button>
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <BarChart3 className="mr-1 size-3.5 shrink-0" />
          <span className="truncate text-sm">Reports</span>
        </Button>
      </div>

      <WorkspaceSection label="Active Projects" hint="New Project" onNew={() => {}}>
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <span className="truncate text-sm">Website Redesign</span>
        </Button>
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <span className="truncate text-sm">Mobile App</span>
        </Button>
      </WorkspaceSection>
    </>
  )
}
