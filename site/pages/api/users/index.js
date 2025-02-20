import { getAllUsers } from '../../../../server/controllers/authController';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = await getAllUsers(req, res);
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
  
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}