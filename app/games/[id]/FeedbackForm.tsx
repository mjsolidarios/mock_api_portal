"use client";

import { useState } from "react";

type FeedbackFormProps = {
  gameId: string;
};

export function FeedbackForm({ gameId }: FeedbackFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/games/${gameId}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: formData.get("userId"),
        rating: formData.get("rating"),
        comment: formData.get("comment")
      })
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(data.message ?? "Feedback could not be saved.");
      return;
    }

    event.currentTarget.reset();
    setStatus("success");
    setMessage("Feedback saved.");
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Demo user
        <select name="userId" defaultValue="user_maya">
          <option value="user_maya">Maya Reyes</option>
          <option value="user_lio">Lio Santos</option>
          <option value="">Anonymous</option>
        </select>
      </label>
      <label>
        Rating
        <select name="rating" defaultValue="5">
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </label>
      <label>
        Comment
        <textarea name="comment" rows={4} minLength={8} maxLength={500} required />
      </label>
      <button className="button" disabled={status === "submitting"} type="submit">
        {status === "submitting" ? "Saving..." : "Submit feedback"}
      </button>
      {message ? (
        <p className={`notice ${status === "success" ? "success" : "error"}`}>{message}</p>
      ) : null}
    </form>
  );
}
