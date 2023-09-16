const { HttpError, ctrlWrapper } = require("../helpers");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs/promises");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (user !== null) {
		throw HttpError(409, "Email in use");
	}
	const hash = await bcrypt.hash(password, 10);
	const avatarURL = gravatar.url(email);
	const newUser = await User.create({ email, password: hash, avatarURL });
	return res.status(201).json({ user: newUser });
};

const login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (user === null) {
		throw HttpError(401, "Email or password is wrong");
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (isMatch === false) {
		throw HttpError(401, "Email or password is wrong");
	}

	const payload = {
		id: user._id,
	};

	const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "23h" });
	await User.findByIdAndUpdate(user._id, { token });
	res.status(200).json({
		token: token,
		user: user,
	});
};

const logout = async (req, res, next) => {
	const { id } = req.user;
	await User.findByIdAndUpdate(id, { token: "" });

	res.status(204).end();
};

const current = async (req, res) => {
	const { id } = req.user;
	const user = await User.findById(id);
	console.log(user);
	res.status(200).json({
		email: user.email,
		subscription: user.subscription,
	});
};

const update = async (req, res) => {
	const { _id } = req.user;
	const result = await User.findByIdAndUpdate(_id, req.body, {
		new: true,
	}).select("subscription");
	res.json(result);
};

const updateAvatar = async (req, res) => {
	const { id } = req.user;
	const { path: tempPath, originalname } = req.file;
	const fileName = `xs_${id}_${originalname}`;
	const resultUpload = path.join(avatarsDir, fileName);
	await Jimp.read(resultUpload)
		.then(img => {
			return img.resize(250, Jimp.AUTO).writeAsync(resultUpload);
		})
		.catch(err => console.log(err));
	await fs.rename(tempPath, resultUpload);
	const avatarURL = path.join("avatars", fileName);
	await User.findByIdAndUpdate(id, { avatarURL });

	res.json({
		avatarURL,
	});
};

module.exports = {
	register: ctrlWrapper(register),
	login: ctrlWrapper(login),
	logout: ctrlWrapper(logout),
	current: ctrlWrapper(current),
	update: ctrlWrapper(update),
	updateAvatar: ctrlWrapper(updateAvatar),
};
