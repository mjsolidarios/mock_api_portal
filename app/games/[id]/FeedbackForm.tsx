"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type FeedbackFormProps = {
  gameId: string;
};

export function FeedbackForm({ gameId }: FeedbackFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState("5");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage("");

    const formData = new FormData(form);
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

    form.reset();
    setStatus("success");
    setMessage("Feedback saved. Recent feedback has been updated.");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Demo user
        <select name="userId" defaultValue="user_maya">
          <option value="user_maya">PixelKite</option>
          <option value="user_lio">NeonRogue</option>
          <option value="">Anonymous</option>
        </select>
      </label>
      <label>
        Rating
        <span className="star-rating-input" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value}>
              <input
                checked={rating === String(value)}
                name="rating"
                onChange={() => setRating(String(value))}
                type="radio"
                value={value}
              />
              <span aria-hidden="true">★</span>
              <span className="sr-only">{value} out of 5</span>
            </label>
          ))}
          <strong>{rating}/5</strong>
        </span>
      </label>
      <label>
        Comment
        <textarea name="comment" rows={4} minLength={8} maxLength={500} required />
      </label>
      <Button disabled={status === "submitting"} type="submit" size="lg">
        {status === "submitting" ? "Saving..." : "Submit feedback"}
      </Button>
      {message ? (
        <p className={`notice ${status === "success" ? "success" : "error"}`}>{message}</p>
      ) : null}
    </form>
  );
}
