import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { io } from '../server'; // Ensure you export 'io' from your index file

// Helper to fetch all users and broadcast to all connected clients
const broadcastUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  io.emit('tableUpdated', users);
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, age } = req.body;
    const user: IUser = await User.create({ name, email, age });

    // Broadcast the fresh list to all users
    await broadcastUsers();

    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (err: any) {
    res.status(400).json({ status: 'error', error: err.message });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users: IUser[] = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, { name, email, age }, { new: true });

    if (updatedUser) {
      await broadcastUsers(); // Notify clients of the update
    }

    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  } catch (err: any) {
    res.status(400).json({ status: 'error', error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (deletedUser) {
      await broadcastUsers(); // Notify clients of the removal
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (err: any) {
    res.status(400).json({ status: 'error', error: err.message });
  }
};
