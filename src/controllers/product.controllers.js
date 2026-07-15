import products from '../models/product.model.js'

const createProduct = (req, res) => {

}

export { createProduct }



// import fs from "fs";
// import cloudinary from "../config/cloudinary.js"; // assumes cloudinary.v2.config() already set here
// import products from "../models/productModel.js"; // adjust path to your model file

// // Helper: upload a local file (from multer diskStorage) to Cloudinary and clean up temp file
// const uploadToCloudinary = async (filePath, folder = "products") => {
//     const result = await cloudinary.uploader.upload(filePath, { folder });
//     fs.unlink(filePath, () => {}); // remove temp file, ignore errors
//     return { url: result.secure_url, public_id: result.public_id };
// };

// // Helper: parse specifications sent as a JSON string in form-data
// const parseSpecifications = (specifications) => {
//     if (!specifications) return undefined;
//     if (typeof specifications === "object") return specifications;
//     try {
//         return JSON.parse(specifications);
//     } catch (err) {
//         return undefined;
//     }
// };

// // @desc    Create a new product
// // @route   POST /api/products
// export const createProduct = async (req, res) => {
//     try {
//         const { title, description, price, category, brand, stock, featured, specifications } = req.body;

//         if (!title || !description || !price || !category) {
//             return res.status(400).json({ message: "Title, description, price and category are required" });
//         }

//         if (!req.file) {
//             return res.status(400).json({ message: "Product image is required" });
//         }

//         const { url, public_id } = await uploadToCloudinary(req.file.path);

//         const product = await products.create({
//             title,
//             description,
//             price,
//             category,
//             brand,
//             stock,
//             featured,
//             specifications: parseSpecifications(specifications),
//             image: url,
//             public_id,
//         });

//         res.status(201).json({ message: "Product created successfully", product });
//     } catch (error) {
//         console.error("Create product error:", error);
//         res.status(500).json({ message: error.message || "Something went wrong while creating the product" });
//     }
// };

// // @desc    Get all products (supports simple search, category filter & pagination)
// // @route   GET /api/products
// export const getAllProducts = async (req, res) => {
//     try {
//         const { search, category, brand, featured, page = 1, limit = 12 } = req.query;

//         const filter = {};
//         if (search) filter.title = { $regex: search, $options: "i" };
//         if (category) filter.category = category;
//         if (brand) filter.brand = brand;
//         if (featured !== undefined) filter.featured = featured === "true";

//         const skip = (Number(page) - 1) * Number(limit);

//         const [items, total] = await Promise.all([
//             products.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
//             products.countDocuments(filter),
//         ]);

//         res.status(200).json({
//             products: items,
//             total,
//             page: Number(page),
//             totalPages: Math.ceil(total / Number(limit)),
//         });
//     } catch (error) {
//         console.error("Get products error:", error);
//         res.status(500).json({ message: error.message || "Something went wrong while fetching products" });
//     }
// };

// // @desc    Get a single product by id
// // @route   GET /api/products/:id
// export const getProductById = async (req, res) => {
//     try {
//         const product = await products.findById(req.params.id);

//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         res.status(200).json({ product });
//     } catch (error) {
//         console.error("Get product error:", error);
//         res.status(500).json({ message: error.message || "Something went wrong while fetching the product" });
//     }
// };

// // @desc    Update a product (image optional — only replaced if a new file is sent)
// // @route   PUT /api/products/:id
// export const updateProduct = async (req, res) => {
//     try {
//         const existingProduct = await products.findById(req.params.id);

//         if (!existingProduct) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         const { title, description, price, category, brand, stock, featured, specifications } = req.body;

//         const updateData = {
//             ...(title !== undefined && { title }),
//             ...(description !== undefined && { description }),
//             ...(price !== undefined && { price }),
//             ...(category !== undefined && { category }),
//             ...(brand !== undefined && { brand }),
//             ...(stock !== undefined && { stock }),
//             ...(featured !== undefined && { featured }),
//             ...(specifications !== undefined && { specifications: parseSpecifications(specifications) }),
//         };

//         // If a new image was uploaded, replace the old one on Cloudinary
//         if (req.file) {
//             if (existingProduct.public_id) {
//                 await cloudinary.uploader.destroy(existingProduct.public_id).catch(() => {});
//             }
//             const { url, public_id } = await uploadToCloudinary(req.file.path);
//             updateData.image = url;
//             updateData.public_id = public_id;
//         }

//         const product = await products.findByIdAndUpdate(req.params.id, updateData, {
//             new: true,
//             runValidators: true,
//         });

//         res.status(200).json({ message: "Product updated successfully", product });
//     } catch (error) {
//         console.error("Update product error:", error);
//         res.status(500).json({ message: error.message || "Something went wrong while updating the product" });
//     }
// };

// // @desc    Delete a product (also removes its image from Cloudinary)
// // @route   DELETE /api/products/:id
// export const deleteProduct = async (req, res) => {
//     try {
//         const product = await products.findById(req.params.id);

//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         if (product.public_id) {
//             await cloudinary.uploader.destroy(product.public_id).catch(() => {});
//         }

//         await product.deleteOne();

//         res.status(200).json({ message: "Product deleted successfully" });
//     } catch (error) {
//         console.error("Delete product error:", error);
//         res.status(500).json({ message: error.message || "Something went wrong while deleting the product" });
//     }
// };