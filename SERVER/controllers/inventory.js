// Importing the three different schemas

const {
  SalesReport,
  DailyStorage,
  StorageUsage,
} = require("../models/Inventory");

const addTotalSales = async (req, res) => {
  // Checks for missing required fields
  try {
    const requiredFields = [
      "bookingsEndOfDaySales",
      "foodEndOfDaySales",
      "drinksEndOfDaySales",
      "eventsEndOfDaySales",
      "laundryEndOfDaySales",
      "poolEndOfDaySales",
    ]; 

    const {bookingsEndOfDaySales, foodEndOfDaySales, drinksEndOfDaySales, eventsEndOfDaySales, laundryEndOfDaySales, poolEndOfDaySales, totalSales} = req.body
    if (typeof bookingsEndOfDaySales == "undefined" || typeof foodEndOfDaySales == "undefined"|| typeof drinksEndOfDaySales == "undefined" || typeof eventsEndOfDaySales == "undefined" || typeof laundryEndOfDaySales == "undefined" || typeof poolEndOfDaySales == "undefined" || typeof totalSales == "undefined") {
      return res
        .status(400)
        .json({ message: "Please fill all necessary fields" });
    }
    
    const salesReport = new SalesReport({ bookingsEndOfDaySales, foodEndOfDaySales, drinksEndOfDaySales, eventsEndOfDaySales, laundryEndOfDaySales, poolEndOfDaySales, totalSales, date: new Date() });
    await salesReport.save()
    res
      .status(201)
      .json({ message: "Sales reports successfully added", salesReport });
  } catch (err) {
    res.status(500).json({ message: "Failed to add", error: err.message });
  }
};

const seeTotalSales = async (req, res) => {
  try {
    const totalSales = await SalesReport.find({});
    res.status(200).json({ totalSales });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch", error: err.message });
  }
};

const addDailyStorageEntry = async (req, res) => {
  try {
    const { productName, quantity } = req.body;
    if (!productName || !quantity) {
      return res
        .status(400)
        .json({ message: "Please fill all necessary fields" });
    }

    const entry = new DailyStorage({ productName, quantity });
    await entry.save()
    res
      .status(201)
      .json({ message: "Added daily storage entry successfully", entry });
  } catch (err) {
    res.status(500).json({ message: "Failed to add", error: err.message });
  }
};

const seeDailyStorageEntries = async (req, res) => {
  try {
    const entries = await DailyStorage.find({});
    res.status(200).json({ entries });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch", error: err.message });
  }
};

const deleteAllDailyStorageEntries = async (req, res) => {
  try {
    await DailyStorage.deleteMany({});
    res
      .status(200)
      .json({ message: "Deleted all daily storage entries successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete all entries" });
  }
};

const addStorageUsageEntry = async (req, res) => {
  try {
    const { productName, takeOutQuantity } = req.body;
    if (!productName || !takeOutQuantity) {
      return res
        .status(400)
        .json({ message: "Please fill all necessary fields" });
    }

    const entry = new StorageUsage({ productName, takeOutQuantity });
    await entry.save()
    res
      .status(201)
      .json({ message: "Added storage usage entry successfully", entry });
  } catch (err) {
    res.status(500).json({ message: "Failed to add", error: err.message });
  }
};

const seeStorageUsageEntries = async (req, res) => {
  try {
    const entries = await StorageUsage.find({});
    res.status(200).json({ entries });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch", error: err.message });
  }
};

const deleteAllStorageUsageEntries = async (req, res) => {
  try {
    await StorageUsage.deleteMany({});
    res
      .status(200)
      .json({ message: "Deleted all storage usage entries successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete all entries" });
  }
};

const deleteTotalSales = async (req, res) => {
  try {
    await SalesReport.deleteMany({});
    res.status(200).json({ message: "Deleted all sales reports successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete all entries" });
  }
};

module.exports = {
  addTotalSales,
  addDailyStorageEntry,
  addStorageUsageEntry,
  deleteAllDailyStorageEntries,
  deleteAllStorageUsageEntries,
  seeTotalSales,
  seeDailyStorageEntries,
  seeStorageUsageEntries,
  deleteTotalSales,
};
