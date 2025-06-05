import { Game } from './game.js'

/**
 * SVGManager is a static class that returns a string
 * representation of an svg element given the id for
 * that svg icon.
 */
class SVGManager {
	static get_svg_icon(svg_id : string) : string {
		switch (svg_id) {
			case 'basic_ball':
				return `<svg viewbox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
						  <g>
							<circle r="35" cx="49" cy="49" fill="yellow" stroke-width="8" stroke="black" />
						  </g>
						</svg>`
			case 'speed_upgrade':
				return `<svg viewbox="0 0 490 750" xmlns="http://www.w3.org/2000/svg">
                          <g>
                            <polygon points="0,332 245,82 490,332 413,407 245,235 76,407" />
                            <polygon points="0,602 245,352 490,602 413,677 245,505 76,677" />
                          </g>
                        </svg>`
			default:
				console.error('unkown svg id.')
				return ``
		}
	}
}

/**
 * DisplayUntils is a static class that provides utility
 * methods for displaying content.
 */
class DisplayUtils {
	private static reduce_number(num : number, exp : number) : string {
		let num_str : string = (num / Math.pow(10, exp)).toFixed(0)
		return num_str.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // add commas
	}
	
	static numerical_string(num : number) : string {
		const base_letters = ['K', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'O', 'N', 'd', 'U', 'D']
		const base : number = Math.log(num) / Math.log(10) 
		if (base > 42)     return num.toExponential(4)
		else if (base < 5) return this.reduce_number(num, 0)
		else               return this.reduce_number(num, Math.floor((base-2) / 3) * 3) + base_letters[Math.floor((base-5) / 3)]
	}
}

/**
 * Cost bar upgrades are buttons which have a green
 * bar that indicates how close the player is to be
 * able to purchase the upgrade.
 */
class CostBarUpgrade {
	
	icon      : string | null
	label     : string | null
	cost      : number
	cost_mult : number
	button!   : HTMLButtonElement

	constructor(cost : number, cost_mult : number, tooltip : string,
				label : string | null = null, icon : string | null = null) {
		this.cost = cost
		this.cost_mult = cost_mult
		this.label = label
		this.icon = icon
		this.button = document.createElement('button')
		this.button.classList.add('upgrade')
		this.button.setAttribute("data-bs-toggle", "tooltip")
		this.button.setAttribute("data-bs-placement", "top")
		this.button.setAttribute("data-bs-custom-class", "upgrade-tooltip")
		this.button.setAttribute("data-bs-html", "true")
		this.button.setAttribute("data-bs-title", tooltip)
		this.init_html()
	}	
	
	init_html() {
		let label : string
		if (this.icon == null) {
			label = `<p class="label">${this.label}</p>`
		} else {
			label = `<div class="img">${SVGManager.get_svg_icon(this.icon)}</div>`
		}

		this.button.innerHTML = `
        ${label}
        <div class="cost">
          <div class="cost-bar"></div>
          <p class="cost-label">$${this.cost}</p>
        </div>`		
	}

	update_cost(cost : number) {
		this.cost = cost
		this.button.querySelector('.cost .cost-label')!.innerHTML = `$${DisplayUtils.numerical_string(this.cost)}`
	}
	
	set_cost_bar(money : number) {
		const bar : HTMLElement = this.button.querySelector('.cost .cost-bar')!
		if (money < this.cost) {
			bar.style.opacity = '0.5'
			bar.style.width = `${money / this.cost * this.button.clientWidth}px`
		} else {
			bar.style.opacity = '1'
			bar.style.width = '100%'
		}
	}

	set_onclick(fn : () => any, game : Game) {
		this.button.onclick = () => {
			if (game.money >= this.cost) {
				game.money -= this.cost
				this.update_cost(Math.ceil(this.cost * this.cost_mult))
				fn()
			}
		}
	}

	set_label(label : string) {
		this.label = label
		this.init_html()
	}
	
	set_tooltip(tooltip : string) {
		this.button.setAttribute("data-bs-original-title", tooltip)
		// @ts-ignore
		bootstrap.Tooltip.getInstance(this.button).setContent({ '.tooltip-inner': tooltip})
	}
}

/**
 * A button icon upgrade is a button which appears as a
 * single icon with a label beneath it, and a tooltip.
 * These buttons also have a state which indicates whether
 * the player is currently able to purchase the upgrade
 * Button icon upgrades must implement an onclick method,
 * update method, and set state.
 */
abstract class ButtonIconUpgrade {
	cost          : number
	level_req     : number
	upgrade_type  : string
	element!      : HTMLElement
	currency_type : string
	state         : string
	
	constructor(class_type : string, upgrade_type : string, cost : number, level_req : number, currency_type = 'brick') {
		this.cost = cost
		this.level_req = level_req
		this.upgrade_type = upgrade_type
		this.element = document.createElement('div')
		this.element.classList.add(class_type)
		this.currency_type = currency_type
		this.state = 'disabled'
		this.init_html()
	}
	
