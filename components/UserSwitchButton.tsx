"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PortalUser = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
};

type UserSwitchButtonProps = {
  users: PortalUser[];
  activeUserId: string | null;
};

export function UserSwitchButton({ users, activeUserId }: UserSwitchButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeUser =
    users.find((user) => user.id === activeUserId) ?? users[0] ?? null;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function selectUser(userId: string) {
    setIsSwitching(true);

    try {
      const response = await fetch("/api/users/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message || "Unable to switch user.");
      }

      setOpen(false);
      router.push(`/profile/${userId}`);
      router.refresh();
    } catch {
      setIsSwitching(false);
      return;
    }
  }

  if (!activeUser) {
    return (
      <button className="profile-chip user-switch-trigger" type="button" disabled>
        <span className="user-switch-copy">
          <strong>Switch user</strong>
          <span>No portal users</span>
        </span>
      </button>
    );
  }

  return (
    <div className="user-switcher" ref={rootRef}>
      <button
        className="profile-chip user-switch-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Switch portal user. Current user ${activeUser.name}.`}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar className="profile-chip-avatar">
          <AvatarImage src={activeUser.avatarUrl} alt={`${activeUser.name} avatar`} />
          <AvatarFallback>
            {activeUser.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="user-switch-copy">
          <strong>{activeUser.name}</strong>
          <span>Mock user switch</span>
        </span>
        <ChevronDown aria-hidden="true" className="user-switch-caret" />
      </button>

      {open ? (
        <div className="user-switch-menu" role="menu" aria-label="Switch portal user">
          {users.map((user) => {
            const selected = user.id === activeUser.id;
            return (
              <button
                key={user.id}
                className={`user-switch-option${selected ? " is-selected" : ""}`}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                disabled={isSwitching && selected}
                onClick={() => selectUser(user.id)}
              >
                <Avatar className="user-switch-option-avatar">
                  <AvatarImage src={user.avatarUrl} alt={`${user.name} avatar`} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="user-switch-option-copy">
                  <span>{user.name}</span>
                  <small>@{user.handle}</small>
                </span>
                {selected ? (
                  isSwitching ? (
                    <Loader2 aria-hidden="true" className="spin user-switch-option-icon" />
                  ) : (
                    <Check aria-hidden="true" className="user-switch-option-icon" />
                  )
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
