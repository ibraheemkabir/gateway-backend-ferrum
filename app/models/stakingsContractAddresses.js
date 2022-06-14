"use strict";

var mongoose = require("mongoose");

var StakingsContractsAddresses = function () {
  var stakingSchema = mongoose.Schema(
    {
      stakingContractAddress: { type: String, required: true },
      currencyAddressesByNetwork: { type: String, required: true },
      isActive: { type: Boolean, default: false },
    },
    {timestamps: true, collection: "stakingsContractsAddresses", timestamps: true }
  );

  return mongoose.model("StakingsContractsAddresses", stakingSchema);
};

module.exports = new StakingsContractsAddresses();
