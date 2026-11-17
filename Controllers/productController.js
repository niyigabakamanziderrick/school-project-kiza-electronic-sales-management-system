
import db from "../Config/db.js";


// Add a product

export const addProduct = async (req, res) => {
  try {
    const {
      ProductName,
      UnitPrice,
      QuantityInStock,
      CategoryCode
    } = req.body;

    // Check required fields

    if (!ProductName || !UnitPrice || CategoryCode === undefined || CategoryCode === null) {
      return res.status(400).json({
        message: "Please provide ProductName, UnitPrice and CategoryCode."
      });
    }

    // Insert product into database

    const sql = `
      INSERT INTO product
      (ProductName, UnitPrice, QuantityInStock, CategoryCode)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      ProductName,
      UnitPrice,
      QuantityInStock ?? 0,
      CategoryCode
    ]);

    return res.status(201).json({
      message: "Product added successfully!",
      ProductCode: result.insertId
    });

  } catch (error) {
    console.error("Error adding product:", error);

    return res.status(500).json({
      message: "Internal server error."
    });
  }
};








// Get all products

export const getAllProducts = async (req, res) => {
    try {
        const [products] = await db.execute(
            "SELECT * FROM product"
        );

        return res.status(200).json({
            message: "Products retrieved successfully",
            products: products
        });

    } catch (error) {
        console.error("Error retrieving products:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};








// Get a product by ID

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.execute(
            "SELECT * FROM product WHERE ProductCode = ?",
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product retrieved successfully",
            product: products[0]
        });

    } catch (error) {
        console.error("Error retrieving product:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};









// Update a product

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            ProductName,
            UnitPrice,
            QuantityInStock,
            CategoryCode
        } = req.body;

        // Check if product exists

        const [products] = await db.execute(
            "SELECT * FROM product WHERE ProductCode = ?",
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Update product

        const sql = `
            UPDATE product
            SET ProductName = ?,
                UnitPrice = ?,
                QuantityInStock = ?,
                CategoryCode = ?
            WHERE ProductCode = ?
        `;

        await db.execute(sql, [
            ProductName,
            UnitPrice,
            QuantityInStock,
            CategoryCode,
            id
        ]);

        return res.status(200).json({
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error("Error updating product:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};









// Delete a product

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists

        const [products] = await db.execute(
            "SELECT * FROM product WHERE ProductCode = ?",
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Delete product
        
        await db.execute(
            "DELETE FROM product WHERE ProductCode = ?",
            [id]
        );

        return res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting product:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
