const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");
const Joi = require("joi");

const userSchema = new Schema(
	{
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
		},
		subscription: {
			type: String,
			enum: ["starter", "pro", "business"],
			default: "starter",
		},
		token: {
			type: String,
			default: null,
		},
	},
	{ versionKey: false, timestamps: false },
);

userSchema.post("save", handleMongooseError);

const User = model("user", userSchema);

const registerSchema = Joi.object({
	email: Joi.string().required().error(new Error("missing required email field")),
	password: Joi.string().required().error(new Error("missing required password field")),
});
const loginSchema = Joi.object({
	email: Joi.string().required().error(new Error("missing required email field")),
	password: Joi.string().required().error(new Error("missing required password field")),
});
const updateSchema = Joi.object({
	subscription: Joi.string().required().error(new Error("missing required subscription field")),
});

const schemas = {
	registerSchema,
	loginSchema,
	updateSchema,
};

module.exports = {
	User,
	schemas,
};
