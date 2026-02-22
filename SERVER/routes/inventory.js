const router = require("express").Router();
const {
  addTotalSales,
  addDailyStorageEntry,
  deleteAllDailyStorageEntries,
  addStorageUsageEntry,
  deleteAllStorageUsageEntries,
  seeDailyStorageEntries,
  seeStorageUsageEntries,
  seeTotalSales,
  deleteTotalSales,

  addDebt,
  seeDebts,
  updateDebtPayment,
  deleteDebt,

  addPayroll,
  seePayroll,
  deletePayroll,
} = require("../controllers/inventory");

// Route for the total sales
router
  .route("/totalSales")
  .post(addTotalSales)
  .get(seeTotalSales)
  .delete(deleteTotalSales);

// Route for the daily storage entry
router
  .route("/dailyStorageEntry")
  .post(addDailyStorageEntry)
  .delete(deleteAllDailyStorageEntries)
  .get(seeDailyStorageEntries);

// Route for the storage usage
router
  .route("/storageUsageEntry")
  .post(addStorageUsageEntry)
  .delete(deleteAllStorageUsageEntries)
  .get(seeStorageUsageEntries);

// =======================
// DEBT ROUTES
// =======================

router.route("/debt")
  .post(addDebt)
  .get(seeDebts);

router.route("/debt/:id/payment")
  .put(updateDebtPayment);

router.route("/debt/:id")
  .delete(deleteDebt);

// =======================
// PAYROLL ROUTES
// =======================

router.route("/payroll")
  .post(addPayroll)
  .get(seePayroll);

router.route("/payroll/:id")
  .delete(deletePayroll);

module.exports = router;
