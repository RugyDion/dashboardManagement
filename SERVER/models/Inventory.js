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
 date:{
  type: Date,
  default: Date.now
}
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

const SalesReport = mongoose.model("SalesReport", SalesReportSchema);
const DailyStorage = mongoose.model("DailyStorage", DailyStorageSchema);
const StorageUsage = mongoose.model("StorageUsage", StorageUsageSchema);

module.exports = { SalesReport, DailyStorage, StorageUsage };
