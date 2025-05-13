import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Implementation of deleteUser function directly in the API route
async function deleteUser(req, res) {
  const { id } = req.query;
  
  try {
    // Replace this with appropriate API call to your backend
    // Since we can't directly import server code in Vercel frontend deployment
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      await deleteUser(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}