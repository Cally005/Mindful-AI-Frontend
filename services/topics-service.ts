// services/topics-service.ts

/**
 * Service to handle chat topics functionality
 */

// Define API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ChatTopic {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category: string;
  display_order: number;
}

/**
 * Fetch all available chat topics
 * @param authToken - The authentication token
 * @returns Array of chat topics
 */
export const fetchChatTopics = async (authToken: string | null): Promise<ChatTopic[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/topics`, {
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat topics');
    }

    const data = await response.json();
    
    if (data.status && Array.isArray(data.data?.topics)) {
      return data.data.topics;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching chat topics:', error);
    // Return default topics if API fails
    return getDefaultTopics();
  }
};

/**
 * Start a chat with a specific topic
 * @param topicId - The ID of the selected topic
 * @param authToken - The authentication token
 * @returns Object containing sessionId and initial response
 */
export const startTopicChat = async (
  topicId: string,
  authToken: string | null
): Promise<{ sessionId: string; initialResponse: string }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/topic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify({
        topic: topicId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to start topic chat');
    }

    const data = await response.json();
    
    if (data.status && data.data?.sessionId) {
      return {
        sessionId: data.data.sessionId,
        initialResponse: data.data.initialResponse || 'Let\'s talk about this topic. How can I help you?'
      };
    }
    
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Error starting topic chat:', error);
    throw error;
  }
};

/**
 * Get default topics for fallback
 * @returns Array of default chat topics
 */
const getDefaultTopics = (): ChatTopic[] => {
  return [
    {
      id: '1',
      title: 'Coping with anxiety',
      description: 'Techniques and strategies for managing anxiety',
      category: 'mental_health',
      display_order: 1
    },
    {
      id: '2',
      title: 'Sleep improvement strategies',
      description: 'Tips for better sleep quality',
      category: 'wellness',
      display_order: 2
    },
    {
      id: '3',
      title: 'Stress management techniques',
      description: 'Methods to reduce and manage daily stress',
      category: 'mental_health',
      display_order: 3
    },
    {
      id: '4',
      title: 'Mindfulness practice',
      description: 'Introduction to mindfulness and meditation',
      category: 'wellness',
      display_order: 4
    },
    {
      id: '5',
      title: 'Work-life balance',
      description: 'Strategies for maintaining balance',
      category: 'lifestyle',
      display_order: 5
    }
  ];
};