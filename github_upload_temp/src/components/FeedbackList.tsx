import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface FeedbackData {
  id: string;
  studentName: string;
  studentId: string;
  category: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  useEffect(() => {
    const storedFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    setFeedbacks(storedFeedbacks);
  }, []);

  const handleStatusChange = (feedbackId: string) => {
    const updatedFeedbacks = feedbacks.map(feedback => {
      if (feedback.id === feedbackId) {
        return {
          ...feedback,
          status: feedback.status === 'pending' ? 'resolved' : 'pending'
        };
      }
      return feedback;
    });

    setFeedbacks(updatedFeedbacks);
    localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter === 'all') return true;
    return feedback.status === filter;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Student Feedbacks</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md ${
              filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md ${
              filter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1 rounded-md ${
              filter === 'resolved' ? 'bg-green-100 text-green-700' : 'text-gray-600'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredFeedbacks.map(feedback => (
          <div 
            key={feedback.id} 
            className="border rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{feedback.studentName}</h3>
                <p className="text-sm text-gray-500">{feedback.studentId}</p>
              </div>
              <button
                onClick={() => handleStatusChange(feedback.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-md ${
                  feedback.status === 'resolved' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {feedback.status === 'resolved' ? (
                  <><CheckCircle className="h-4 w-4" /> Resolved</>
                ) : (
                  <><Clock className="h-4 w-4" /> Pending</>
                )}
              </button>
            </div>

            <div className="mt-2">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">
                {feedback.category}
              </span>
            </div>

            <p className="mt-2 text-gray-700">{feedback.message}</p>
            
            <p className="mt-2 text-sm text-gray-500">
              {new Date(feedback.timestamp).toLocaleString()}
            </p>
          </div>
        ))}

        {filteredFeedbacks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No feedbacks found
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;