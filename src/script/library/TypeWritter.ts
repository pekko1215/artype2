interface TypeWritterOption {
	delay: number;
	speed: number;
	backgroundColor: string;
	color: string;
	target: Element;
	finishs: ((e: Element) => void)[];
	titles: (() => void)[];
	changes: ((t: string) => void)[];
}

export class TypeWritter {
	options: TypeWritterOption;
	constructor(public text: string, options: Partial<TypeWritterOption>) {
		this.options = Object.assign({
			delay: 3000,
			speed: 150,
			backgroundColor: 'black',
			color: 'white',
			target: document.body,
			finishs: [],
			titles: [],
			changes: []
		}, options);
	}
	draw() {
		let pText = ((d) => {
			let p = document.createElement('p');
			p.innerHTML = d;
			return p.innerText;
		})(this.text)
		let textArr = [...pText];
		let $back = document.createElement('div');
		let $text = document.createElement('div');
		$back.style.position = 'absolute'
		$back.style.display = 'flex';
		$back.style.alignItems = 'center';
		$back.style.backgroundColor = this.options.backgroundColor;
		$back.style.width = '100%'
		$back.style.height = '100%'
		$back.style.top = '0';
		$back.style.left = '0';
		$back.style.zIndex = '10';
		$text.style.color = this.options.color;
		$text.style.fontSize = '45vw';
		$text.style.fontFamily = 'ＭＳ 明朝'
		$text.style.textAlign = 'center';
		$text.style.width = '100%'
		$text.style.whiteSpace = 'nowrap';
		$back.appendChild($text);
		this.options.target.appendChild($back)

		let zoomout = (vw = 20) => {
			$text.style.fontSize = vw + `vw`
			if (vw == 10) {
				setTimeout(() => {
					this.options.finishs.forEach(fn => fn($back));
				}, this.options.delay)
				return
			}
			setTimeout(zoomout, 5, vw - 1)
		}
		let type = () => {
			if (!textArr.length) {
				$text.innerHTML = this.text;
				this.options.titles.forEach(fn => fn());
				zoomout();
				return
			}
			let t = textArr.shift() || '';
			$text.innerHTML = t;
			this.options.changes.forEach(fn => fn(t))
			setTimeout(type, this.options.speed)
		}
		setTimeout(type, this.options.speed);
		return this;
	}
	change(fn: (t: string) => void) {
		this.options.changes.push(fn);
		return this;
	}
	title(fn: () => void) {
		this.options.titles.push(fn);
		return this;
	}
	finish(fn: (e: Element) => void) {
		this.options.finishs.push(fn);
		return this;
	}
}
