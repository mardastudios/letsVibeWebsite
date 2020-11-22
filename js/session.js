import { gun } from "./main.js";
import helpers from "./helpers.js";
import { addFriend, friends, newFriend } from "./friend.js";
import { getRandomAvatar, generateAvatarURL } from "./avatar.js";
let key;
let username;
var avatar;
let latestChatLink;
let onlineTimeout;
let onlineStatus;

//Create new account
function createAccount() {
	$("#username").focus();
	$("#user-signup-form").submit(function (e) {
		e.preventDefault();
		var username = $("#username").val();
		var avatar = getRandomAvatar();
		if (username.length) {
			Gun.SEA.pair().then(async (k) => {
				await login(k);
				gun.user().get("profile").get("username").put(username);
				gun.user().get("profile").get("avatar").put(avatar);
				console.log(avatar);
				createFriendLink();
			});
		}
	});
}

function setOurOnlineStatus() {
	iris.Channel.setOnline(gun, (onlineStatus = true));
	document.addEventListener("mousemove", () => {
		iris.Channel.setOnline(gun, (onlineStatus = true));
		clearTimeout(onlineTimeout);
		onlineTimeout = setTimeout(
			() => iris.Channel.setOnline(gun, (onlineStatus = false)),
			60000
		);
	});
}

//Creating channel URL to be shared
async function createFriendLink() {
	latestChatLink = await iris.Channel.createChatLink(
		gun,
		key,
		"http://localhost:8080"
	);
}

//Login using a key
function login(k) {
	key = k;
	localStorage.setItem("keyPair", JSON.stringify(k));
	iris.Channel.initUser(gun, key);
	gun.user()
		.get("profile")
		.get("username")
		.on(async (name) => {
			username = await name;
			$("#my-username").text(username);
			$("#my-edit-username").text(username);
		});
	gun.user()
		.get("profile")
		.get("avatar")
		.on(async (avatar) => {
			avatar = await avatar;
			$("#header-content")
				.find(".profile-avatar")
				.attr("src", generateAvatarURL(avatar));
			$("#my-edit-profile")
				.find(".profile-avatar")
				.attr("src", generateAvatarURL(avatar));
			$("#profile-settings-avatar")
				.find(".profile-avatar")
				.attr("src", generateAvatarURL(avatar));
		});
	$("#vibe-page").show().siblings("div#start-page").hide();
	setOurOnlineStatus();
	iris.Channel.getChannels(gun, key, addFriend);
	var chatId =
		helpers.getUrlParameter("chatWith") ||
		helpers.getUrlParameter("channelId");
	var inviter = helpers.getUrlParameter("inviter");
	function go() {
		if (inviter !== key.pub) {
			newFriend(chatId, window.location.href);
		}
		window.history.pushState(
			{},
			"VIBE",
			"/" +
				window.location.href
					.substring(window.location.href.lastIndexOf("/") + 1)
					.split("?")[0]
		); // remove param
	}
	if (chatId) {
		if (inviter) {
			setTimeout(go, 2000); // wait a sec to not re-create the same chat
		} else {
			go();
		}
	}
}

//Helper functions
function getKey() {
	return key;
}
function getUsername() {
	return username;
}
function getFriendLink() {
	return latestChatLink || helpers.getUserFriendLink(key.pub);
}
function getAvatar() {
	return avatar;
}

function switchPage(swBtn, startPg, endPg) {
	$(`#${swBtn}`).on("click", function () {
		$(`#${endPg}`).show().siblings(`div#${startPg}`);
	});
}

function getId(url) {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);

	return match && match[2].length === 11 ? match[2] : null;
}

function callPlayer(iframe, func, args) {
	iframe = document.getElementById(iframe);
	var event = "command";
	if (func.indexOf("get") > -1) {
		event = "listening";
	}

	if (iframe && iframe.src.indexOf("youtube.com/embed") !== -1) {
		iframe.contentWindow.postMessage(
			JSON.stringify({
				event: event,
				func: func,
				args: args || [],
			}),
			"*"
		);
	}
}

function onPasteYouTube(event) {
	var val = $(event.target).val() || event;
	if (!val.length) {
		$("#vibe-notice").text("Invalid URL ...");
		return;
	}
	const videoId = getId(val);
	vibeYoutube(videoId);

	$(event.target).val("");
}

