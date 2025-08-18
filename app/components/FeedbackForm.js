"use client";

import { useState, useEffect } from "react";
import { Star, Send, CheckCircle } from "lucide-react";

export default function FeedbackForm({ queryId, onFeedbackSubmitted }) {
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Reset form state when queryId changes
  useEffect(() => {
    setRating(0);
    setDescription("");
    setIsSubmitting(false);
    setIsSubmitted(false);
    setError("");
  }, [queryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Rating:", rating);
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a description");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log("Submitting feedback:", { queryId, rating, description: description.trim() });
      
      const response = await fetch(`/api/queries/${queryId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          description: description.trim(),
        }),
      });

      const data = await response.json();
      console.log("Feedback submission response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setIsSubmitted(true);
      if (onFeedbackSubmitted) {
        console.log("Calling onFeedbackSubmitted with:", data.query);
        console.log("Feedback data in response:", data.query.feedback);
        onFeedbackSubmitted(data.query);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    console.log("FeedbackForm: Showing success message");
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Thank You!
        </h3>
        <p className="text-green-700">
          Your feedback has been submitted successfully. We appreciate your input!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Rate Your Experience
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How would you rate the resolution of your complaint? *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 transition-colors ${
                  star <= rating
                    ? "text-yellow-400 hover:text-yellow-500"
                    : "text-gray-300 hover:text-gray-400"
                }`}
              >
                <Star className="w-8 h-8 fill-current" />
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {rating === 1 && "Very Poor"}
            {rating === 2 && "Poor"}
            {rating === 3 && "Average"}
            {rating === 4 && "Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please share your experience (optional but helpful) *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about your experience with this complaint resolution..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/500 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || !description.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
}
