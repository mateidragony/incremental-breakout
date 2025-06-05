'use strict'

import { Canvas } from "./canvas.js"
import { Game } from "./game.js"

/**
 * State objects store what state a current object
 * is in. INUSE means that the object is currently
 * being used in animation or rendering. DEFUNCT
 * means the object is no longer used and should be
 * cleaned up.
 *
 * Every game object should extend state.
 */
class State {
	static INUSE   = 0
	static DEFUNCT = 1

	state : number

	constructor(state : number){
		this.state = state
	}

	static remove_defunct(states : State[]) : State[] {
		return states.filter(s => s.state != State.DEFUNCT)
	}
}

/**
 * A tile represents a single square in the game
 * grid (tile_map). Tiles are either occupied by
 * an object or are empty.
 */
class Tile extends State {
	object : Collider | null

	constructor(object : Collider | null) {
		super(State.INUSE)
		this.object = object
	}

	static set_tiles(tilemap : Tile[][], obj : Collider | null,
					 r : number, c : number, w : number, h : number) {
		for (let i=r; i!=r+h; ++i) {
			for (let j=c; j!=c+w; ++j) {
				tilemap[i][j].object = obj
			}
		}
	}
}

/**
 * A collider is an object that can collide with
 * other objects. Collider provides a detect_collision
 * method which returns true or false based off of
 * whether an object is colliding with this.
 */
class Collider extends State {
	x : number
	y : number
	w : number
	h : number

    constructor(x : number, y : number, w : number, h : number){
		super(State.INUSE)
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    detect_collision(rect : Collider){
		let this_left  = this.x - this.w/2
		let this_right = this.x + this.w/2
		let this_top   = this.y - this.h/2
		let this_bot   = this.y + this.h/2

		let rect_left  = rect.x - rect.w/2
		let rect_right = rect.x + rect.w/2
		let rect_top   = rect.y - rect.h/2
		let rect_bot   = rect.y + rect.h/2

        return this_left < rect_right && this_right > rect_left &&
    		   this_top  < rect_bot   && this_bot   > rect_top
    }

	collided_obj(tilemap: Tile[][], tile_sz: number): Collider | null {
		let left_tile = Math.max(Math.floor((this.x - this.w / 2) / tile_sz), 0)
		let right_tile = Math.min(Math.floor((this.x + this.w / 2) / tile_sz), tilemap[0].length - 1)
		let top_tile = Math.max(Math.floor((this.y - this.h / 2) / tile_sz), 0)
		let bottom_tile = Math.min(Math.floor((this.y + this.h / 2) / tile_sz), tilemap.length - 1)

		for (let i = left_tile; i <= right_tile; ++i) {
			for (let j = top_tile; j <= bottom_tile; ++j) {
				let tile = tilemap[j][i];
				if (tile.object != null && this.detect_collision(tile.object)) {
					return tile.object
				}
			}
		}
		return null
	}
}

/**
 * A tiled collider is a collider that lies in the
 * tile map. Tiled colliders by default will own
 * the tiles they are placed in.
 */
class TiledCollider extends Collider {
	r : number
	c : number
	tile_w : number
	tile_h : number

	constructor(r : number, c : number, w : number, h : number,
				tilemap : Tile[][], tile_sz : number, own_tiles=true) {
		super((c + w / 2) * tile_sz, (r + h / 2) * tile_sz, w*tile_sz, h*tile_sz)
		this.tile_w = w
		this.tile_h = h
		this.r = r
		this.c = c

		if (own_tiles) {
			Tile.set_tiles(tilemap, this, this.r, this.c, this.tile_w, this.tile_h)
		}
	}
}

/**
 * Walls are unbreakble colliders in the game. They are
 * mainly used to contrain the balls within the boundary
 * of the canvas. Walls lie in the tilemap and can span
 * over multiple tiles.
 */
class Wall extends TiledCollider {
	color : string

