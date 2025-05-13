// Frontend API route
export default async function handler(req, res) {
  const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
  const { id } = req.query;
  
  if (req.method === 'DELETE') {
    try {
      // Forward the request to your backend API
      const response = await fetch(`${apiUrl}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Forward authorization header if present
          ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }
  
  // Add handlers for other methods like GET, PUT, etc. if needed
  
  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}