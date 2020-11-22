function onYouTubeIframeAPIReady() {
	console.log("YOUTUBE LOADED");

	player = new YT.Player("vibe-video", {
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange,
		},
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
