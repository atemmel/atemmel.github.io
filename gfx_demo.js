"use strict";

const canvas = document.getElementById("draw");
const ctx = canvas.getContext("2d");

var dragOffset = {
	x: 0,
	y: 0,
};

var rotateX = 0;
var rotateY = Math.PI;
var mouseIsDown = false;
var perspective = Perspective(60, 0.1, 100);

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

function RotateX(angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);

	return NewMat4([
		1, 0,  0, 0,
		0, c, -s, 0,
		0, s,  c, 0,
		0, 0,  0, 1,
	]);
}

function RotateY(angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);

	return NewMat4([
		 c, 0, s, 0,
		 0, 1, 0, 0,
		-s, 0, c, 0,
		 0, 0, 0, 1,
	]);
}

function RotateZ(angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);

	return NewMat4([
		c, -s, 0, 0,
		s,  c, 0, 0,
		0,  0, 1, 0,
		0,  0, 0, 1,
	]);
}

function Rotate(x, y, z) {
	return Mat4MultiplyMat4(Mat4MultiplyMat4(RotateZ(z), RotateY(y)), RotateX(x));
}

function Zero() {
	return NewMat4(new Array(16).fill(0));
}

function Perspective(fov, near, far) {
	const s = 1.0 / Math.tan((fov/2) * (Math.PI / 180));
	const u = -far/(far - near);
	const v = -(far * near) / (far - near);
	return NewMat4([
		s, 0, 0,  0,
		0, s, 0,  0,
		0, 0, u, -1,
		0, 0, v, 0,
	]);
}

function Mat4MultiplyVec4(mat, vec) {
	var result = NewVec4(0, 0, 0, 0)
	for(var i = 0; i < 4; i++) {
		for(var j = 0; j < 4; j++) {
			result[i] += mat[i][j] * vec[j];
		}
	}
	return result;
}

function Mat4MultiplyMat4(lhs, rhs) {
	var result = Zero();
	for(var i = 0; i < 4; i++) {
		for(var j = 0; j < 4; j++) {
			for(var k = 0; k < 4; k++) {
				result[i][j] += lhs[i][k] * rhs[k][j];
			}
		}
	}
	return result;
}

function NewTransform(translate, scale, rotate) {
	return {
		translate: translate,
		scale: scale,
		rotate: rotate,
	};
}

function DoRegularTransform(transform) {
	var result = Identity();
	result = Mat4MultiplyMat4(result, transform.translate);
	result = Mat4MultiplyMat4(result, transform.rotate);
	result = Mat4MultiplyMat4(result, transform.scale);
	return result;
};

function DoInplaceTransform(transform, perspective) {
	var result = Identity();
	result = Mat4MultiplyMat4(result, transform.scale);
	result = Mat4MultiplyMat4(result, perspective);
	result = Mat4MultiplyMat4(result, transform.rotate);
	result = Mat4MultiplyMat4(result, transform.translate);
	return result;
}

function DrawLine(from, to) {
	ctx.beginPath();
	ctx.moveTo(from[0], from[1]);
	ctx.lineTo(to[0], to[1]);
	ctx.stroke();
}

function DrawPoints(points) {
	for(var i = 1; i < points.length; i++) {
		DrawLine(points[i - 1], points[i]);
	}
	DrawLine(points[points.length - 1], points[0]);
}

function DrawGrid(points) {
	for(var i = 0; i < points.length; i++) {
		DrawLine(points[i], points[i + 1]);
		i++;
	}
}

function DrawLegend(points) {
	ctx.strokeStyle = "#FF0000";
	DrawLine(points[0], points[1]);
	ctx.fillText('X', points[0][0], points[0][1]);
	ctx.strokeStyle = "#00FF00";
	DrawLine(points[2], points[3]);
	ctx.fillText('Y', points[2][0], points[2][1]);
	ctx.strokeStyle = "#0000FF";
	DrawLine(points[4], points[5]);
	ctx.fillText('Z', points[4][0], points[4][1]);
	ctx.strokeStyle = "#000000";
}

const legend = [
	NewVec4(1, 0, 0, 1),
	NewVec4(0, 0, 0, 1),
	NewVec4(0, 1, 0, 1),
	NewVec4(0, 0, 0, 1),
	NewVec4(0, 0, 1, 1),
	NewVec4(0, 0, 0, 1),
];

