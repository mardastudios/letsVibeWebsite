const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));

app.post("/subscribe", (req, res) => {
	const { email, js = true } = req.body;
	console.log(req.body);
	const Mailchimp = require("mailchimp-api-v3");

	const mailchimp = new Mailchimp("a53eb04c1e958fc82a8f33c2f060c467-us2");

	mailchimp
		.post(`/lists/f6f29937aa/members`, {
			email_address: email,
			status: "subscribed",
			merge_fields: {
				EMAIL: email,
			},
		})
		.then((response) => {
			console.log(response);
		})
		.catch((err) => console.log(err));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log("Server started"));
