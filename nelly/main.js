const unreachable = () => console.assert("false");

// lcg á la Beltramelli
const mkRand = (seed) => {
	seed || unreachable();

	// https://en.wikipedia.org/wiki/Linear_congruential_generator#m_a_power_of_2,_c_=_0
	let m = Math.pow(2, 32);
	let a = 1103515245;
	let c = 12345;
	let z = seed;

	return () => {
		z = (a * z + c) % m;
		return z / m;
	};
};

const mkHex = (rand) => {
	rand || unreachable();
	const allHex = "0123456789ABCDEF";
	let out = "#";
	for(let i = 0; i < 6; ++i) {
		out += allHex.charAt(Math.floor(rand() * allHex.length));
	}
	return out;
};

const getSources = (id) => {
	const c = document.getElementById(id) || unreachable();
	const n_children = c.children.length;
	let srcs = [];
	for(let i = 0; i < n_children; ++i) {
		srcs.push(c.children[i]);
	}
	return srcs;
};

const mkButton = (n) => {
	const outer = document.createElement("div");
	const inner = document.createElement("div");
	const rand = mkRand(n);

	const deg = Math.floor(rand() * 360);
	const from = mkHex(rand);
	const to = mkHex(rand);
	const gradient = `linear-gradient(${deg}deg, ${from}, ${to})`;
	console.log(gradient);

	inner.className = "button";
	inner.style.background = gradient;
	console.log(inner);
	outer.className = "button-grid-element";
	outer.appendChild(inner);

	return outer;
};

const addButtons = (sources) => {
	const grid = document.getElementById("button-grid") || unreachable();
	for(const [idx, src] of Object.entries(sources)) {
		let el = mkButton(idx);
		el.onclick = () => {
			src.play();
		};
		grid.appendChild(el);
	}
};

const init = () => {
	const sources = getSources("audio") || unreachable();
	addButtons(sources);
};
