// Frontend API route
export default async function handler(req, res) {
  const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
  
  if (req.method === 'GET') {
    try {
      // Forward the request to your backend API
      const response = await fetch(`${apiUrl}/users`);
      
      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
  
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}