'use strict'

import { Canvas } from './canvas.js'
import { State, Tile, Wall, Ball, Brick, Cursor } from './objects.js'
import { DisplayUtils, CostBarUpgrade, BallUpgradeRow, SpecialUpgrade } from './components.js'

class Game {
	canvas        : Canvas
	cursor        : Cursor
	cursor_power  : number
	tile_sz : number
	tilemap : Tile[][]
	balls   : Ball[]
	walls   : Wall[]
	bricks  : Brick[]
	level   : number
	money   : number
	bricks_broken : number
	ball_level : number
	ball_speed : number
	
	ball_buy_button       : CostBarUpgrade
	ball_upgrade_button   : CostBarUpgrade
	ball_special_upgrades : SpecialUpgrade[]
	ball_upgrade_row      : BallUpgradeRow
	
	constructor(canvas : Canvas, cursor : Cursor) {
		this.canvas = canvas
		this.cursor = cursor

		this.cursor_power = 1
		this.money = 0
		this.bricks_broken = 0
		this.level = 0
		this.tile_sz = 12

		this.ball_level = 1
		this.ball_speed = 1

		this.ball_buy_button     = new CostBarUpgrade(25, 1.5, "Buy basic ball", null, 'basic_ball')
		this.ball_upgrade_button = new CostBarUpgrade(200, 2, "Power<br/>1 >> 2", "Level up", null)
		this.ball_special_upgrades = [new SpecialUpgrade('speed_upgrade', 0, 0),
									  new SpecialUpgrade('speed_upgrade', 100, 0),
									  new SpecialUpgrade('speed_upgrade', 100, 20)]
		this.ball_upgrade_row = new BallUpgradeRow('basic_ball', this.ball_upgrade_button, this.ball_special_upgrades)
		
		this.tilemap = []
		this.walls   = []
		this.bricks  = []
		this.balls   = []

		this.init_tilemap()
		this.init_walls()
		this.init_bricks()
		this.init_html()
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

	init_basic_ball_components() {
		document.querySelector('.ball-butts')!.appendChild(this.ball_buy_button.button);
		this.ball_buy_button.set_onclick(() => {
			this.balls.push(new Ball(this.canvas.width/2, this.canvas.height/2, "yellow", this.ball_level, this.ball_speed))
		}, this)

		
		this.ball_upgrade_row.update_level(this.ball_upgrade_row.level, {'Power':  this.ball_level, 'Speed': this.ball_speed})
		document.querySelector('.upgrades-modal')!.appendChild(this.ball_upgrade_row.container)
		this.ball_upgrade_button.set_onclick(() => {
			this.ball_level++
			this.balls.forEach(b => b.damage = this.ball_level)
			this.ball_upgrade_button.set_tooltip(`Power<br/>${this.ball_level} >> ${this.ball_level+1}`)
			this.ball_upgrade_row.update_level(this.ball_upgrade_row.level+1, {'Power':  this.ball_level, 'Speed': this.ball_speed})
		}, this)

		this.ball_special_upgrades.forEach(o => o.set_onclick(() => {
			this.ball_speed*=2
			this.balls.forEach(b => b.speed = this.ball_speed)
			this.ball_upgrade_row.update_level(this.ball_upgrade_row.level, {'Power':  this.ball_level, 'Speed': this.ball_speed})
		}, this))
	}

	init_tooltips() {
		const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
		// @ts-ignore
		[...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
	}
	
	init_modals() {		
		// @ts-ignore
		const upgrades = new bootstrap.Modal('#upgrades', {})
		const upgrades_butt = document.querySelector('button[data-bs-target="#upgrades"]')! as HTMLButtonElement
		// upgrades.show()
		upgrades_butt.onclick = () => upgrades.show()
		
	}

	init_html() {
		this.init_basic_ball_components()
		this.init_tooltips()
		this.init_modals()
	}
	
	click() {
		const obj = this.cursor.collided_obj(this.tilemap, this.tile_sz)
		if (obj instanceof Brick) {
			obj.hit(this.cursor_power, this.tilemap, this)
		}
	}
	
	update() {
		for(let ball of this.balls) {
			ball.update(this.tilemap, this.tile_sz, this)
		}

		this.balls = State.remove_defunct(this.balls) as Ball[]
		this.bricks = State.remove_defunct(this.bricks) as Brick[]

		if (this.bricks.length == 0) {
			this.level++
			this.init_bricks()
		}

		this.ball_special_upgrades.forEach(u => u.update(this.bricks_broken, this.level))
	}
	
	draw() {
		const ctx = this.canvas.ctx
		Canvas.fill_rect(0, 0, this.canvas.width, this.canvas.height, "gray", ctx, false)

		this.balls.forEach(b => b.draw(ctx))
		this.walls.forEach(w => w.draw(ctx))
		this.bricks.forEach(b => b.draw(ctx))
	}

	html_display() {
		// stats
		document.querySelector('.money .label')!.innerHTML  = `${DisplayUtils.numerical_string(this.money)}`
		document.querySelector('.bricks .label')!.innerHTML = `${DisplayUtils.numerical_string(this.bricks_broken)}`

		this.ball_buy_button.set_cost_bar(this.money)
		this.ball_upgrade_button.set_cost_bar(this.money)
	}
	
	run() {
		this.money = 999999999
		setInterval(() => {
			this.update()
			this.draw()
			this.html_display()
		}, 1000/60)
	}
}


export { Cursor, Game }
