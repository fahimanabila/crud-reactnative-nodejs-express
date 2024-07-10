import User from "../models/AuthModels.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async(req, res) =>{
    try {
        const response = await User.findAll({
            attributes : ['id','name','email']
        });
        res.status(200).json(response);
    }catch (error){
        console.log(error.message);
    }
}

export const Register = async(req, res) => {
    const { name, email, password, confpassword } = req.body;
    if (!name || !email || !password || !confpassword) {
        return res.status(400).send({ message: 'All fields are required' });
      }
    if (password !== confpassword) return res.status(400).json({msg: "Password dan Confirm Password tidak cocok"});
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {
        await User.create({
            name: name,
            email: email,
            password: hashPassword
        });
        console.log('Received data:', { name, email, password, confpassword });
        res.json({msg: "Register Berhasil"});
    } catch (error) {
        console.error(error);
    }

}

export const Login = async(req, res) => {

    try {
        const user = await User.findAll({
            where:{
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) return res.status(400).json({msg: "Password tidak cocok"});
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const accessToken = jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '20s'
        });
        const refreshToken = jwt.sign({userId, name, email}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: '1d'
        });
        await User.update({refresh_token: refreshToken},{
            where:{
                id:userId
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ accessToken });

    } catch (error) {
        res.status(404).json({msg:"Email tidak ditemukan"});
    }

}

export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.sendStatus(204);
        const user = await User.findAll({
            where:{
                refresh_token: refreshToken
            }
        });
        if(!user[0]) return res.sendStatus(204);
        const userId = user[0].id;
        await User.update({refresh_token:null},{
            where:{
                id:userId
            }
        });
        res.clearCookie('refreshToken');
        return res.sendStatus(200);
}