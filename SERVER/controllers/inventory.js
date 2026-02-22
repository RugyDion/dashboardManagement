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

const addDailyStorageEntry = async (req, res) => {
  try {
    const { productName, quantity, amountPerUnit, totalAmount } = req.body;

    if (!productName || quantity == undefined || amountPerUnit == undefined || totalAmount == undefined) {
      return res.status(400).json({ message: "Please fill all necessary fields" });
    }

    const entry = new DailyStorage({
      productName,
      quantity,
      amountPerUnit,
      totalAmount,
      date: new Date()
    });

    await entry.save();
    res.status(201).json({ message: "Added daily storage entry successfully", entry });
  } catch (err) {
    res.status(500).json({ message: "Failed to add", error: err.message });
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

// =======================
// DEBT SECTION
// =======================

const addDebt = async (req, res) => {
  try {
    const { customerName, description, totalAmount } = req.body;

    if (!customerName || !description || !totalAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const debt = new Debt({
      customerName,
      description,
      totalAmount,
      remainingAmount: totalAmount,
    });

    await debt.save();
    res.status(201).json({ message: "Debt added successfully", debt });
  } catch (err) {
    res.status(500).json({ message: "Failed to add debt", error: err.message });
  }
};

const seeDebts = async (req, res) => {
  try {
    const debts = await Debt.find({});
    res.status(200).json({ debts });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch debts" });
  }
};

const updateDebtPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentAmount } = req.body;

    const debt = await Debt.findById(id);
    if (!debt) return res.status(404).json({ message: "Debt not found" });

    debt.amountPaid += paymentAmount;
    debt.remainingAmount -= paymentAmount;

    if (debt.remainingAmount <= 0) {
      debt.status = "Paid";
      debt.remainingAmount = 0;
    } else {
      debt.status = "Partially Paid";
    }

    await debt.save();
    res.status(200).json({ message: "Payment updated", debt });
  } catch (err) {
    res.status(500).json({ message: "Failed to update debt" });
  }
};

const deleteDebt = async (req, res) => {
  try {
    const { id } = req.params;
    await Debt.findByIdAndDelete(id);
    res.status(200).json({ message: "Debt deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete debt" });
  }
};

// =======================
// PAYROLL SECTION
// =======================

const addPayroll = async (req, res) => {
  try {
    const { staffName, role, salaryAmount } = req.body;

    if (!staffName || !role || !salaryAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const payroll = new Payroll({
      staffName,
      role,
      salaryAmount,
    });

    await payroll.save();
    res.status(201).json({ message: "Payroll added successfully", payroll });
  } catch (err) {
    res.status(500).json({ message: "Failed to add payroll" });
  }
};

const seePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.find({});
    res.status(200).json({ payroll });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payroll" });
  }
};

const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    await Payroll.findByIdAndDelete(id);
    res.status(200).json({ message: "Payroll deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete payroll" });
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

   // Debt
  addDebt,
  seeDebts,
  updateDebtPayment,
  deleteDebt,

  // Payroll
  addPayroll,
  seePayroll,
  deletePayroll,
};
