
import db from "../Config/db.js";


// Add a new sale


export const addSale = async (req, res) => {
    let connection;

    try {
        const { ProductCode, QuantitySold } = req.body;

        // Check required fields

        if (!ProductCode || !QuantitySold ||
            !Number.isInteger(Number(QuantitySold)) ||
            Number(QuantitySold) <= 0) {
            return res.status(400).json({
                message: "Please provide a valid ProductCode and QuantitySold."
            });
        }

        // Get database connection

        connection = await db.getConnection();

        // Start transaction

        await connection.beginTransaction();

        // Check if product exists and lock its row

        const [products] = await connection.execute(
            "SELECT ProductCode, UnitPrice, QuantityInStock FROM product WHERE ProductCode = ? FOR UPDATE",
            [ProductCode]
        );

        if (products.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Product not found."
            });
        }

        const product = products[0];

        // Check available stock

        if (product.QuantityInStock < Number(QuantitySold)) {
            await connection.rollback();

            return res.status(400).json({
                message: "Insufficient stock.",
                AvailableStock: product.QuantityInStock
            });
        }

        // Calculate total amount

        const TotalAmount = Number(
            (Number(product.UnitPrice) * Number(QuantitySold)).toFixed(2)
        );

        // Insert sale

        const [result] = await connection.execute(
            `INSERT INTO sale
            (ProductCode, QuantitySold, TotalAmount)
            VALUES (?, ?, ?)`,
            [ProductCode, QuantitySold, TotalAmount]
        );

        // Reduce product stock

        await connection.execute(
            `UPDATE product
            SET QuantityInStock = QuantityInStock - ?
            WHERE ProductCode = ?`,
            [QuantitySold, ProductCode]
        );

        // Commit transaction

        await connection.commit();

        return res.status(201).json({
            message: "Sale recorded successfully.",
            SaleNumber: result.insertId,
            ProductCode: ProductCode,
            QuantitySold: Number(QuantitySold),
            UnitPrice: Number(product.UnitPrice),
            TotalAmount: TotalAmount
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error recording sale:", error);

        return res.status(500).json({
            message: "Internal server error."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};










// Get all sales

export const getAllSales = async (req, res) => {
    try {
        const [sales] = await db.execute(`
            SELECT 
                sale.SaleNumber,
                sale.ProductCode,
                product.ProductName,
                sale.QuantitySold,
                product.UnitPrice,
                sale.TotalAmount,
                sale.SaleDate
            FROM sale
            INNER JOIN product
            ON sale.ProductCode = product.ProductCode
            ORDER BY sale.SaleDate DESC
        `);

        return res.status(200).json({
            message: "Sales retrieved successfully.",
            sales: sales
        });

    } catch (error) {
        console.error("Error retrieving sales:", error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
};