async function vibeYoutube(videoId) {
	var player;

	gun.user().get("profile").get("watching").put(videoId);
	gun.user()
		.get("profile")
		.get("watching")
		.on((videoId) => {
			console.log(videoId);
		});

	const iframeMarkup =
		'<iframe id="vibe-video" width="560" height="315" src="//www.youtube.com/embed/' +
		videoId +
		'?enablejsapi=1?rel="0" frameborder="0" origin="https://letsvibe.io" allowfullscreen></iframe>';
	$(".youtubeVideo").empty();
	$(".youtubeVideo").append(iframeMarkup);
	$("#vibe-notice").text("Successfully fetched the video ...");

	function onYouTubeIframeAPIReady() {
		console.log("YOUTUBE LOADED");

		player = new YT.Player("vibe-video", {
			events: {
				onReady: onPlayerReady,
				onStateChange: onPlayerStateChange,
			},
		});

		player.onStateChange((data) => {
			console.log(data);
		});
	}

	// 4. The API will call this function when the video player is ready.
	async function onPlayerReady(event) {
		console.log("PRINT");
		await event.target.playVideo();
	}

	// 5. The API calls this function when the player's state changes.
	//    The function indicates that when playing a video (state=1),
	//    the player should play for six seconds and then stop.
	var done = false;
	function onPlayerStateChange(event) {
		console.log(event.data);
	}
	function stopVideo() {
		player.stopVideo();
	}

	var vibeStatus = gun.user().get("profile").get("watching").get("status");
}

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player("vibe-video", {
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange,
		},
	});
}
function onPlayerReady(event) {
	document.getElementById("vibe-video").style.borderColor = "#FF6D00";
}
function changeBorderColor(playerStatus) {
	var color;
	if (playerStatus == -1) {
		color = "#37474F"; // unstarted = gray
	} else if (playerStatus == 0) {
		color = "#FFFF00"; // ended = yellow
	} else if (playerStatus == 1) {
		color = "#33691E"; // playing = green
	} else if (playerStatus == 2) {
		color = "#DD2C00"; // paused = red
	} else if (playerStatus == 3) {
		color = "#AA00FF"; // buffering = purple
	} else if (playerStatus == 5) {
		color = "#FF6DOO"; // video cued = orange
	}
	if (color) {
		document.getElementById(
			"existing-iframe-example"
		).style.borderColor = color;
	}
}
function onPlayerStateChange(event) {
	changeBorderColor(event.data);
}

function init() {
	var localStorageKey = localStorage.getItem("keyPair");
	if (localStorageKey) {
		console.log("ALREADY LOGGED IN");
		login(JSON.parse(localStorageKey));
	} else {
		console.log("NO ACCOUNT ACTIVE\n CREATE ONE");
		createAccount();
	}

	$("#my-link").on("click", () => {
		callPlayer($("#vibe-video"), "pauseVideo");
	});
	$("#youtube-url").on("input", onPasteYouTube);
	$("#goto-signin").on("click", function () {
		$("#sign-in").show().siblings("div#sign-up").hide();
	});
	//switchPage('goto-signin','sign-up', 'sign-in');
	$("#back-btn").on("click", function () {
		$("#sign-up").show().siblings("div#sign-in").hide();
	});

	$("#my-user-profile").on("click", function () {
		$("#settings-page").show().siblings("div#vibe-page").hide();
	});

	$("#go-back-vibe").on("click", function () {
		$("#vibe-page").show().siblings("div#settings-page").hide();
	});

	$(".profile-settings-btn").on("click", function () {
		$("#profile-settings")
			.show()
			.siblings("div#network-settings, div#audio-settings")
			.hide();
	});

	$(".network-settings-btn").on("click", function () {
		$("#network-settings")
			.show()
			.siblings("div#profile-settings, div#audio-settings")
			.hide();
	});

	$(".audio-settings-btn").on("click", function () {
		$("#audio-settings")
			.show()
			.siblings("div#network-settings, div#profile-settings")
			.hide();
	});

	$("#edit-avatar").on("click", function () {
		$("#edit-page").show().siblings("div#settings-page").hide();
	});

	$("#discard-all").on("click", function () {
		$("#settings-page").show().siblings("div#edit-page").hide();
	});

	$("#priv-key").on("input", (event) => {
		var val = $(event.target).val();
		if (!val.length) {
			return;
		}
		try {
			var k = JSON.parse(val);
			login(k);
			createFriendLink();
			console.log("Succussfuly logged in");
			$(event.target).val("");
		} catch (e) {
			console.error("Login with key", val, "failed", e);
			console.log("Error Logging in");
		}
	});
	$("#log-out-btn").click(() => {
		console.log(getUsername(), ": LOGGED OUT!");
		localStorage.removeItem("keyPair");
		location.reload();
	});

	$("#my-user-profile").click(() => {
		console.log("Username: ", getUsername());
		console.log("Key: ", JSON.stringify(getKey()));
		console.log("Friend Link: ", getFriendLink());
	});

	$("#my-link").click(() => {
		helpers.copyToClipboard(getFriendLink());
	});
}

export default {
	init,
	getKey,
	getUsername,
	getFriendLink,
	getAvatar,
	vibeYoutube,
};
