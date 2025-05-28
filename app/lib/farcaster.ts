// Helper function for frame message handling in Farcaster
export function createFrameMessage(text: string): void {
  try {
    // In a real implementation, this would use the Farcaster SDK
    // This is a simplified version for our demo
    if (typeof window !== 'undefined') {
      console.log('Creating frame message:', text)
      
      // Mock frame message function for demo purposes
      if (window.parent !== window) {
        console.log('Would send message to parent frame:', text)
      }
    }
  } catch (error) {
    console.error('Error creating frame message:', error)
  }
}
