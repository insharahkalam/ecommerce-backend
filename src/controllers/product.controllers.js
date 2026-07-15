import userSchema from "../models/auth.model.js";
import product from "../models/product.model.js";
import { deleteImg, updateImg, uploadImg } from "../services/storage.service.js";

const createProduct = async (req, res) => {

    try {
        const { title, description, price, category, brand, stock, discount, featured } = req.body;

        // 1. Validate first
        if (!title || !description || !price || !category || !brand || !stock || !discount || !featured || !req.file) {
            return res.status(400).json({
                message: "All fields are required!"
            });
        }

        // 2. Upload image
        const uplodCheck = await uploadImg(req.file);

        if (!uplodCheck || !uplodCheck.secure_url) {
            return res.status(500).json({
                message: "Image upload failed!"
            });
        }

        // 3. Create product
        const products = await product.create({
            title,
            description,
            price,
            category,
            brand,
            stock,
            discount,
            featured,
            image: uplodCheck.secure_url,
            public_id: uplodCheck.public_id
        });

        return res.status(201).json({
            message: "product created successfully!",
            products
        });

    } catch (error) {
        console.log(error, "error in creating product");

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params
    try {
        const find = await product.findById(id)
        if (find == null) {
            return res.status(404).json({ status: false, message: 'product not found' })
        }
        const dltprodImg = await deleteImg(find.public_id)
        console.log('dlt--->', dltprodImg);
        const deleProd = await product.findByIdAndDelete(id)
        console.log('result in deleting data-->', deleProd);

        if (deleProd == null) {
            return res.status(404).json({ status: false, message: 'product not found' })
        }
        return res.status(200).json({ status: false, message: 'SUCCESSFULLY DELETEED' })

    } catch (error) {
        return res.status(400).json({ status: false, message: error.message })
    }
}

const getAllProduct = async (req, res) => {
    try {
        const getProduct = await product.find()
        res.status(200).json({
            message: "fetched success",
            getProduct

        })
    } catch (error) {
        console.log(error, 'getting all product error');
        return res.status(400).json({
            message: "getting all product error"
        })
    }
}

const getProduct = async (req, res) => {
    const { id } = req.params
    console.log(id, "get one product id");

    const getOne = await product.findById(id)
    if (!getOne) {
        return res.status(400).json({
            message: "product not found."
        })
    }
    console.log(getOne, "checking getone");

    res.json({
        message: "product Fetched successfully!",
        getOne
    })

}

const updateProduct = async (req, res) => {
    const { title, description, price, category, brand, stock, discount, featured } = req.body
    const { id } = req.params
    const updateData = { title, description, price, category, brand, stock, discount, featured }

    if (req.file) {
        const findpro = await product.findById(id)
        const updImg = await updateImg(findpro.public_id, req.file)
        console.log(updImg, "====> check the result");
        const { secure_url, public_id } = updImg
        updateData.image = secure_url,
            updateData.public_id = public_id
    }

    const updProd = await product.findByIdAndUpdate(id, updateData,
        { new: true }
    )
    console.log(updProd, 'update check');
    return res.status(201).json({
        message: 'product updated success!',
        updProd
    })
}

export { createProduct, deleteProduct, getProduct, getAllProduct, updateProduct };