'use strict';

var mongoose = require('mongoose');

var NetworksModel = function () {
  var leaderboardsSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    name: { type: String, default: "" },
    nameInLower: { type: String, default: ""},
    networkShortName: { type: String, default: "" },
    ferrumNetworkIdentifier: { type: String, default: "" },
    chainId: { type: String, default: "" },
    networkId: { type: String, default: "" },
    rpcUrl: { type: String, default: "" },
    blockExplorerUrl: { type: String, default: "" },
    networkCurrencySymbol: { type: String, default: "" },
    dexInputCurrencySymbolList: [],
    networkCurrencyAddressByNetwork: { type: mongoose.Schema.Types.ObjectId, ref: 'currencyAddressesByNetwork' },
    isTestnet: { type: Boolean, default: false },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'networks' },
    isActive: { type: Boolean, default: true },
    isAllowedOnGateway: { type: Boolean, default: false },
    logo: { type: String, default: "" },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },{ collection: 'networks' });

  return mongoose.model('networks', leaderboardsSchema);
};

module.exports = new NetworksModel();
