import { gun } from "./main.js";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

function distance(x1, y1, x2, y2) {
	let xDistance = x2 - x1;
	let yDistance = y2 - y1;
	return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function getMousePosition(canvas, event) {
	let rect = canvas.getBoundingClientRect();
	let x = event.clientX - rect.left;
	let y = event.clientY - rect.top;
	return { x: x, y: y };
}
const mouseClicked = false;
const mouse = {
	x: undefined,
	y: undefined,
};

// Event Listeners
addEventListener("mousemove", (event) => {
	mouse.x = event.clientX - canvas.getBoundingClientRect().left;
	mouse.y = event.clientY - canvas.getBoundingClientRect().top;
});

// Objects
function Circle(x, y, dx, dy, radius, color, index, controllable) {
	this.x = x;
	this.y = y;

	this.radius = radius;
	this.color = color;

	this.index = index;
	this.mouseClicked = false;
	this.velocity = {
		x: dx,
		y: dy,
	};
	this.mouseInside = false;
	this.controllable = controllable;
}
Circle.prototype.draw = function () {
	c.beginPath();
	c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
	c.fillStyle = this.color;
	c.fill();
	c.closePath();
};

Circle.prototype.update = function () {
	let ratio = 5 / 200;

	if (distance(this.x, this.y, mouse.x, mouse.y) < this.radius) {
		// Mouse inside circle
		this.mouseInside = true;
	} else {
		//The mouse is in one circle
		//And out of 4 other circles
		this.mouseInside = false;
		this.mouseClicked = false;
	}
	addEventListener("mousedown", () => {
		this.mouseClicked = true;
	});
	addEventListener("mouseup", () => {
		this.mouseClicked = false;
	});
	if (this.controllable && gun) {
	}

	if (this.mouseInside && this.mouseClicked && this.controllable) {
		gun.user()
			.get("profile")
			.get("room")
			.get("source")
			.put({
				y: this.y * ratio - 5,
				x: this.x * ratio - 5,
				z: 0,
			});
		this.x = mouse.x * this.velocity.x;
		this.y = mouse.y * this.velocity.y;
	}
};
let c1 = new Circle(
	canvas.width / 2,
	canvas.height / 2,
	1,
	1,
	30,
	"#1f1f1f",
	1,
	false
);
if (gun) {
	gun.user()
		.get("profile")
		.get("room")
		.get("source")
		.put({
			x: canvas.width / 2 + 150 * ratio - 5,
			y: (canvas.height / 2) * ratio - 5,
			z: 0,
		});
}

let c2 = new Circle(
	canvas.width / 2 + 150,
	canvas.height / 2,
	1,
	1,
	30,
	"#e1e1e1",
	2,
	true
);

let circles = [c1, c2];

// Animation Loop
function animate() {
	requestAnimationFrame(animate); // Create an animation loop
	c.clearRect(0, 0, canvas.width, canvas.height); // Erase whole canvas
	circles.forEach((circle) => {
		circle.draw();
		circle.update();
	});
}
animate();
