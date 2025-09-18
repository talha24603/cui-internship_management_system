import prisma from "../../prisma/client";
import { comparePassword, hashPassword } from "../utils/authhelper";
import { Request, Response } from "express";



export const register = async (req: Request, res: Response) => {

    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    if(!name || !email || !password){

        return res.status(400).json({message: "All fields are required"});
    }

    try{
    const user = await prisma.user.create({
        data: {name, email, password: hashedPassword}
    });

    res.status(201).json({message: "User created successfully", user});
    }
    catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({where: {email}});
    if(!user){
        return res.status(400).json({message: "User not found"});
    }
    const isPasswordCorrect = await comparePassword(password, user.password);
    if(!isPasswordCorrect){
        return res.status(400).json({message: "Invalid password"});
    }
}