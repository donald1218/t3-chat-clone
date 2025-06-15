"use client";

import { useCurrentUserImage } from "@/lib/hooks/use-current-user-image";
import { useCurrentUserName } from "@/lib/hooks/use-current-user-name";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CurrentUserAvatarProps {
  className?: string;
}

export const CurrentUserAvatar = (props: CurrentUserAvatarProps) => {
  const profileImage = useCurrentUserImage();
  const name = useCurrentUserName();
  const initials = name
    ?.split(" ")
    ?.map((word) => word[0])
    ?.join("")
    ?.toUpperCase();

  return (
    <Avatar className={props.className}>
      {profileImage && <AvatarImage src={profileImage} alt={initials} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};
