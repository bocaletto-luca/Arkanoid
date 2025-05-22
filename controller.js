/*
 * controller.js - Multicontroller Input Handling
 * Author: Bocaletto Luca
 *
 * This script handles various user inputs including keyboard, mouse, touch, and gamepad.
 * It listens for corresponding events and updates the global Controller object accordingly.
 */

window.Controller = {
  // Object to track keyboard key states (true if pressed)
  keys: {},

  // Object to track mouse state: whether the mouse is pressed down and its (x, y) coordinates
  mouse: { down: false, x: 0, y: 0 },

  // Object to track touch input state: whether the screen is touched and the coordinates of the first touch point
  touch: { down: false, x: 0, y: 0 },

  // Object to track gamepad input: states of buttons and positions of analog axes
  gamepad: { buttons: [], axes: [] },

  // Function to update the gamepad state by polling the navigator.getGamepads() API
  updateGamepad: function() {
    if (navigator.getGamepads) {
      let gamepads = navigator.getGamepads(); // Retrieve connected gamepads
      if (gamepads[0]) { // If at least one gamepad is connected, use the first one
        let gp = gamepads[0];
        // Update gamepad button states: true if pressed, false otherwise
        this.gamepad.buttons = gp.buttons.map(button => button.pressed);
        // Update gamepad axes states by creating a copy of the axes array
        this.gamepad.axes = gp.axes.slice();
      }
    }
  }
};

// Event listener for keydown events: mark the specific key as pressed
document.addEventListener("keydown", function(e) {
  Controller.keys[e.code] = true;
});

// Event listener for keyup events: mark the specific key as released
document.addEventListener("keyup", function(e) {
  Controller.keys[e.code] = false;
});

// Event listener for mousedown events: mark mouse as pressed and record the current cursor position
document.addEventListener("mousedown", function(e) {
  Controller.mouse.down = true;
  Controller.mouse.x = e.clientX;
  Controller.mouse.y = e.clientY;
});

// Event listener for mouseup events: mark mouse as no longer pressed
document.addEventListener("mouseup", function(e) {
  Controller.mouse.down = false;
});

// Event listener for mousemove events: update mouse coordinates based on cursor movement
document.addEventListener("mousemove", function(e) {
  Controller.mouse.x = e.clientX;
  Controller.mouse.y = e.clientY;
});

// Event listener for touchstart events: mark touch as active and record the first touch point's position
document.addEventListener("touchstart", function(e) {
  Controller.touch.down = true;
  if(e.touches.length > 0) {
    let touch = e.touches[0];
    Controller.touch.x = touch.clientX;
    Controller.touch.y = touch.clientY;
  }
  e.preventDefault(); // Prevent default behavior (like scrolling)
}, {passive: false});

// Event listener for touchmove events: update touch coordinates as the touch point moves
document.addEventListener("touchmove", function(e) {
  if(e.touches.length > 0) {
    let touch = e.touches[0];
    Controller.touch.x = touch.clientX;
    Controller.touch.y = touch.clientY;
  }
  e.preventDefault();
}, {passive: false});

// Event listener for touchend events: mark touch as no longer active
document.addEventListener("touchend", function(e) {
  Controller.touch.down = false;
  e.preventDefault();
}, {passive: false});

// Event listener for gamepad connection: log when a gamepad is connected
window.addEventListener("gamepadconnected", function(e) {
  console.log("Gamepad connected:", e.gamepad.id);
});

// Event listener for gamepad disconnection: log when a gamepad is disconnected
window.addEventListener("gamepaddisconnected", function(e) {
  console.log("Gamepad disconnected:", e.gamepad.id);
});

// Continuously poll the gamepad state using requestAnimationFrame for smooth updates
(function pollGamepad(){
  Controller.updateGamepad();
  requestAnimationFrame(pollGamepad);
})();
