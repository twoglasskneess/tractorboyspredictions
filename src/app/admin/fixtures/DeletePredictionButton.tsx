"use client";
import { useTransition } from "react";
import { deletePrediction } from "../actions";

export default function DeletePredictionButton({ predictionId, userName }: { predictionId: string, userName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the prediction for ${userName}?`)) {
      startTransition(() => {
        deletePrediction(predictionId).catch(err => alert(err.message));
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="ml-1 text-red-600 hover:text-red-800 font-bold px-1"
      title={`Delete ${userName}'s prediction`}
    >
      &times;
    </button>
  );
}