	init_html() {
		this.element.innerHTML = `
        <button data-bs-toggle="tooltip" data-bs-placement="top"
                data-bs-custom-class="upgrade-tooltip" data-bs-html="true"
                data-bs-title="Speed+<br/>${DisplayUtils.numerical_string(this.cost)} bricks"
                data-purchase-state=${this.state}>
          ${SVGManager.get_svg_icon(this.upgrade_type)}
        </button/>
        <p class="label"> LVL ${DisplayUtils.numerical_string(this.level_req)} </p>`
	}

	abstract set_onclick(fn : () => any, game : Game) : void
	abstract set_state(state : string) : void
	abstract update(money : number, level : number) : void
}

/**
 * A oneoff upgrade is a ball upgrade that gets unlocked
 * once a ball has been upgraded to a certain level. These
 * can upgrade a ball's speed, aoe, etc. These upgrades
 * can only be purchased once.
 */
class OneOffUpgrade extends ButtonIconUpgrade {

	constructor(upgrade_type : string, cost : number, level_req : number, currency_type = 'brick') {
		super('one-off', upgrade_type, cost, level_req, currency_type)
	}
	
	set_onclick(fn : () => any, game : Game) {
		this.element.querySelector('button')!.onclick = () => {
			if (this.currency_type == 'money' && game.money >= this.cost) {
				game.money -= this.cost
				fn()
				this.state = 'purchased'
			} else if (this.currency_type == 'brick' && game.bricks_broken >= this.cost) {
				game.bricks_broken -= this.cost
				fn()
				this.state = 'purchased'
			}
		}
	}

	set_state(state : string) {
		this.state = state
		this.element.querySelector('button')!.setAttribute('data-purchase-state', this.state)
	}
	
	update(money : number, level : number) {
		let state = this.state
		if (state == 'purchased') state = 'purchased'
		else if (level < this.level_req || money < this.cost) state = 'disabled'
		else state = 'enabled'
		this.set_state(state)
	}
}

/**
 * A special upgrade is a ball upgrade that gets unlocked
 * once a ball has been upgraded to a certain level. These
 * can upgrade a ball's speed, aoe, etc.
 */
class SpecialUpgrade extends ButtonIconUpgrade {

	constructor(upgrade_type : string, cost : number, level_req : number, currency_type = 'brick') {
		super('special', upgrade_type, cost, level_req, currency_type)
	}
	
	// TODO: Update cost and level_req
	set_onclick(fn : () => any, game : Game) {
		this.element.querySelector('button')!.onclick = () => {
			if (this.currency_type == 'money' && game.money >= this.cost) {
				game.money -= this.cost
				fn()
			} else if (this.currency_type == 'brick' && game.bricks_broken >= this.cost) {
				game.bricks_broken -= this.cost
				fn()
			}
		}
	}

	set_state(state : string) {
		this.state = state
		this.element.querySelector('button')!.setAttribute('data-purchase-state', this.state)
	}
	
	update(money : number, level : number) {
		this.set_state((level < this.level_req || money < this.cost) ? 'disabled' : 'enabled')
	}
}

/**
 * A BallUpgradeRow is a container for all of the upgrades for
 * a ball. This includes an icon for the ball, a label for the
 * level, a button to upgrade the ball's level, and any one off
 * upgrades for the ball.
 */
class BallUpgradeRow {
	
	icon  : string
	level : number
	upgrade_button : CostBarUpgrade
	upgrades : SpecialUpgrade[]
	container! : HTMLElement
	
	constructor(icon : string, upgrade_button : CostBarUpgrade, one_offs : SpecialUpgrade[]) {
		this.level = 1
		this.icon = icon
		this.upgrade_button = upgrade_button
		this.upgrades = one_offs
		this.container = document.createElement('div')
		this.container.classList.add('ball')
		this.init_html()
	}

	init_html() {
		this.container.innerHTML = `
        <div class="img">${SVGManager.get_svg_icon(this.icon)}</div>
        <p class="level">LVL ${DisplayUtils.numerical_string(this.level)}</p>
        <p class="stats"></p>
        `
		this.container.appendChild(this.upgrade_button.button)
		this.upgrades.forEach(o => this.container.appendChild(o.element))
	}

	update_level(level : number, stats : {[key : string]: number}) {
		this.level = level
		this.container.querySelector('.level')!.innerHTML = `LVL ${DisplayUtils.numerical_string(this.level)}`

		const stats_element = this.container.querySelector('.stats')!
		stats_element.innerHTML = ''
		for (const [key, value] of Object.entries(stats)) {
			stats_element.innerHTML += `${key}: ${DisplayUtils.numerical_string(value)}<br/>`
		}
	}
}

export { CostBarUpgrade, SpecialUpgrade, OneOffUpgrade, BallUpgradeRow, DisplayUtils }
