
const { db, asyncMiddleware, commonFunctions, stringHelper, usersHelper } = global
const mailer = global.mailer;
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var path = require('path');
var ejs = require("ejs");

module.exports = function (router) {

  router.post('/sign-up', async (req, res) => {

    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password
      || !req.body.organizationName || !req.body.organizationWebsiteUrl
      || !req.body.organizationSiteName) {
      return res.http400('firstName & lastName & email & password & organizationName & organizationWebsiteUrl & organizationSiteName are required.');
    }

    let emailCount = await db.Users.count({ email: req.body.email });

    if (emailCount > 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorEmailIdAlreadyExists),stringHelper.strErrorEmailIdAlreadyExists,);
    }

    let organizationCount = await db.Organizations.count({ siteName: req.body.organizationSiteName });

    if (organizationCount > 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorSiteNameAlreadyExists),stringHelper.strErrorSiteNameAlreadyExists,);
    }

    if(req.body.firstName){
      req.body.firstNameInLower = req.body.firstName.toLowerCase()
    }

    if(req.body.lastName){
      req.body.lastNameInLower = req.body.lastName.toLowerCase()
    }

    req.body.name = req.body.firstName + " " + req.body.lastName
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.role = 'organizationAdmin'
    req.body.createdAt = new Date()
    req.body.emailVerificationCodeGenratedAt = new Date()
    req.body.emailVerificationCode = global.helper.getOtp()

    if (req.body.password) {
      req.body.password = db.Users.getHashedPassword(req.body.password);
    }

    let user;
    let organization;
    try {
      user = await db.Users.create(req.body)
      organization = await createOrganization(req,user)
      user.organization = organization
      global.sendGrid.sendGridEmail(user)
    } catch(err) {
      return res.http400(err.message);
    }

    res.http200({
      user: user.toClientObject(),
      token: user.createAPIToken(user)
    });

  });

  router.post('/sign-in', async (req, res) => {
    var filter = {}
    if (!req.body.email || !req.body.password) {
      return res.http400('email & password is required.');
    }

    filter.role = 'organizationAdmin'

    filter.email = req.body.email
    filter.password = db.Users.getHashedPassword(req.body.password)

    let user = await db.Users.findOne(filter).populate('organization')

    if (user) {

      res.http200({
        user: user.toClientObject(),
        token: user.createAPIToken(user)
      });

    } else {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorInvalidCredentials),stringHelper.strErrorInvalidCredentials,);
    }
  });

  router.get('/profile/me', async (req, res) => {

    let filter = {}
    filter = { _id: req.user._id }

    let user = await db.Users.findOne(filter).populate('organization')
    res.http200({
      user: user.toClientObject()
    });

  });

  router.put('/update/me', async (req, res) => {

    if (!req.body.firstName || !req.body.lastName || !req.body.email) {
      return res.http400('firstName & lastName & email are required.');
    }
    req.body.updatedAt = new Date()

    req.body.name = req.body.firstName + " " + req.body.lastName
    req.body.nameInLower = (req.body.name).toLowerCase()

    delete req.body.email
    delete req.body.password
    delete req.body.organization

    let user = await db.Users.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true })

    if (user) {

      return res.http200({
        user: user.toClientObject()
      });

    } else {

      return res.http400(global.stringHelper.strErrorUserNotFound);

    }

  });

  router.get('/list', async (req, res) => {

    var filter = {}
    let sort = { createdAt: -1 }
    let userKeys= ['_id' ,'email']
    let users = []
    filter.email = {$ne: ''}
    filter.email = {$ne: null}
    filter.role = {$ne: 'superAdmin'}

    if(req.query.role) {
      filter.role = req.query.role
    }

    if(req.query.isEmailAuthenticated) {
      filter.isEmailAuthenticated = req.query.isEmailAuthenticated
    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {

      users = await db.Users.find(filter,userKeys).populate('addresses', 'address')
      .sort(sort)

    } else {

      users = await db.Users.find(filter,userKeys).populate('addresses', 'address')
      .sort(sort)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    }

    return res.http200({
      users: users
    });

  });

  router.put('/sign-out', async (req, res) => {
    usersHelper.signOut(req, res)
  });

  async function createOrganization(req,user){
    let body = req.body
    body.name = body.organizationName
    if(body.name){
      body.nameInLower = (body.name).toLowerCase()
    }

    body.user = user._id
    body.links = {}
    body.links.websiteUrl = [body.organizationWebsiteUrl]
    body.siteName = body.organizationSiteName

    return new Promise(async (resolve, reject) => {

      try {
        let organization = await db.Organizations.create(body)
        if(user && user._id){
          await db.Users.findOneAndUpdate({_id: user._id}, {organization: organization._id}, { new: true });
        }
        resolve(organization)
      } catch(err) {
        reject(err.message)
      }

    })
  }

};
