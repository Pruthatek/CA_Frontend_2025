import React, { useEffect, useState } from "react";
import axios from "axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const SubmitReview = () => {
  const [reviewNotes, setReviewNotes] = useState("");
  const [progress, setProgress] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const handleSubmit = async () => {

    setLoading(true);
    try {
      const response = await axiosPrivate.put(
        `/workflow/submit-client-work/review-submission/11/`,
        {
          review_notes: reviewNotes,
          progress,
          priority,
        },       
      );
      
    } catch (error) {
      
    }
    setLoading(false);
  };

    useEffect(() => {
      fetchReports();
    }, []);
  
    const fetchReports = async () => {
      try {
        const response = await axiosPrivate.get(`/workflow/reports/consolidate-task/`);
        console.log(response.data);
      } catch (error) {
        alert('Failed to fetch reports.');
      }
    };

  return (
    <div className="p-6 w-full max-w-lg mx-auto mt-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Submit Review</h2>
        <textarea
          placeholder="Review Notes"
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
        />
        <input
          type="text"
          placeholder="Progress"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
};

export default SubmitReview;
