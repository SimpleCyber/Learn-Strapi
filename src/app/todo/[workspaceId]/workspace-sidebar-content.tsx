"use client"

import { CheckSquare, Calendar, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceSection } from "@/app/workspace/[workspaceId]/workspace-section"

export const WorkspaceSidebarContent = () => {
  return (
    <>
      <div className="mt-3 flex flex-col px-2">
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <CheckSquare className="mr-1 size-3.5 shrink-0" />
          <span className="truncate text-sm">All Tasks</span>
        </Button>
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <Calendar className="mr-1 size-3.5 shrink-0" />
          <span className="truncate text-sm">Today</span>
        </Button>
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <Archive className="mr-1 size-3.5 shrink-0" />
          <span className="truncate text-sm">Completed</span>
        </Button>
      </div>

      <WorkspaceSection label="Projects" hint="New Project" onNew={() => {}}>
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <span className="truncate text-sm">Personal Tasks</span>
        </Button>
        <Button variant="transparent" className="h-7 justify-start px-[18px] text-sm text-[#f9EDFFCC]">
          <span className="truncate text-sm">Work Projects</span>
        </Button>
      </WorkspaceSection>
    </>
  )
}
