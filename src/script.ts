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
	UP = 1,
	DOWN = -1,
	RIGHT = 2,
	LEFT = -2,
}

interface Line {
	config: LineConfig;
	frontPoint: Position;
	points: Position[];
}

interface LineConfig {
	currentDirection: Direction;
	initialDirection: Direction;
	color: string;
}

interface Position {
	x: number;
	y: number;
}

class GridLines {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private height: number;
	private width: number;
	private pxR: number;
	private squareSize: number;
	private numCols: number;
	private numRows: number;
	private config: Config;

	public lines: Line[] = [];

	constructor(canvas: HTMLCanvasElement, Config: Config) {
		this.config = Config;
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.defineSettings();

		window.requestAnimationFrame(this.draw.bind(this));

		const registeredCallback = Utils.throttle(this.createLines.bind(this), 10);
		canvas.addEventListener("mousemove", registeredCallback);

		/*
		// @ts-ignore FIXME: for test
		registeredCallback({
			offsetX: 500,
			offsetY: 500,
		});
		*/
	}

	private createLines(event: MouseEvent) {
		const direction = this.pickDirection(); // initial direction will be recomputed on first exec
		const initialPos = this.findClosestPoint(event);

		this.lines.push({
			config: {
				color: this.pickColor(),
				currentDirection: direction,
				initialDirection: direction,
			},
			frontPoint: initialPos,
			points: [],
		});
	}

	private pickDirection(notAvailablesDirections: Direction[] = []): Direction {
		const availablesDirections = new Set([Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP]);
		notAvailablesDirections.forEach((direction) => availablesDirections.delete(direction));
		return Array.from(availablesDirections)[Math.floor(Math.random() * availablesDirections.size)];
	}

	private pickColor(): string {
		return this.config.linesColor[Math.floor(Math.random() * this.config.linesColor.length)];
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

		canvas.style.backgroundColor = this.config.backgroundColor;
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

	private isPointOnCross(pos: Position): boolean {
		const isXCrossing = Number.isInteger(pos.x / this.squareSize);
		const isYCrossing = Number.isInteger(pos.y / this.squareSize);
		return isXCrossing && isYCrossing;
	}

	private updateFrontPosition(point: Position, direction: Direction): void {
		switch (direction) {
			case Direction.DOWN:
				point.y += this.config.speed;
				break;
			case Direction.UP:
				point.y -= this.config.speed;
				break;
			case Direction.RIGHT:
				point.x += this.config.speed;
				break;
			case Direction.LEFT:
				point.x -= this.config.speed;
				break;
		}
	}

	private updateLine(line: Line): void {
		if (this.isPointOnCross(line.frontPoint)) {
			line.points.unshift({ ...line.frontPoint });
			line.config.currentDirection = this.pickDirection([
				line.config.initialDirection,
				line.config.currentDirection * -1,
			]);
		}
		this.updateFrontPosition(line.frontPoint, line.config.currentDirection);

		let currentLineLength = 0;
		for (const key in line.points) {
			const index = parseInt(key);
			const point = line.points[index];

			const previousPoint = index === 0 ? line.frontPoint : line.points[index - 1];

			const addedLength = Math.abs(
				point.x === previousPoint.x ? previousPoint.y - point.y : previousPoint.x - point.x
			);

			if (currentLineLength + addedLength > this.config.lineLength) {
				line.points = line.points.slice(0, index);

				const remainingLength = this.config.lineLength - currentLineLength;

				let nextX = previousPoint.x;
				let nextY = previousPoint.y;
				if (previousPoint.x === point.x) {
					nextY += point.y > previousPoint.y ? remainingLength : remainingLength * -1;
				} else if (previousPoint.y === point.y) {
					nextX += point.x > previousPoint.x ? remainingLength : remainingLength * -1;
				}

				line.points.push({ x: nextX, y: nextY });
				break;
			}

			currentLineLength += addedLength;
		}
	}

	private drawLines() {
		this.lines.forEach((line) => {
			this.updateLine(line);

			this.ctx.beginPath();
			this.ctx.moveTo(line.frontPoint.x, line.frontPoint.y);

			line.points.forEach((pos) => {
				this.ctx.lineTo(pos.x, pos.y);
			});

			this.ctx.strokeStyle = line.config.color;
			this.ctx.lineWidth = 3;
			this.ctx.stroke();
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
new GridLines(canvas, {
	backgroundColor: "#181818",
	gridColor: "#49bf5d80",
	linesColor: ["#49bf5dcf", "#1fa936cf", "#0b5217cf", "#2dab1acf", "#3aab1acf"],
	speed: 10,
	lineLength: 110,
});

// FIXME:
// - remove line when they are out of the canvas
