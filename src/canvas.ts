'use strict';

class Canvas {
	width : number
	height : number
	ctx : CanvasRenderingContext2D

	constructor(width : number, height : number, ctx : CanvasRenderingContext2D) {
		this.width = width
		this.height = height
		this.ctx = ctx
	}

	static draw_circle(x : number, y : number, r : number,
					   color : string, ctx : CanvasRenderingContext2D,
					   line_width=1) {
		ctx.lineWidth = line_width
		ctx.strokeStyle = color
		ctx.beginPath()
		ctx.arc(x, y, r, 0, 2 * Math.PI)
		ctx.stroke()
	}

	
	static fill_circle(x : number, y : number, r : number,
					   color : string, ctx : CanvasRenderingContext2D) {
		ctx.fillStyle = color
		ctx.beginPath()
		ctx.arc(x, y, r, 0, 2 * Math.PI)
		ctx.fill()
	}

	static draw_rect(x : number, y : number, w : number, h : number,
					 color : string, ctx : CanvasRenderingContext2D,
					 centered=true, line_width=1, corner_radius=0) {
		x = centered ? x - w/2 : x
		y = centered ? y - h/2 : y
		ctx.lineWidth = line_width
		ctx.strokeStyle = color
		ctx.beginPath();
		ctx.roundRect(x, y, w, h, corner_radius);
		ctx.stroke();
	}

	static fill_rect(x : number, y : number, w : number, h : number,
					 color : string, ctx : CanvasRenderingContext2D,
					 centered=true, corner_radius=0) {
		x = centered ? x - w/2 : x
		y = centered ? y - h/2 : y
		ctx.fillStyle = color
		ctx.beginPath();
		ctx.roundRect(x, y, w, h, corner_radius);
		ctx.fill();
	}

	static draw_text(x : number, y : number, size : number, text : string,
					 color : string, ctx : CanvasRenderingContext2D,
					 centered=true) {
		let text_len = text.length * size
		let text_px_factor = 0.175 * size 
		
		x = centered ? x - text_len / 2 + text.length * text_px_factor : x
		y = centered ? y + size / 2 - text_px_factor : y
		ctx.font = `${size}px Monospace`
		ctx.fillStyle = color
		ctx.fillText(text, x, y)
	}
}

export { Canvas }
