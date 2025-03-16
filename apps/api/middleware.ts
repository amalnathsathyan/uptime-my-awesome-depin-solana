import type {Request, Response, NextFunction} from "express"

export function authMiddleWare (req:Request, res:Response, next: NextFunction) {
    const authHeader = req.headers['authorization']
    req.userId = "1"
    next()
}