const logisticsService = require('../services/logisticsService');

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await logisticsService.getAllCompanies(req.query);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await logisticsService.getCompanyById(req.params.id);
    res.json(company);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const company = await logisticsService.createCompany(data);
    res.status(201).json(company);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const updated = await logisticsService.updateCompany(req.params.id, data);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const result = await logisticsService.deleteCompany(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllPartners = async (req, res) => {
  try {
    const partners = await logisticsService.getAllPartners(req.query);
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPartner = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const partner = await logisticsService.createPartner(data);
    res.status(201).json(partner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePartner = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const updated = await logisticsService.updatePartner(req.params.id, data);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePartner = async (req, res) => {
  try {
    const result = await logisticsService.deletePartner(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
