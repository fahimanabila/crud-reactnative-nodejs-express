import Product from "../models/ProductModels.js";
import path from "path";
import fs from "fs";

export const getProducts = async(req, res)=> {
    try {
        const response = await Product.findAll();
        res.json(response);
    } catch (error) {
        console.log(error.message)
    }
}

export const getProductById = async(req, res)=> {
    try {
        const response = await Product.findOne({
            where : {
                id : req.params.id
            }
        });
        res.json(response);
    } catch (error) {
        console.log(error.message)
    }
    
}

export const saveProduct = async(req, res)=> {
    if(req.files === null) return res.status(400).json({msg: "No File Uploaded"});
    const name = req.body.title;
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = ['.png', '.jpg', '.jpeg'];

    if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg:"Invalid images"});
    if(fileSize > 5000000) return res.status(422).json({msg:"Image must be less than 5 MB"})
    
    file.mv(`./public/images/${fileName}`, async(err)=>{
        if(err) return res.status(500).json({msg: err.message});

        try {
            await Product.create({name: name, image: fileName, url: url});
            res.status(201).json({msg:"Product created successfully"})
        } catch (error) {
            console.log(error.message)
        }
    })

}

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!product) return res.status(404).json({ msg: "No Data Found" });

        let fileName = '';
        if (!req.files || !req.files.file) {
            fileName = product.image; // Corrected from Product.image to product.image
        } else {
            const file = req.files.file;
            const fileSize = file.data.length;
            const ext = path.extname(file.name).toLowerCase();
            fileName = file.md5 + ext;
            const allowedType = ['.png', '.jpg', '.jpeg'];

            if (!allowedType.includes(ext)) return res.status(422).json({ msg: "Invalid images" });
            if (fileSize > 5000000) return res.status(422).json({ msg: "Image must be less than 5 MB" });

            const filepath = `./public/images/${product.image}`;
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }

            file.mv(`./public/images/${fileName}`, (err) => {
                if (err) return res.status(500).json({ msg: err.message });
            });
        }

        const name = req.body.title;
        const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

        await Product.update({ name: name, image: fileName, url: url }, {
            where: {
                id: req.params.id
            }
        });

        res.json({ msg: "Product updated successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "An error occurred while updating the product" });
    }
};


export const deleteProduct = async(req, res)=> {
    const product = await Product.findOne({
        where:{
            id : req.params.id
        }
    });
    if(!product) return res.status(404).json({msg: "No Data Found"});
    try {
        const filepath = `./public/images/${product.image}`;
        fs.unlinkSync(filepath);
        await Product.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({msg: "Product deleted succesfully"})
    } catch (error) {
        console.log(error.message)
    }
}