import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

interface FeedbackFormProps {
  studentInfo: {
    id: string;
    name: string;
    rollNo: string;
  };
  onFeedbackSubmitted?: () => void;
}

const FEEDBACK_CATEGORIES = [
  { value: 'food-quality', label: 'Food Quality' },
  { value: 'hygiene', label: 'Hygiene & Cleanliness' },
  { value: 'service', label: 'Service' },
  { value: 'menu-variety', label: 'Menu Variety' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'complaint', label: 'Complaint' },
];

const FeedbackForm: React.FC<FeedbackFormProps> = ({ studentInfo, onFeedbackSubmitted }) => {
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!category) {
      setError('Please select a feedback category');
      return;
    }

    if (!message.trim()) {
      setError('Please enter your feedback message');
      return;
    }

    try {
      // Create new feedback entry
      const newFeedback = {
        id: `feedback-${Date.now()}`,
        studentName: studentInfo.name,
        studentId: studentInfo.rollNo,
        category,
        message,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      // Get existing feedbacks and add the new one
      const existingFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
      const updatedFeedbacks = [...existingFeedbacks, newFeedback];
      
      // Save to localStorage
      localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
      
      // Reset form
      setCategory('');
      setMessage('');
      setSuccess('Your feedback has been submitted successfully!');
      
      // Notify parent component if callback provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-semibold">Submit Feedback</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feedback Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {FEEDBACK_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Feedback
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Please share your feedback, suggestions or concerns..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Send className="h-4 w-4 mr-2" />
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm; 