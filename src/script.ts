// Inspired by https://github.com/robertcoopercode/animated-grid-lines

import Stats from "stats.js";
import Utils from "./Utils";

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

interface Config {
	backgroundColor: string;
	gridColor: string;
	linesColor: string[];
	speed: number;
	lineLength: number;
}

enum Direction {
	UP,
	DOWN,
	RIGHT,
	LEFT,
}

interface Line {
	pos: Position;
	currentDirection: Direction;
	initialDirection: Direction;
	color: string;
}

interface Position {
	x: number;
	y: number;
}

class Canvas {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private height: number;
	private width: number;
	private pxR: number;
	private squareSize: number;
	private numCols: number;
	private numRows: number;
	private config: Config;

	private lines: Line[] = [];

	constructor(canvas: HTMLCanvasElement, Config: Config) {
		this.config = Config;
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.defineSettings();

		window.requestAnimationFrame(this.draw.bind(this));

		this.lines.push({
			pos: { x: 50, y: 250 },
			currentDirection: Direction.RIGHT,
			initialDirection: Direction.RIGHT,
			color: "red",
		});

		const registeredCallback = Utils.throttle(this.createLines.bind(this), 20);
		canvas.addEventListener("mousemove", registeredCallback);
	}

	private createLines(event: MouseEvent) {
		const direction = this.pickDirection();
		this.lines.push({
			pos: this.findClosestPoint(event),
			color: this.config.linesColor[
				Math.floor(Math.random() * this.config.linesColor.length)
			],
			currentDirection: direction,
			initialDirection: direction,
		});
	}

	private pickDirection(
		availablesDirections: Direction[] = [
			Direction.DOWN,
			Direction.LEFT,
			Direction.RIGHT,
			Direction.UP,
		]
	): Direction {
		return Direction.UP;
	}

	private findClosestPoint(event: MouseEvent): Position {
		const x = Math.round(event.offsetX / this.squareSize) * this.squareSize * this.pxR;
		const y = Math.round(event.offsetY / this.squareSize) * this.squareSize * this.pxR;
		return { x, y };
	}

	private defineSettings(): void {
		this.pxR = window.devicePixelRatio || 1;
		console.log("pxR", this.pxR);
		this.height = window.innerHeight * this.pxR;
		this.width = window.innerWidth * this.pxR;

		this.canvas.height = this.height;
		this.canvas.width = this.width;

		this.squareSize = 40 * this.pxR;
		this.numCols = Math.round(this.width / this.squareSize);
		this.numRows = Math.round(this.height / this.squareSize);
	}

	private drawGrid(): void {
		this.ctx.beginPath();

		for (let lineCol = 0; lineCol <= this.numCols; lineCol += 1) {
			this.ctx.moveTo(lineCol * this.squareSize, 0);
			this.ctx.lineTo(lineCol * this.squareSize, this.height);
		}

		for (let lineRow = 0; lineRow <= this.numRows; lineRow += 1) {
			this.ctx.moveTo(0, lineRow * this.squareSize);
			this.ctx.lineTo(this.width, lineRow * this.squareSize);
		}

		this.ctx.strokeStyle = this.config.gridColor;
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
	}

	private drawLines() {
		this.lines.forEach((line) => {
			this.ctx.beginPath();
			this.ctx.moveTo(line.pos.x, line.pos.y);
			this.ctx.lineTo(
				line.pos.x + this.config.lineLength,
				line.pos.y + this.config.lineLength
			);
			this.ctx.strokeStyle = line.color;
			this.ctx.lineWidth = 2;
			this.ctx.stroke();

			line.pos.x += this.config.speed;
		});
	}

	private draw(): void {
		stats.begin();
		this.ctx.clearRect(0, 0, this.width, this.height);

		this.drawGrid();
		this.drawLines();

		stats.end();
		window.requestAnimationFrame(this.draw.bind(this));
	}
}

/* :) */

const canvas = document.querySelector("canvas");
new Canvas(canvas, {
	backgroundColor: "#3c3c3c",
	gridColor: "blue",
	linesColor: ["green", "purple", "pink"],
	speed: 5,
	lineLength: 20,
});