	constructor(r : number, c : number, w : number, h : number,
				color : string, tilemap : Tile[][], tile_sz : number) {
		super(r, c, w, h, tilemap, tile_sz)
		this.color = color
	}

	draw(ctx : CanvasRenderingContext2D) {
		Canvas.fill_rect(this.x, this.y, this.w, this.h, this.color, ctx)
	}
}

/**
 * Bricks are the ingame bricks which appear on the
 * screen and get broken by balls. Bricks lie in the
 * tile map and can span over multiple tiles.
 */
class Brick extends TiledCollider {
	num : number

	constructor(r : number, c : number, w : number, h : number,
				num : number, tilemap : Tile[][], tile_sz : number) {
		super(r, c, w, h, tilemap, tile_sz)
		this.num = num
	}

	hit(damage : number, tilemap : Tile[][], game : Game) {
		damage = Math.min(this.num, damage)
		this.num -= damage
		game.money += damage
		if (this.num == 0) {
			game.bricks_broken++
			this.state = State.DEFUNCT
			Tile.set_tiles(tilemap, null, this.r, this.c, this.tile_w, this.tile_h)
		}
	}

	draw(ctx : CanvasRenderingContext2D) {
		let gap = 4
		let color = `hsl(${this.num*30 + 30}, 100%, 70%)`
		Canvas.draw_rect(this.x, this.y, this.w-gap, this.h-gap, 'black', ctx, true, 3, 2)
		Canvas.fill_rect(this.x, this.y, this.w-gap, this.h-gap, color, ctx, true, 2)
		Canvas.draw_text(this.x, this.y, 15, `${this.num}`, 'black', ctx)
	}
}

/**
 * Balls are the balls that move around on the screen and
 * damage bricks. Balls can move freely and collide with
 * the edge of the canvas and bricks.
 */
class Ball extends Collider {
	color  : string
	size   : number
	speed  : number
	dx     : number
	dy     : number
	damage : number

	constructor(x : number, y : number, color : string, damage : number, speed : number, size=10) {
		super(x, y, size*2, size*2)
		this.x = x
		this.y = y
		this.color = color
		this.size = size

		this.speed = speed
		let dangle = Math.random() * Math.PI * 2
		this.dx = Math.cos(dangle)
		this.dy = Math.sin(dangle)

		this.damage = damage
	}
	
	draw(ctx : CanvasRenderingContext2D) : void {
		Canvas.fill_circle(this.x, this.y, this.size, this.color, ctx)
		Canvas.draw_circle(this.x, this.y, this.size, "black", ctx)
	}

	update(tilemap : Tile[][], tile_sz : number, game : Game) : void {
        const num_steps = this.speed
        let dx_step = this.dx * this.speed / num_steps
        let dy_step = this.dy * this.speed / num_steps

		let collided_x, collided_y = false;
		
        for(let i=0; i!=num_steps; ++i){
			let tile_obj : Collider | null;

            this.x += dx_step
			tile_obj = this.collided_obj(tilemap, tile_sz)
			if (tile_obj != null && !collided_x) {
				collided_x = true
				this.x -= dx_step
				this.dx = -this.dx
			}

			if (tile_obj instanceof Brick) {
				tile_obj.hit(this.damage, tilemap, game)
			}
			
			this.y += dy_step
			tile_obj = this.collided_obj(tilemap, tile_sz)
			if (tile_obj != null && !collided_y) {
				this.y -= dy_step
				this.dy = -this.dy
				collided_y = true
			}

			if (tile_obj instanceof Brick) {
				tile_obj.hit(this.damage, tilemap, game)
			}

			if (collided_x || collided_y) break;
		}
	}
}

class Cursor extends Collider {
	pressed : boolean

	constructor() {
		super(0, 0, 10, 10)
		this.pressed = false
	}

	draw(ctx : CanvasRenderingContext2D) : void {
		Canvas.fill_circle(this.x, this.y, 10, "red", ctx)
	}
}


export { State, Tile, Wall, Brick, Ball, Cursor }
