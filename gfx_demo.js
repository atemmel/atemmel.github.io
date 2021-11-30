"use strict";

const canvas = document.getElementById("draw");
const ctx = canvas.getContext("2d");

function NewMat4(values) {
	if(values.length != 16) {
		throw "Length of values to construct matrix from must be 16";
	}

	return [ 
			values.splice(0, 4), 
			values.splice(0, 4), 
			values.splice(0, 4),
			values.splice(0, 4),
		];
}

function NewVec4(x, y, z, w) {
	return [x, y, z, w];
}

function ScaleMat4(sx, sy, sz) {
	return NewMat4([
		sx, 0,  0,  0,
		0,  sy, 0,  0,
		0,  0,  sz, 0,
		0,  0,  0,  1,
	]);
}

function TranslateMat4(tx, ty, tz) {
	return NewMat4([
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1,
	]);
}

function Identity() {
	return NewMat4([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1,
	]);
}

function Mat4MultiplyVec4(mat, vec) {
	var result = NewVec4(0, 0, 0, 0)
	for(var i = 0; i < 4; i++) {
		result[i] = mat[0][i] * vec[0]
			+ mat[1][i] * vec[1];
		 	+ mat[2][i] * vec[2];
		 	+ mat[3][i] * vec[3];
	}
	return result;
}

var plane = [
	NewVec4(-1,  1, 0, 1),
	NewVec4( 1,  1, 0, 1),
	NewVec4( 1, -1, 0, 1),
	NewVec4(-1, -1, 0, 1),
];

function drawLine(from, to) {
	ctx.beginPath();
	ctx.moveTo(from[0], from[1]);
	ctx.lineTo(to[0], to[1]);
	ctx.stroke();
}

var scaleMat = ScaleMat4(200, 200, 100);
var renderedPlane = Array.from(plane, point => Mat4MultiplyVec4(scaleMat, point));

var translateMat = TranslateMat4(100, 100, 0);
console.log(translateMat);

for(var i = 1; i < renderedPlane.length; i++) {
	drawLine(renderedPlane[i - 1], renderedPlane[i]);
}
