const { HttpError, ctrlWrapper } = require("../helpers");
const { Contact } = require("../models/contact.js");

const getAllContacts = async (req, res) => {
	const { id: owner } = req.user;
	const { page = 1, limit = 10, favorite } = req.query;
	const skip = (page - 1) * limit;
	const findFilter = favorite ? { owner, favorite } : { owner };
	const result = await Contact.find(findFilter, "", {
		skip,
		limit,
	}).populate("owner", "email subscription");
	res.json(result);
};

const getById = async (req, res) => {
	const { contactId } = req.params;
	const { id } = req.user;
	const result = await Contact.findById(contactId);
	const contactOwnerId = result.owner.toString();

	if (!result) {
		throw HttpError(404, `Not found contact with ${contactId}`);
	}
	if (id !== contactOwnerId) {
		return res.status(403).json({ message: "Forbidden" });
	}

	return res.json(result);
};

const addMyContact = async (req, res) => {
	const owner = req.user.id;
	const result = await Contact.create({ ...req.body, owner });
	res.status(201).json(result);
};

const deleteContact = async (req, res) => {
	const { contactId } = req.params;
	const { id } = req.user;
	const result = await Contact.findByIdAndDelete(contactId);
	const contactOwnerId = result.owner.toString();
	if (!result) {
		throw HttpError(404, `contact with ${contactId} not found`);
	}
	if (id !== contactOwnerId) {
		return res.status(403).json({ message: "Forbidden" });
	}
	res.json({
		message: "Contact deleted",
	});
};

const updateTheContact = async (req, res) => {
	const { contactId } = req.params;
	const result = await Contact.findByIdAndUpdate(contactId, req.body, {
		new: true,
	});
	if (!result) {
		throw HttpError(404, `contact with ${contactId} not found`);
	}
	res.json(result);
};

const updateTheFavorite = async (req, res) => {
	const { contactId } = req.params;
	const result = await Contact.findByIdAndUpdate(contactId, req.body, {
		new: true,
	});
	if (!result) {
		throw HttpError(404, `contact with ${contactId} not found`);
	}
	res.json(result);
};

module.exports = {
	getAllContacts: ctrlWrapper(getAllContacts),
	getById: ctrlWrapper(getById),
	addMyContact: ctrlWrapper(addMyContact),
	deleteContact: ctrlWrapper(deleteContact),
	updateTheContact: ctrlWrapper(updateTheContact),
	updateTheFavorite: ctrlWrapper(updateTheFavorite),
};
