import express, {Router} from 'express';
import verifyToken from './authMiddleware.js';

const protectedRouter = Router();
router.get('profile', verifyToken, (req, res)=>{
    res.status(201).json({message: "Protected route accessed"})
})

export default protectedRouter;