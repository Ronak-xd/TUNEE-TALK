import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
	try {
		const { id, firstName, lastName, imageUrl, emailAddress } = req.body;

		let fullName = `${firstName || ""} ${lastName || ""}`.trim();

		// fallback if name is missing (like in email-only signup)
		if (!fullName) {
			fullName = emailAddress?.split("@")[0] || "Unknown User";
		}

		// check if user already exists
		const existingUser = await User.findOne({ clerkId: id });

		if (!existingUser) {
			await User.create({
				clerkId: id,
				fullName,
				imageUrl,
			});
		}

		res.status(200).json({ success: true });
	} catch (error) {
		console.log("Error in auth callback", error);
		next(error);
	}
};
