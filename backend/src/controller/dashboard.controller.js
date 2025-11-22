import { Product } from "../models/product.model.js";
import { Operation } from "../models/operation.model.js";
import { StockQuant } from "../models/stockQuant.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  // 1. Total Products
  const totalProducts = await Product.countDocuments();

  // 2. Pending Receipts (Incoming)
  const pendingReceipts = await Operation.countDocuments({
    type: "RECEIPT",
    status: { $in: ["DRAFT", "READY"] },
  });

  // 3. Pending Deliveries (Outgoing)
  const pendingDeliveries = await Operation.countDocuments({
    type: "DELIVERY",
    status: { $in: ["DRAFT", "READY"] },
  });

  // 4. Internal Transfers Scheduled
  const internalTransfers = await Operation.countDocuments({
    type: "INTERNAL_TRANSFER",
    status: { $in: ["DRAFT", "READY"] },
  });

  // 5. Low Stock Items - Products where stock is below minStockLevel
  const lowStockItems = await Product.aggregate([
    {
      $lookup: {
        from: "stockquants",
        localField: "_id",
        foreignField: "product",
        as: "stockData",
      },
    },
    {
      $addFields: {
        totalStock: { $sum: "$stockData.quantity" },
      },
    },
    {
      $match: {
        $expr: { $lt: ["$totalStock", "$minStockLevel"] },
      },
    },
    {
      $count: "lowStockCount",
    },
  ]);

  const lowStockCount = lowStockItems[0]?.lowStockCount || 0;

  // 6. Out of Stock Items
  const outOfStockItems = await Product.aggregate([
    {
      $lookup: {
        from: "stockquants",
        localField: "_id",
        foreignField: "product",
        as: "stockData",
      },
    },
    {
      $addFields: {
        totalStock: { $sum: "$stockData.quantity" },
      },
    },
    {
      $match: {
        totalStock: { $lte: 0 },
      },
    },
    {
      $count: "outOfStockCount",
    },
  ]);

  const outOfStockCount = outOfStockItems[0]?.outOfStockCount || 0;

  const stats = {
    totalProducts,
    pendingReceipts,
    pendingDeliveries,
    internalTransfers,
    lowStockCount,
    outOfStockCount,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
});

export { getDashboardStats };
