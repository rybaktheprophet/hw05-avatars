const {User} = require('../models/user')
const { httpError } = require("../helpers");

const checkSubscription = async (req, res, next) => {
    const { subscription } = req.body;
    const modelEnum = User.schema.path("subscription").options.enum;
    if (!modelEnum.includes(subscription)) {
      next(httpError(400, `${subscription} subscription do not exist`));
    } 
    next();
}
module.exports = checkSubscription;