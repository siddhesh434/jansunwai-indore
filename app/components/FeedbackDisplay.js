"use client";

import { Star, Calendar } from "lucide-react";

export default function FeedbackDisplay({ feedback }) {
  console.log("FeedbackDisplay received feedback:", feedback);
  
  if (!feedback) {
    console.log("No feedback provided to FeedbackDisplay");
    return null;
  }

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return "Very Poor";
      case 2: return "Poor";
      case 3: return "Average";
      case 4: return "Good";
      case 5: return "Excellent";
      default: return "";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-blue-600" />
        Feedback Submitted
      </h3>
      
      <div className="space-y-4">
        {/* Rating Display */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Rating
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= feedback.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-blue-900">
              {feedback.rating}/5 - {getRatingText(feedback.rating)}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Your Feedback
          </label>
          <div className="bg-white border border-blue-200 rounded-md p-3">
            <p className="text-blue-900 text-sm leading-relaxed">
              {feedback.description}
            </p>
          </div>
        </div>

        {/* Submission Date */}
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <Calendar className="w-4 h-4" />
          <span>Submitted on {formatDate(feedback.submittedAt)}</span>
        </div>
      </div>
    </div>
  );
}
