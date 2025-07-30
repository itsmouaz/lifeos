const Model = require('../models/Review'); 

exports.getAll = async (req, res) => {
  const data = await Model.find({ userId: req.query.userId });
  res.json(data);
};

exports.getById = async (req, res) => {
  const item = await Model.findById(req.params.id);
  res.json(item);
};

exports.create = async (req, res) => {
  const item = new Model(req.body);
  await item.save();
  res.status(201).json(item);
};

exports.update = async (req, res) => {
  const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
};

exports.remove = async (req, res) => {
  await Model.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted successfully' });
};
