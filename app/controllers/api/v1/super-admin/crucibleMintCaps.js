
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = function (router) {

  router.post('/create', async (req, res) => {

    if (!req.body.cFRMMaxCap || !req.body.cFRMxMaxCap) {
      return res.http400('cFRMMaxCap & cFRMxMaxCap are required.');
    }

    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    let crucibleMintCap = await db.CrucibleMintCaps.create(req.body)

    return res.http200({
      crucibleMintCap: crucibleMintCap
    });

  });

  router.put('/update/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.cFRMMaxCap || !req.body.cFRMxMaxCap) {
      return res.http400('cFRMMaxCap & cFRMxMaxCap are required.');
    }

    req.body.updatedByUser = req.user._id
    req.body.updatedAt = new Date()

    let crucibleMintCap = await db.CrucibleMintCaps.findOneAndUpdate(filter, req.body, { new: true })

    return res.http200({
      crucibleMintCap: crucibleMintCap
    });

  });

  router.get('/list', async (req, res) => {

    var filter = {}

    let crucibleMintCaps = await db.CrucibleMintCaps.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      crucibleMintCaps: crucibleMintCaps
    });

  });

  router.get('/:id', async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id }

    let crucibleMintCap = await db.CrucibleMintCaps.findOne(filter)

    return res.http200({
      crucibleMintCap: crucibleMintCap
    });

  });

  router.delete('/:id', async (req, res) => {
    let filter = {}

    await db.CrucibleMintCaps.remove({ _id: req.params.id })

    return res.http200({
      message: stringHelper.strSuccess
    });
  })

};
