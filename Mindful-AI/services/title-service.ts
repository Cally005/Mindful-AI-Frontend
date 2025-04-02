// services/title-service.ts

/**
 * Service to generate titles for chat conversations
 */

// Define API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Generate a title for a chat based on the first user message
 * @param message - The first message content from the user
 * @param sessionId - The ID of the chat session
 * @param authToken - The authentication token
 * @returns The generated title
 */
export const generateChatTitle = async (
  message: string,
  sessionId: string,
  authToken: string | null
): Promise<string> => {
  // Default title in case of failure
  let title = "New Conversation";
  
  try {
    // Call the backend API to generate a title
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/generate-title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify({
        message,
        sessionId
      })
    });

    if (!response.ok) {
      // If API call fails, generate a simple title locally
      return generateSimpleTitle(message);
    }

    const data = await response.json();
    
    if (data.status && data.data?.title) {
      title = data.data.title;
    } else {
      // If API response doesn't have the expected format, generate title locally
      title = generateSimpleTitle(message);
    }
  } catch (error) {
    console.error('Error generating chat title:', error);
    // Generate a simple title locally if there's an error
    title = generateSimpleTitle(message);
  }
  
  return title;
};

/**
 * Update the title of an existing chat session
 * @param sessionId - The ID of the chat session
 * @param title - The new title to set
 * @param authToken - The authentication token
 * @returns Boolean indicating success or failure
 */
export const updateChatTitle = async (
  sessionId: string,
  title: string,
  authToken: string | null
): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/session/${sessionId}/title`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify({
        title
      })
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === true;
  } catch (error) {
    console.error('Error updating chat title:', error);
    return false;
  }
};

/**
 * Generate a simple title from the message content locally
 * @param message - The user's message
 * @returns A simple title based on the message
 */
const generateSimpleTitle = (message: string): string => {
  // Limit the message to the first 50 characters
  const truncatedMessage = message.substring(0, 50).trim();
  
  // If message is too short, use default title
  if (truncatedMessage.length < 10) {
    return "New Conversation";
  }
  
  // Remove any trailing incomplete words
  const lastSpaceIndex = truncatedMessage.lastIndexOf(' ');
  
  if (lastSpaceIndex > 10) {
    // If we have a space after 10 chars, cut there and add ellipsis
    return truncatedMessage.substring(0, lastSpaceIndex) + '...';
  } else {
    // Otherwise just add ellipsis
    return truncatedMessage + '...';
  }
};