const size = 9
const nGroups = 3
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const w = canvas.width - 2
const h = canvas.height - 2
const tw = w / nGroups
const th = h / nGroups
const ttw = tw / nGroups
const tth = th / nGroups
const tttw = ttw / nGroups
const ttth = tth / nGroups

var table = [[]]
var annotations = []
var selected = null

const init = () => {
	document.getElementById("load-from-file").addEventListener(
		"change",
		loadFromFile,
		false,
	)
	canvas.addEventListener("mousedown", selectCell);
	canvas.addEventListener("contextmenu", selectCell);
	document.addEventListener("keydown", onKeyPress);
	startGame()
}

const renderBoard = () => {
	renderBoardBackground()
	renderBoardNumbers()
	renderAnnotations()
}

const renderBoardBackground = () => {

	ctx.fillStyle = "#FFF"
	ctx.fillRect(0, 0, w + 2, h + 2)

	if(selected != null) {
		ctx.fillStyle = "#DDD"
		const x = selected.x
		const y = selected.y

		const x0 = x * ttw
		const y0 = y * tth

		ctx.fillRect(x0, y0, ttw, tth)
	}

	ctx.fillStyle = "#000"
	ctx.lineWidth = 2

	for(var i = 0; i < nGroups + 1; i++) {
		ctx.beginPath()
		ctx.moveTo(0, 1 + i * th)
		ctx.lineTo(w + 2, 1 + i * th)
		ctx.stroke()

		ctx.beginPath()
		ctx.moveTo(1 + i * tw, 0)
		ctx.lineTo(1 + i * tw, h + 2)
		ctx.stroke()
	}


	ctx.lineWidth = 1

	for(var x = 0; x < nGroups; x++) {
		for(var y = 0; y < nGroups; y++) {
			const x0 = x * tw
			const x1 = (x + 1) * tw
			const y0 = y * th
			const y1 = (y + 1) * th

			for(var i = 0; i < nGroups * nGroups; i++) {
				ctx.beginPath()
				ctx.moveTo(x0, 1 + i * tth)
				ctx.lineTo(x1, 1 + i * tth)
				ctx.stroke()

				ctx.beginPath()
				ctx.moveTo(1 + i * ttw, y0)
				ctx.lineTo(1 + i * ttw, y1)
				ctx.stroke()
			}
		}
	}
}

const renderBoardNumbers = () => {
	ctx.fillStyle = "#000"
	ctx.font = "50px Calibri, sans-serif"
	for(var x = 0; x < size; x++) {
		for(var y = 0; y < size; y++) {
			var cell = tableGet(x, y)
			if(cell == null) {
				continue
			}
			const bounds = ctx.measureText(cell)
			const ox = 1 + ttw / 2 - bounds.width / 2
			ctx.fillText(cell, ox + x * ttw, 64 + y * tth)
		}
	}
}

const renderAnnotations = () => {
	ctx.fillStyle = "#777"
	ctx.font = "24px Calibri, sans-serif"
	for(var i = 0; i < annotations.length; i++) {
		var annotation = annotations[i]
		var x = annotation.x
		var y = annotation.y
		for(var j = 0; j < annotation.guesses.length; j++) {
			var guess = annotation.guesses[j]
			var ox = x * ttw + 10
			var oy = y * tth + 23
			switch(guess) {
				case 1:
					break
				case 2:
					ox += 30
					break
				case 3:
					ox += 60
					break
				case 4:
					oy += 30
					break
				case 5:
					ox += 30
					oy += 30
					break
				case 6:
					ox += 60
					oy += 30
					break
				case 7:
					oy += 60
					break
				case 8:
					ox += 30
					oy += 60
					break
				case 9:
					ox += 60
					oy += 60
					break
				default:
					alert("Something's wrong, I can feel it")
			}
			ctx.fillText(guess, ox, oy)
		}
	}
}

const selectCell = (e) => {
	e.preventDefault()
	const rect = canvas.getBoundingClientRect()
	var x = e.clientX - rect.left
	var y = e.clientY - rect.top
	x = Math.floor(x / ttw)
	y = Math.floor(y / tth)
	selected = {
		x: x,
		y: y,
		type: e.button == 0 ? "number" : "annotation",
	}
	renderBoard()
}

const onKeyPress = (e) => {
	if(selected == null) {
		return
	}
	const key = e.key
	switch(key) {
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			break;
		default:
			return
	}
	e.preventDefault()

	const x = selected.x
	const y = selected.y
	if(selected.type == "number") {
		tableSet(x, y, parseInt(key))
	} else if(selected.type == "annotation") {
		var i = annotations.findIndex(a => a.x == x && a.y == y)
		if(i != -1) {
			var a = annotations[i]
			var g = a.guesses.findIndex(g => g == parseInt(key))
			if(g != -1) {
				a.guesses.splice(g, 1)
			} else {
				a.guesses.push(parseInt(key))
			}
		} else {
			annotations.push({
				x: x,
				y: y,
				guesses: [parseInt(key)],
			})
		}
	}
	renderBoard()
}

const makeTable = () => {
	/*
	const n = null
	var table = [
		[n, 1, 3, 6, n, 4, 7, n, 9],
		[n, 2, n, n, 9, n, n, n, 6],
		[7, n, n, n, n, n, n, n, 6],
		[2, n, 4, n, 3, n, 9, 8, n],
		[n, n, n, n, n, n, n, n, n],
		[5, n, n, 9, n, 7, n, n, 1],
		[6, n, n, n, 5, n, n, n, 2],
		[n, n, n, n, 7, n, n, n, n],
		[9, n, n, 8, n, 2, n, n, 5],
	]
	*/

	var table = Array(9).fill(null).map(() => Array(9).fill(null))
	return table
}

const htmlGet = (x, y) => {
	return document.getElementById(x + y * size)
}

const download = (data, filename, type) => {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

const saveToFile = () => {
	download(
		JSON.stringify({
			table: table,
			annotations: annotations,
		}), 
		"cordoku-" + new Date().toISOString() + ".json", 
		"text/plain")
}

const loadFromFile = (e) => {
	var file = e.target.files[0];
	if (!file) {
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e) {
		const bad = () => alert("Poor choice of file, my friend")
		var contents = e.target.result;
		var json = null
		try {
			json = JSON.parse(contents)
		} catch {
			bad()
			return
		}
		if(json == null || json == undefined) {
			bad()
			return
		}
		table = json.table
		annotations = json.annotations
		renderBoard()
	};
	reader.readAsText(file);
}

const tableGet = (x, y) => {
	return table[y][x]
}

const tableSet = (x, y, what) => {
	table[y][x] = what
}

const startGame = () => {
	table = makeTable()
	renderBoard()
	console.log(table)
}
