const express = require("express");

const ctrl = require("../../controllers/contacts.js");

const { schemas } = require("../../models/contact.js");
const { isValidId, authenticate, validateBody } = require("../../middlewares");

const router = express.Router();

router.get("/", authenticate, ctrl.getAllContacts);

router.get("/:contactId", authenticate, isValidId, ctrl.getById);

router.post("/", authenticate, validateBody(schemas.addSchema), ctrl.addMyContact);

router.delete("/:contactId", authenticate, isValidId, ctrl.deleteContact);

router.put(
	"/:contactId",
	authenticate,
	isValidId,
	validateBody(schemas.updateSchema),
	ctrl.updateTheContact,
);

router.patch(
	"/:contactId/favorite",
	authenticate,
	isValidId,
	validateBody(schemas.updateFavoriteSchema),
	ctrl.updateTheFavorite,
);

module.exports = router;
