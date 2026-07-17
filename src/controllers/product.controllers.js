import User from "../models/auth.model.js";
import product from "../models/product.model.js";
import { deleteImg, updateImg, uploadImg } from "../services/storage.service.js";

const createProduct = async (req, res) => {

    try {
        const { title, description, price, category, brand, stock, discount, featured } = req.body;

        if (!title || !description || price == null || !category || !req.file) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        let specifications = {};

        if (req.body.specifications) {
            specifications = JSON.parse(req.body.specifications);
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
            specifications,
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
            return res.status(404).json({ message: 'product not found' })
        }
        return res.status(200).json({ message: 'PRODUCT SUCCESSFULLY DELETEED!' })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

const getAllProduct = async (req, res) => {
    try {
        const getProduct = await product.find()
        res.status(200).json({
            message: "Products fetched successfully! ",
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
    try {
        const { id } = req.params;

        const findPro = await product.findById(id);

        if (!findPro) {
            return res.status(404).json({
                message: "Product not found!"
            });
        }

        const { title, description, price, category, brand, stock, discount, featured } = req.body;

        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (category !== undefined) updateData.category = category;
        if (brand !== undefined) updateData.brand = brand;
        if (stock !== undefined) updateData.stock = stock;
        if (discount !== undefined) updateData.discount = discount;
        if (featured !== undefined) updateData.featured = featured;

        // Update Specifications
        if (req.body.specifications) {
            updateData.specifications = JSON.parse(req.body.specifications);
        }

        // Update Image
        if (req.file) {
            const updImg = await updateImg(findPro.public_id, req.file);

            updateData.image = updImg.secure_url;
            updateData.public_id = updImg.public_id;
        }

        const updatedProduct = await product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        return res.status(200).json({
            message: "Product updated successfully!",
            product: updatedProduct
        });

    } catch (error) {
        console.log(error, "Error updating product");

        return res.status(500).json({
            message: "Error in updating product"
        });
    }
};


export { createProduct, deleteProduct, getProduct, getAllProduct, updateProduct };