const userServices = require('../services/user-services');
const { formatResponse } = require('../lib/utils/formatResponse');

const userController = {
  getUser: async (req, res, next) => {
    try {
      const data = await userServices.getUser(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  updatePassword: async (req, res, next) => {
    try {
      const data = await userServices.updatePassword(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      const data = await userServices.resetPassword(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  updateEmail: async (req, res, next) => {
    try {
      const data = await userServices.updateEmail(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  updateName: async (req, res, next) => {
    try {
      const data = await userServices.updateName(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  getFavorites: async (req, res, next) => {
    try {
      const data = await userServices.getFavorites(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  addFavorite: async (req, res, next) => {
    try {
      const data = await userServices.addFavorite(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  deleteFavorite: async (req, res, next) => {
    try {
      const data = await userServices.deleteFavorite(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  }
};

module.exports = userController;
