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

  const recentOperations = await Operation.find({})
    .sort({ createdAt: -1 })
    .limit(6)
    .select("reference type status createdAt")
    .lean();

  const trendDays = 7;
  const trendStartDate = new Date();
  trendStartDate.setDate(trendStartDate.getDate() - (trendDays - 1));

  const stockMovementRaw = await Operation.aggregate([
    {
      $match: {
        createdAt: { $gte: trendStartDate },
        status: "DONE",
      },
    },
    { $unwind: "$lines" },
    {
      $project: {
        type: 1,
        quantity: {
          $ifNull: ["$lines.doneQuantity", "$lines.demandQuantity"],
        },
        date: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
      },
    },
    {
      $group: {
        _id: { date: "$date", type: "$type" },
        totalQuantity: { $sum: "$quantity" },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  const stockMovementMap = stockMovementRaw.reduce((acc, item) => {
    const dateKey = item._id.date;
    if (!acc[dateKey]) {
      acc[dateKey] = {
        receipts: 0,
        deliveries: 0,
        internalTransfers: 0,
        adjustments: 0,
      };
    }

    switch (item._id.type) {
      case "RECEIPT":
        acc[dateKey].receipts = item.totalQuantity;
        break;
      case "DELIVERY":
        acc[dateKey].deliveries = item.totalQuantity;
        break;
      case "INTERNAL_TRANSFER":
        acc[dateKey].internalTransfers = item.totalQuantity;
        break;
      case "ADJUSTMENT":
        acc[dateKey].adjustments = item.totalQuantity;
        break;
      default:
        break;
    }

    return acc;
  }, {});

  const stockMovements = Array.from({ length: trendDays }).map((_, index) => {
    const current = new Date(trendStartDate);
    current.setDate(trendStartDate.getDate() + index);
    const dateKey = current.toISOString().slice(0, 10);
    const movement = stockMovementMap[dateKey] || {
      receipts: 0,
      deliveries: 0,
      internalTransfers: 0,
      adjustments: 0,
    };

    return {
      date: dateKey,
      ...movement,
    };
  });

  const stats = {
    totalProducts,
    pendingReceipts,
    pendingDeliveries,
    internalTransfers,
    lowStockCount,
    lowStockItems: lowStockCount,
    outOfStockCount,
    recentOperations,
    stockMovements,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
});

export { getDashboardStats };
