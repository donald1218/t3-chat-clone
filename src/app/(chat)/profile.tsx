"use client";

import { CurrentUserAvatar } from "@/components/current-user-avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";
import { LogOutIcon } from "lucide-react";
import { signOut } from "../actions";
import { useCurrentUserName } from "@/lib/hooks/use-current-user-name";

export default function Profile() {
  const userName = useCurrentUserName();

  return (
    <div className="flex items-center justify-start">
      <Popover>
        <PopoverTrigger>
          <CurrentUserAvatar />
        </PopoverTrigger>

        <PopoverContent
          side="right"
          align="end"
          alignOffset={-2}
          sideOffset={-36}
        >
          <div className="flex flex-col bg-white rounded-lg shadow">
            <Button type="button" onClick={signOut} variant="ghost">
              <LogOutIcon className="mr-2 h-4 w-4" />
              Sign out
            </Button>

            <Button type="button" variant="ghost" className="pl-1">
              <CurrentUserAvatar /> {userName}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
