import { deleteUser } from '../../../../server/controllers/authController';

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