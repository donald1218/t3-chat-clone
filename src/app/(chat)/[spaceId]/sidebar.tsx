"use client";

import { CircleIcon, PlusIcon, SettingsIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Profile from "./profile";
import ThreadManager from "@/components/ThreadManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSpaces } from "@/lib/hooks/use-space-queries";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CreateSpaceForm, UpdateSpaceForm } from "../space-form";

interface ChatSidebarProps {
  spaceId: string;
}

export default function ChatSidebar(props: ChatSidebarProps) {
  const { data: spaces } = useSpaces();
  const [openNewSpaceOverlay, setOpenNewSpaceOverlay] =
    useState<boolean>(false);
  const [openUpdateSpaceOverlay, setOpenUpdateSpaceOverlay] =
    useState<boolean>(false);

  return (
    <Tabs defaultValue={props.spaceId} asChild>
      <Sidebar variant="floating">
        <SidebarHeader>
          <Profile />
        </SidebarHeader>

        <SidebarContent className="flex-1 relative">
          {spaces?.map((space) => (
            <TabsContent value={space.id} key={space.id}>
              <SidebarGroup>
                <ThreadManager spaceId={space.id} />
              </SidebarGroup>
            </TabsContent>
          ))}

          {/* New space overlay */}
          <div
            className={cn(
              "absolute inset-0 z-10 flex flex-col items-stretch justify-center bg-accent/20 backdrop-blur-xs transition-opacity duration-300 p-8 gap-2",
              openNewSpaceOverlay || openUpdateSpaceOverlay
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
          >
            {openNewSpaceOverlay && <CreateSpaceForm />}
            {openUpdateSpaceOverlay && (
              <UpdateSpaceForm
                spaceId={props.spaceId}
                onSubmitted={() => {
                  setOpenNewSpaceOverlay(false);
                  setOpenUpdateSpaceOverlay(false);
                }}
              />
            )}

            <Button
              variant="ghost"
              onClick={() => {
                setOpenNewSpaceOverlay(false);
                setOpenUpdateSpaceOverlay(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </SidebarContent>

        <SidebarFooter className="justify-self-end items-center justify-center gap-0">
          <div className="self-start font-sans font-bold text-sm text-primary relative group flex justify-between items-center w-full">
            <span className="px-2">
              {spaces?.find((space) => space.id === props.spaceId)?.name ??
                "New Space"}
            </span>

            <div>
              <Button
                variant="ghost"
                onClick={() => setOpenUpdateSpaceOverlay(true)}
              >
                <SettingsIcon className="size-4" />
              </Button>
            </div>
          </div>

          <Separator className="my-2" />

          <TabsList className="p-0 bg-transparent h-fit group">
            {spaces?.map((space) => (
              <Link href={`/${space.id}`} key={space.id}>
                <TabsTrigger
                  key={space.id}
                  value={space.id}
                  className={cn(
                    "text-left data-[state=active]:shadow-none data-[state=active]:bg-accent px-1 py-1 h-fit fill-primary data-[state=active]:[&_svg]:fill-primary"
                  )}
                >
                  <CircleIcon className="size-4 stroke-0 fill-primary/30" />
                </TabsTrigger>
              </Link>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="p-1 size-7"
              onClick={() => {
                setOpenNewSpaceOverlay((prev) => !prev);
              }}
            >
              <PlusIcon className="size-4 stroke-3 p-0" />
            </Button>
          </TabsList>
        </SidebarFooter>
      </Sidebar>
    </Tabs>
  );
}
