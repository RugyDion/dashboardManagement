const mongoose = require("mongoose");

// Three Schema's because your design doesn't calculate dynamically and requires user input for all actions ❌❌
const SalesReportSchema = new mongoose.Schema({
  bookingsEndOfDaySales: {
    type: Number,
    required: [true, "This field is required"],
    min: [0, "Field cannot have a negative value"],
  },
  foodEndOfDaySales: {
    type: Number,
    required: [true, "This field is required"],
    min: [0, "Field cannot have a negative value"],
  },
  drinksEndOfDaySales: { 
    type: Number,
    required: [true, "This field is necessary"],
    min: [0, "Field cannot have a negative value"],
  },
  eventsEndOfDaySales: {
    type: Number,
    required: [true, "This field is necessary"],
    min: [0, "Field cannot have a negative value"],
  },
  laundryEndOfDaySales: {
    type: Number,
    required: [true, "This field is necessary"],
    min: [0, "Field cannot have a negative value"],
  },
  poolEndOfDaySales: {
    type: Number,
    required: [true, "This field is necessary"],
    min: [0, "Field cannot have a negative value"],
  },
  totalSales:{
    type:Number,
    required: [true, "This field is necessary"],
    min: [0, "Field cannot have a negative value"],
  },
  date:{
  type: Date,
  default: Date.now
}
});

const DailyStorageSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, "Please provide name of product"],
  },
  quantity: {
    type: Number,
    required: [true, "Please provide quantity of the product"],
    min: [0, "Cannot be a negative value"],
  },
  amountPerUnit: {
    type: Number,
    required: [true, "Please provide amount per unit"],
    min: [0, "Cannot be negative"],
  },
  totalAmount: {
    type: Number,
    required: [true, "Please provide total amount"],
    min: [0, "Cannot be negative"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const StorageUsageSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, "Please provide name of product"],
  },
  takeOutQuantity: {
    type: Number,
    required: [true, "Please provide the quantity to be taken out"],
    min: [0, "Cannot be a negative value"],
  },
  date:{
  type: Date,
  default: Date.now
}
});


const DebtSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, "Customer name is required"],
  },
  description: {
    type: String,
    required: [true, "Debt description is required"],
  },
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0, "Cannot be negative"],
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, "Cannot be negative"],
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: [0, "Cannot be negative"],
  },
  status: {
    type: String,
    enum: ["Unpaid", "Partially Paid", "Paid"],
    default: "Unpaid",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});



const PayrollSchema = new mongoose.Schema({
  staffName: {
    type: String,
    required: [true, "Staff name is required"],
  },
  role: {
    type: String,
    required: [true, "Role is required"],
  },
  salaryAmount: {
    type: Number,
    required: [true, "Salary amount is required"],
    min: [0, "Cannot be negative"],
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },
  paymentDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const SalesReport = mongoose.model("SalesReport", SalesReportSchema);
const DailyStorage = mongoose.model("DailyStorage", DailyStorageSchema);
const StorageUsage = mongoose.model("StorageUsage", StorageUsageSchema);
const Debt = mongoose.model("Debt", DebtSchema);
const Payroll = mongoose.model("Payroll", PayrollSchema);

module.exports = { 
  SalesReport, 
  DailyStorage, 
  StorageUsage,
  Debt,
  Payroll
};
