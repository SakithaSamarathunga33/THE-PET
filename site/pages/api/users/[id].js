import { deleteUser } from '../../../lib/api';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      // Extract the token from the Authorization header
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7)
        : authHeader;
      
      const result = await deleteUser(id, token);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in API route:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}