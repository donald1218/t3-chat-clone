"use client";

import { CurrentUserAvatar } from "@/components/current-user-avatar";
import { LogOutIcon, Settings2 } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Profile() {
  return (
    <div className="flex items-center justify-start">
      <DropdownMenu>
        <DropdownMenuTrigger className="hover:cursor-pointer">
          <CurrentUserAvatar className="hover:ring-2 ring-sidebar-border" />
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="start" className="!z-40">
          <DropdownMenuItem>
            <Link
              href="/customization"
              prefetch
              className="p-0 m-0 flex items-center"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Customization
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link href="/signout" className="flex items-center">
              <LogOutIcon className="mr-2 h-4 w-4" />
              Sign out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
