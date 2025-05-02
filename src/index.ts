'use strict';

import { Canvas } from './canvas.js'
import { Game } from './game.js'

(function (){
	const canvasHTML = document.querySelector("canvas")
	if (canvasHTML == null) {
		console.error("Canvas not found")
		return
	}

	const ctx = canvasHTML.getContext("2d")
	if (ctx == null) {
		console.error("Canvas graphics context not found")
		return
	}

	const canvas = new Canvas(canvasHTML.width, canvasHTML.height, ctx)
	const game = new Game(canvas)
	game.run()
})()
