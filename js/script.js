let sparkInterval;

function spark(e, opt_properties) {
	let mouseX, mouseY;
	let event = e;
	if (e) {
		event = e.type === "touchmove" ? e.touches[0] : e; // Handle touch events
		mouseX = event.pageX || (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
		mouseY = event.pageY || (event.clientY + document.body.scrollTop + document.documentElement.scrollTop);
	} else {
		mouseX = opt_properties.mouseX;
		mouseY = opt_properties.mouseY;
	}

	const defaultProperties = { color: 'white', mouseX: mouseX, mouseY: mouseY, hw: 30, sparks: 8, sw: 8, time: 400 };
	const c = Object.assign(defaultProperties, opt_properties);
	const col = c.color;

	function createSparkle(delay) {
		setTimeout(() => {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 100 100");
			svg.setAttribute("style", `position: absolute; height: ${c.hw}px; width: ${c.hw}px; transform: translate(-50%,-50%); left: ${c.mouseX}px; top: ${c.mouseY}px; z-index: 99999`);
			
			for (let i = 0; i < c.sparks; i++) {
				svg.insertAdjacentHTML('afterbegin', `<path d="M50 50 50 ${50 - c.sw/2}" stroke="${col}" stroke-linecap="round" stroke-width="${c.sw}" fill="none" transform="rotate(${((360 / c.sparks) * i) - (180 / c.sparks)} 50 50)"><animate attributeName="d" values="M50 50 50 ${50 - c.sw/2}; M50 ${50 - c.sw} 50 ${c.sw/2}; M50 ${c.sw/2} 50 ${c.sw/2}" dur="${c.time}ms" begin="0s" repeatCount="0" fill="freeze" /></path>`);
			}

			document.body.appendChild(svg);
			setTimeout(() => svg.remove(), c.time); // Remove after animation

		}, delay);
	}

	// Create the sparkle initially and then three more times
	createSparkle(0);
	createSparkle(100); // Delay for 100ms
	createSparkle(200); // Delay for 200ms
	createSparkle(300); // Delay for 300ms
}

document.addEventListener("click", (event) => {
	spark(event, { color: 'white', hw: 60 });
	clearInterval(sparkInterval);
});

document.addEventListener("mousemove", (event) => {
	spark(event, { color: 'white' });
	clearInterval(sparkInterval);
});

document.addEventListener("touchmove", (event) => {
	const touch = event.touches[0]; // Get the first touch point
	const x = touch.clientX; // Get the x coordinate relative to the viewport
	const y = touch.clientY; // Get the y coordinate relative to the viewport
	spark({ x, y }, { color: 'white' });
	clearInterval(sparkInterval);
});

function infiniteSparkle() {
	sparkInterval = setInterval(() => {
		const boundingBox = document.getElementById('getMe').getBoundingClientRect();
		spark(null, { color: 'white', mouseX: boundingBox.left + window.scrollX, mouseY: boundingBox.top + window.scrollY });
	}, 50);
}

infiniteSparkle();
