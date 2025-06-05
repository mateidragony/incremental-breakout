'use strict';

import { Canvas } from './canvas.js'
import { Cursor, Game } from './game.js'

(function (){
	const canvasHTML = document.querySelector("canvas")!
	const ctx = canvasHTML.getContext("2d")!

	const canvas = new Canvas(canvasHTML.width, canvasHTML.height, ctx)
	const cursor = new Cursor()
	const game = new Game(canvas, cursor)

	canvasHTML.onmousemove = (e : MouseEvent) => {
		const rect = canvasHTML.getBoundingClientRect()
		let x = (e.clientX - rect.left) / rect.width * canvas.width
		let y = (e.clientY - rect.top) / rect.height * canvas.height
		cursor.x = x
		cursor.y = y
	}

	canvasHTML.onclick = () => game.click()
	canvasHTML.onmousedown = () => cursor.pressed = true
	canvasHTML.onmouseup   = () => cursor.pressed = false
	
	game.run()
})()
