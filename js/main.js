import session from "./session.js";
import friend from "./friend.js";
import avatar from "./avatar.js";

Gun.log.off = true;
//Gun instance created here
var gun = Gun(["https://gun-us.herokuapp.com/gun"]);
var player;
window.gun = gun;

var startPage;
var homePage;
var settingsPage;

session.init();
friend.init();
avatar.init();
export { gun };
