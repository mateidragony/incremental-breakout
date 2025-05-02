'use strict'

import { Canvas } from './canvas.js'
import { State, Tile, Wall, Ball, Brick } from './objects.js'


class Game {
	canvas  : Canvas
	tile_sz : number
	tilemap : Tile[][]
	balls   : Ball[]
	walls   : Wall[]
	bricks  : Brick[]
	level   : number
	
	constructor(canvas : Canvas) {
		this.canvas = canvas
		this.level = 0
		this.tile_sz = 12
		this.tilemap = []
		this.init_tilemap()
		this.walls = []
		this.init_walls()
		this.bricks = []
		this.init_bricks()
		
		this.balls = []
		for (let i=0; i!=10; ++i) {
			this.balls.push(new Ball(30, 30, "yellow"))
		}
	}

	init_tilemap() {
		const rows = this.canvas.height/this.tile_sz
		const cols = this.canvas.width/this.tile_sz
		for (let i=0; i!=rows; ++i) {
			this.tilemap[i] = []
			for (let j=0; j!=cols; ++j) {
				this.tilemap[i][j] = new Tile(null)
			}
		}
	}

	init_walls() {
		this.walls.push(new Wall(0, 0, 1, this.tilemap.length,
								 "black", this.tilemap, this.tile_sz))
		this.walls.push(new Wall(0, this.tilemap[0].length - 1, 1, this.tilemap.length,
								 "black", this.tilemap, this.tile_sz))
		this.walls.push(new Wall(0, 0, this.tilemap[0].length, 1,
								 "black", this.tilemap, this.tile_sz))
		this.walls.push(new Wall(this.tilemap.length - 1, 0, this.tilemap[0].length, 1,
								 "black", this.tilemap, this.tile_sz))
	}

	init_bricks() {
		let brick_w = 5
		let brick_h = 2

		// big middle block
		if (this.level % 4 == 0) {
			for (let i=9; i<22; ++i) {
				for (let j=4; j<14; ++j){
					this.bricks.push(new Brick(i * brick_h, j * brick_w, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}		
		}
		// 6 towers
		if (this.level % 4 == 1) {
			for (let r=0; r<2; ++r){
				for (let c=0; c<4; ++c) {
					for (let i = 4; i < 14; ++i) {
						for (let j = 2; j < 4; ++j) {
							this.bricks.push(new Brick((i + r * 14) * brick_h, (j + c * 4) * brick_w, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
						}
					}		

				}
			}

		}
		// 4 top to bottom
		if (this.level % 4 == 2) {
			for (let i=0; i<this.tilemap.length / brick_h - 1; ++i) {
				for (let j=0; j<2; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w + 1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=0; i<this.tilemap.length / brick_h - 1; ++i) {
				for (let j=16; j<18; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=0; i<this.tilemap.length / brick_h - 1; ++i) {
				for (let j=10; j<12; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-2, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=0; i<this.tilemap.length / brick_h - 1; ++i) {
				for (let j=7; j<9; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
		}
		// loss
		if (this.level % 4 == 3) {
			for (let i=0; i<this.tilemap.length / brick_h - 1; ++i) {
				for (let j=9; j<10; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=14; i<15; ++i) {
				for (let j=1; j<9; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=14; i<15; ++i) {
				for (let j=10; j<17; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=26; i<27; ++i) {
				for (let j=13; j<17; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=16; i<29; ++i) {
				for (let j=12; j<13; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=2; i<13; ++i) {
				for (let j=12; j<13; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=4; i<13; ++i) {
				for (let j=15; j<16; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=2; i<13; ++i) {
				for (let j=3; j<4; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=16; i<29; ++i) {
				for (let j=3; j<4; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}
			for (let i=16; i<29; ++i) {
				for (let j=6; j<7; ++j){
					this.bricks.push(new Brick(i * brick_h + 1, j * brick_w-1, brick_w, brick_h, this.level+1, this.tilemap, this.tile_sz))
				}
			}


		}
	}

	update() {
		for(let ball of this.balls) {
			ball.update(this.tilemap, this.tile_sz)
		}

		this.balls = State.remove_defunct(this.balls) as Ball[]
		this.bricks = State.remove_defunct(this.bricks) as Brick[]

		if (this.bricks.length == 0) {
			this.level++
			this.init_bricks()
		}
	}
	
	draw() {
		const ctx = this.canvas.ctx
		Canvas.fill_rect(0, 0, this.canvas.width, this.canvas.height, "gray", ctx, false)
		
		for (let ball of this.balls) {
			ball.draw(ctx)
		}

		for (let wall of this.walls) {
			wall.draw(ctx)
		}

		for (let brick of this.bricks) {
			brick.draw(ctx)
		}
	}
	
	run() {
		let game_interval = setInterval(() => {
			this.update()
			this.draw()
		}, 1000/60)
	}
}


export { Game }