const box = [
	NewVec4(-1,  1,  1, 1),
	NewVec4( 1,  1,  1, 1),
	NewVec4( 1, -1,  1, 1),
	NewVec4(-1, -1,  1, 1),
	NewVec4(-1,  1,  1, 1),
	NewVec4(-1,  1, -1, 1),
	NewVec4(-1, -1, -1, 1),
	NewVec4(-1, -1,  1, 1),
	NewVec4( 1, -1,  1, 1),
	NewVec4( 1, -1, -1, 1),
	NewVec4( 1,  1, -1, 1),
	NewVec4(-1,  1, -1, 1),
	NewVec4(-1,  1,  1, 1),
	NewVec4(-1,  1, -1, 1),
	NewVec4(-1, -1, -1, 1),
	NewVec4( 1, -1, -1, 1),
	NewVec4( 1,  1, -1, 1),
	NewVec4( 1,  1,  1, 1),
];

const grid = function() {
	const n = 20;
	var arr = new Array(n * 4);
	const half = n / 2;
	for(var i = 0; i < arr.length / 4; i++) {
		arr[i * 4] = NewVec4(i - half, -1, -half, 1);
		arr[i * 4 + 1] = NewVec4(i - half, -1, half, 1);
		arr[i * 4 + 2] = NewVec4(-half, -1, i - half, 1);
		arr[i * 4 + 3] = NewVec4(half, -1, i - half, 1);
	}

	arr.push(NewVec4(half, -1, half, 1));
	arr.push(NewVec4(-half, -1, half, 1));
	arr.push(NewVec4(half, -1, half, 1));
	arr.push(NewVec4(half, -1, -half, 1));

	return arr;
}();

var cameraTransform = NewTransform(
	TranslateMat4(2, 2, 0), 
	Identity(), 
	Rotate(rotateY, rotateX, 0),
);

var legendTransform = NewTransform(
	Identity(), 
	ScaleMat4(50, 50, 50), 
	Identity(),
);

var boxTransform = NewTransform(
	TranslateMat4(600, 260, 0),
	ScaleMat4(40, 40, 40),
	Identity(),
);

var gridTransform = NewTransform(
	TranslateMat4(600, 260, 0),
	ScaleMat4(40, 40, 40),
	Identity(),
);

function TransformAndDrawLegend() {
	var transformPre = DoInplaceTransform(legendTransform, perspective);
	var transformPost = DoRegularTransform(cameraTransform);
	var transform = Mat4MultiplyMat4(transformPre, transformPost);
	var transformedLegend = Array.from(legend, point => Mat4MultiplyVec4(transform, point));
	DrawLegend(transformedLegend);
}

function TransformAndDrawBox() {
	var transformPre = DoRegularTransform(boxTransform);
	var transformPost = DoRegularTransform(cameraTransform);
	var transform = Mat4MultiplyMat4(transformPre, transformPost);
	var transformedBox = Array.from(box, point => Mat4MultiplyVec4(transform, point));
	DrawPoints(transformedBox);
}

function TransformAndDrawGrid() {
	var transformPre = DoRegularTransform(gridTransform);
	var transformPost = DoRegularTransform(cameraTransform);
	var transform = Mat4MultiplyMat4(transformPre, transformPost);
	var transformedGrid = Array.from(grid, point => Mat4MultiplyVec4(transform, point));
	DrawGrid(transformedGrid);
}

canvas.onmousedown = function(e){
    mouseIsDown = true;
	dragOffset.x = e.clientX;
	dragOffset.y = e.clientY;
}
canvas.onmouseup = function(){
    mouseIsDown = false;
}

canvas.onmousemove = function(e){
    if(!mouseIsDown) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var dx = e.pageX - dragOffset.x;
	var dy = e.pageY - dragOffset.y;

	dragOffset.x = e.pageX;
	dragOffset.y = e.pageY;

	rotateX += dx * 0.005;
	rotateY -= dy * 0.005;

	cameraTransform.rotate = Rotate(rotateY, rotateX, 0);

	TransformAndDrawBox();
	TransformAndDrawGrid();
	TransformAndDrawLegend();
    return false;
}

TransformAndDrawBox();
TransformAndDrawGrid();
TransformAndDrawLegend();
