(async () => {
	/* { binder } */
	let lock = { configurable: false, writable: false };
	Array.prototype.bindTo = function bindTo(instance = window) {
		this.forEach((value) => {
			if (value instanceof Function) {
				instance[value.name] = value;
				Object.defineProperty(instance, value.name, lock);
				if (value.prototype instanceof Object) {
					Object.defineProperty(value, 'prototype', lock);
					value.prototype.constructor = value;
					Object.defineProperty(value.prototype, 'constructor', lock);
				}
			}
		});
	};
	[Array.prototype.bindTo].bindTo(Array.prototype);
	/* { reflection } */
	class Nullable {
		constructor(type) {
			this.type = type;
			Object.freeze(this);
		}
	};
	[Nullable].bindTo({});
	[
		function toNullable() {
			return new Nullable(this);
		}
	].bindTo(Function.prototype);
	[
		function isNullable(container) {
			return container instanceof Nullable;
		},
		function removeNullable(container) {
			if (container instanceof Nullable) {
				return container.type;
			} else if (container instanceof Function) {
				return container;
			} else {
				throw 'The \'container\' argument should be either a \'Nullable\' type or a \'Function\' type.';
			}
		}
	].bindTo(window);
	[
		function addCompleteState() {
			this.complete = (() => {
				let complete = true;
				Object.keys(this).forEach((value) => {
					if (this[value] == null) {
						complete = false;
					}
				});
				return complete;
			})();
			Object.freeze(this);
		},
		function constrainedWith(...types) {
			let arguments = Array.from(this);
			if (arguments.length != types.length) {
				return false;
			}
			let constrained = true;
			arguments.forEach((value, index) => {
				if (isNullable(types[index]) && value == null) {
					return;
				} else if (value instanceof removeNullable(types[index]) || Object.getPrototypeOf(value) == removeNullable(types[index]).prototype) {
					return;
				}
				constrained = false;
			});
			return constrained;
		},
		function constrainedWithAndThrow(...types) {
			if (!this.constrainedWith(...types)) {
				throw 'The function arguments should match up the parameter types.';
			}
		}
	].bindTo(Object.prototype);
	/* { asynchronous } */
	class Continuation {
		constructor(resolve, condition) {
			this.resolve = resolve;
			this.condition = condition;
			this.accomplished = false;
		}
		completed() {
			return this.condition != null ? this.condition.call(null) : true;
		}
		pending() {
			return !this.accomplished;
		}
		invoke() {
			if (!this.accomplished) {
				this.resolve();
				this.accomplished = true;
			}
		}
	};
	let continuations = [];
	setInterval(() => {
		continuations = continuations.filter((continuation) => {
			return continuation.pending();
		});
		continuations.forEach((continuation) => {
			if (continuation.completed()) {
				continuation.invoke();
			}
		});
	}, 0);
	[
		function suspend(condition = null) {
			[condition].constrainedWithAndThrow(Function.toNullable());
			return new Promise((resolve) => {
				continuations.push(new Continuation(resolve, condition));
			});
		}
	].bindTo(window);
	await suspend();
	/* { constructors } */
	class Top {
		constructor(head) {
			[head].constrainedWithAndThrow(Element);
			this.topNode = head.nodeName == 'top'.toUpperCase() ? head : null;
			this.addCompleteState();
		}
	};
	class Major {
		constructor(head) {
			[head].constrainedWithAndThrow(Element);
			this.majorNode = head.nodeName == 'major'.toUpperCase() ? head : null;
			this.subMajorNode = head.get(':scope > sub-major');
			this.addCompleteState();
		}
	};
	class Post {
		constructor(head) {
			[head].constrainedWithAndThrow(Element);
			this.postNode = head.nodeName == 'post'.toUpperCase() ? head : null;
			this.subPostNode = head.get(':scope > sub-post');
			this.postIconNode = head.get(':scope > post-icon');
			this.scrollIntoNode = head.get(':scope > sub-post > scroll-into');
			this.postLeaderNode = head.get(':scope > sub-post > post-leader');
			this.postLeaderSectionNode = head.get(':scope > sub-post > post-leader > post-leader-section');
			this.postLeaderOrderNode = head.get(':scope > sub-post > post-leader > post-leader-section > post-leader-order');
			this.postLeaderTitleNode = head.get(':scope > sub-post > post-leader > post-leader-section > post-leader-title');
			this.postLeaderAdvanceNode = head.get(':scope > sub-post > post-leader > post-leader-advance');
			this.postContentNode = head.get(':scope > sub-post > post-content');
			this.addCompleteState();
		}
	};
	class Dropdown {
		constructor(head) {
			[head].constrainedWithAndThrow(Element);
			this.dropdownNode = head.nodeName == 'dropdown'.toUpperCase() ? head : null;
			this.innerPaddingNode = head.get(':scope > inner-padding');
			this.dropdownContentNode = head.get(':scope > dropdown-content');
			this.outerMarginNode = head.get(':scope > outer-margin');
			this.addCompleteState();
		}
	};
	class Button {
		constructor(head) {
			[head].constrainedWithAndThrow(Element);
			this.buttonNode = head.nodeName == 'button'.toUpperCase() ? head : null;
			this.addCompleteState();
		}
	};
	[Top, Major, Post, Dropdown, Button].bindTo(window);
	/* { functionality } */
	[
		function forAll(selector) {
			return Array.from(document.querySelectorAll(selector));
		},
		function forAllTag(tagName) {
			return Array.from(document.getElementsByTagName(tagName));
		},
		function forAllClass(classNames) {
			return Array.from(document.getElementsByClassName(classNames));
		},
		function insertSurround(parentSelector, childName) {
			[parentSelector, childName].constrainedWithAndThrow(String, String);
			if (childName == '') {
				return;
			}
			forAll(parentSelector).forEach((value) => {
				if (value.arrayForChild(childName).length == 0) {
					let substance = document.createElement(childName);
					substance.prepend(...value.childNodes);
					value.prepend(substance);
				}
			});
		},
		function switchFirst(parentSelector, childName) {
			[parentSelector, childName].constrainedWithAndThrow(String, String);
			if (childName == '') {
				return;
			}
			forAll(parentSelector).forEach((value) => {
				value.prepend(...value.arrayForChild(childName));
			});
		},
		function addFirst(parentSelector, childName) {
			[parentSelector, childName].constrainedWithAndThrow(String, String);
			if (childName == '') {
				return;
			}
			forAll(parentSelector).forEach((value) => {
				if (value.children.length > 0 && value.children[0].tagName.toUpperCase() == childName.toUpperCase()) {
					return;
				}
				let substance = document.createElement(childName);
				value.prepend(substance);
			});
		},
		function moveOutside(parentSelector, childName) {
			[parentSelector, childName].constrainedWithAndThrow(String, String);
			if (childName == '') {
				return;
			}
			forAll(parentSelector).forEach((value) => {
				value.parentElement?.prepend(...value.arrayForChild(childName));
			});
		},
		function hasSubstance(parentNode) {
			[parentNode].constrainedWithAndThrow(Element);
			let has = false;
			parentNode.childNodes.forEach((value) => {
				if (value.nodeName == '#comment') {
					return;
				} else if (value.nodeName == '#text' && value.wholeText.removeSpace() == '') {
					return;
				} else if (value instanceof Element && value.nodeName == 'br'.toUpperCase()) {
					return;
				} else if (value instanceof Element && window.getComputedStyle(value).display == 'none') {
					return;
				}
				has = true;
			});
			return has;
		},
		function hasTextOnly(parentNode) {
			[parentNode].constrainedWithAndThrow(Element);
			let has = true;
			parentNode.childNodes.forEach((value) => {
				if (value.nodeName == '#comment') {
					return;
				} else if (value.nodeName == '#text') {
					return;
				} else if (value instanceof Element && value.nodeName == 'br'.toUpperCase()) {
					return;
				}
				has = false;
			});
			return has;
		},
		function hasNoTextWithNode(parentNode) {
			[parentNode].constrainedWithAndThrow(Element);
			let has = true;
			parentNode.childNodes.forEach((value) => {
				if (value.nodeName == '#comment') {
					return;
				} else if (value.nodeName == '#text' && value.wholeText.removeSpace() == '') {
					return;
				} else if (value instanceof Element && value.nodeName != 'br'.toUpperCase()) {
					return;
				}
				has = false;
			});
			return has;
		},
		function isInside(currentNode, parentNode = document.body) {
			[currentNode, parentNode].constrainedWithAndThrow(Element, Element);
			if (!currentNode.isOfBodyTree() || !parentNode.isOfBodyTree()) {
				return;
			}
			let rect = currentNode.getBoundingClientRect();
			let parentRect = parentNode != document.body ? parentNode.getBoundingClientRect() : new DOMRect(0, 0, document.body.clientWidth, document.body.clientHeight);
			let left = rect.x < parentRect.x + parentRect.width;
			let top = rect.y < parentRect.y + parentRect.height;
			let right = rect.x + rect.width > parentRect.x;
			let bottom = rect.y + rect.height > parentRect.y;
			return (left && right) && (top && bottom);
		},
		function isScrollable(currentNode) {
			[currentNode].constrainedWithAndThrow(Element);
			if (!currentNode.isOfBodyTree()) {
				return;
			}
			let scrollableX = currentNode.scrollWidth > currentNode.clientWidth;
			let scrollableY = currentNode.scrollHeight > currentNode.clientHeight;
			return scrollableX || scrollableY;
		},
		function getParentNode(currentNode) {
			[currentNode].constrainedWithAndThrow(Element);
			if (!currentNode.isOfBodyTree()) {
				return;
			}
			let parentNode = currentNode.parentElement;
			while (parentNode != document.body && !isScrollable(parentNode)) {
				parentNode = parentNode.parentElement;
			}
			return parentNode;
		},
		function inScrollable(currentNode) {
			[currentNode].constrainedWithAndThrow(Element);
			if (!currentNode.isOfBodyTree()) {
				return;
			}
			while (currentNode != document.body) {
				let parentNode = getParentNode(currentNode);
				if (isInside(currentNode, parentNode)) {
					currentNode = parentNode;
				} else {
					return false;
				}
			}
			return true;
		},
		function setLocked(currentNode) {
			[currentNode].constrainedWithAndThrow(Element);
			let parentNode = currentNode.parentElement;
			if (currentNode.nodeName == 'a'.toUpperCase() && parentNode?.nodeName == 'top'.toUpperCase()) {
				parentNode.getAll(':scope > a').forEach((value) => {
					if (value == currentNode) {
						value.classList.add('lock');
					} else {
						value.classList.remove('lock');
					}
				});
			}
		},
		function makeCascading(headNode, nodeId, styleText) {
			[headNode, nodeId, styleText].constrainedWithAndThrow(Element, String, String);
			let styleNode = (() => {
				let pseudoNode = (() => {
					let cascadingNode = headNode.getAll(':scope > style');
					let filteredNode = [];
					cascadingNode.forEach((value) => {
						if (value.id == nodeId) {
							filteredNode.push(value);
						}
					});
					return filteredNode;
				})();
				if (pseudoNode.length == 0) {
					let styleNode = document.createElement('style');
					styleNode.id = nodeId;
					headNode.append(styleNode);
					return styleNode;
				} else {
					pseudoNode.slice(1).forEach((value) => {
						value.remove();
					});
					return pseudoNode[0];
				}
			})();
			if (styleNode.childNodes.length != 1) {
				while (styleNode.firstChild != null) {
					styleNode.removeChild(styleNode.firstChild);
				}
				styleNode.append(document.createTextNode(styleText));
			} else if (styleNode.firstChild.wholeText != styleText) {
				styleNode.firstChild.textContent = styleText;
			}
		}
	].bindTo(window);
	[
		function has(selector) {
			return this.querySelector(selector) != null;
		},
		function get(selector) {
			return this.querySelector(selector);
		},
		function getAll(selector) {
			return Array.from(this.querySelectorAll(selector));
		},
		function arrayForChild(childName) {
			[childName].constrainedWithAndThrow(String);
			let array = [];
			Array.from(this.children).forEach((value) => {
				if (value.tagName.toUpperCase() == childName.toUpperCase()) {
					array.push(value);
				}
			});
			return array;
		},
		function isOfHTMLTree() {
			let self = this;
			while (self != null) {
				if (self == document.documentElement) {
					return true;
				}
				self = self.parentElement;
			}
			return false;
		},
		function isOfHeadTree() {
			if (this == document.documentElement) {
				return true;
			}
			let self = this;
			while (self != document.documentElement) {
				if (self == document.head) {
					return true;
				}
				self = self.parentElement;
				if (self == null) {
					break;
				}
			}
			return false;
		},
		function isOfBodyTree() {
			return this.isOfHTMLTree() && !this.isOfHeadTree();
		},
		function surroundedBy(parent) {
			arguments.constrainedWithAndThrow(String);
			if (!this.isOfBodyTree()) {
				return;
			}
			let parentNode = this.parentElement;
 			let surroundingNode = document.createElement(parent);
			surroundingNode.append(this);
			parentNode?.append(surroundingNode);
		}
	].bindTo(Element.prototype);
	[
		function removeSpace() {
			return this.replace(/\t/g, '').replace(/\r/g, '').replace(/\n/g, '').replace(/\f/g, '')
				.replace(/\u0020/g, '')
				.replace(/\u00A0/g, '')
				.replace(/\u1680/g, '')
				.replace(/\u180E/g, '')
				.replace(/\u2000/g, '')
				.replace(/\u2001/g, '')
				.replace(/\u2002/g, '')
				.replace(/\u2003/g, '')
				.replace(/\u2004/g, '')
				.replace(/\u2005/g, '')
				.replace(/\u2006/g, '')
				.replace(/\u2007/g, '')
				.replace(/\u2008/g, '')
				.replace(/\u2009/g, '')
				.replace(/\u200A/g, '')
				.replace(/\u200B/g, '')
				.replace(/\u202F/g, '')
				.replace(/\u205F/g, '')
				.replace(/\u3000/g, '')
				.replace(/\uFEFF/g, '');
		}
	].bindTo(String.prototype);
	/* { event-dispatcher } */
	let isLoaded = false;
	let hasScrolled = false;
	let eventStructuredTag = new CustomEvent('structuredTag');
	let eventFormedStyle = new CustomEvent('formedStyle');
	let scrollIntoView = async () => {
		let hash = document.location.hash;
		if (hash.length == 0) {
			scrollTo(scrollX, 0);
		} else {
			document.location.hash = '#';
			await suspend();
			document.location.hash = hash;
		}
	};
	let marker = () => {
		let getMarker = (majorValue, stackCount, postArray, postIndex) => {
			let markerReversed = false;
			if (majorValue.majorNode.hasAttribute('marker-reversed')) {
				if (majorValue.majorNode.getAttribute('marker-reversed').split(' ')[stackCount]?.toLowerCase() == 'true') {
					markerReversed = true;
				};
			}
			let markerStartedWith = 0;
			if (majorValue.majorNode.hasAttribute('marker-started-with')) {
				let value = parseInt(majorValue.majorNode.getAttribute('marker-started-with').split(' ')[stackCount]);
				if (!isNaN(value)) {
					markerStartedWith = value;
				};
			}
			if (markerReversed) {
				markerStartedWith += postArray.length - 1 - postIndex;
			} else {
				markerStartedWith += postIndex;
			}
			return markerStartedWith;
		};
		let markedArray = [];
		let subPostConducting = (majorValue, stackCount, orderString, postValue) => {
			postValue.postContentNode.getAll(':scope > post').map((value) => {
				return new Post(value);
			}).filter((value) => {
				return value.complete;
			}).forEach((subPostValue, subPostIndex, subPostArray) => {
				let subOrderString = orderString + '.' + getMarker(majorValue, stackCount + 1, subPostArray, subPostIndex).toString();
				markedArray.push(subPostValue);
				subPostValue.postNode.setAttribute('marker', subOrderString);
				subPostConducting(majorValue, stackCount + 1, subOrderString, subPostValue);
			});
		};
		forAllTag('major').map((value) => {
			return new Major(value);
		}).filter((value) => {
			return value.complete;
		}).forEach((majorValue) => {
			majorValue.subMajorNode.getAll(':scope > post').map((value) => {
				return new Post(value);
			}).filter((value) => {
				return value.complete;
			}).forEach((postValue, postIndex, postArray) => {
				let orderString = getMarker(majorValue, 0, postArray, postIndex).toString();
				markedArray.push(postValue);
				postValue.postNode.setAttribute('marker', orderString);
				subPostConducting(majorValue, 0, orderString, postValue);
			});
		});
		forAllTag('post').map((value) => {
			return new Post(value);
		}).filter((value) => {
			return value.complete;
		}).forEach((postValue) => {
			let markedIndex = markedArray.findIndex((markedValue) => {
				return markedValue.postNode == postValue.postNode;
			});
			if (markedIndex == -1) {
				postValue.postNode.removeAttribute('marker');
			}
		});
	};
	let structuredTag = async () => {
		/* major */ {
			/* structuring for the 'major' */ 
			insertSurround('major', 'sub-major');
		}
		await suspend();
		/* post */ {
			/* structuring for the 'post's */
			insertSurround('post', 'sub-post');
			moveOutside('post > sub-post', 'post-icon');
			switchFirst('post', 'post-icon');
			addFirst('post', 'post-icon');
			insertSurround('post > sub-post', 'post-content');
			moveOutside('post > sub-post > post-content', 'post-leader');
			switchFirst('post > sub-post', 'post-leader');
			addFirst('post > sub-post', 'post-leader');
			switchFirst('post > sub-post > post-leader', 'post-leader-advance');
			addFirst('post > sub-post > post-leader', 'post-leader-advance');
			switchFirst('post > sub-post > post-leader', 'post-leader-section');
			addFirst('post > sub-post > post-leader', 'post-leader-section');
			switchFirst('post > sub-post > post-leader > post-leader-section', 'post-leader-title');
			addFirst('post > sub-post > post-leader > post-leader-section', 'post-leader-title');
			switchFirst('post > sub-post > post-leader > post-leader-section', 'post-leader-order');
			addFirst('post > sub-post > post-leader > post-leader-section', 'post-leader-order');
			moveOutside('post > sub-post > post-content', 'scroll-into');
			switchFirst('post > sub-post', 'scroll-into');
			addFirst('post > sub-post', 'scroll-into');
			marker();
			forAllTag('post').map((value) => {
				return new Post(value);
			}).forEach((value) => {
				/* titling for the 'post's */
				if (value.postNode.hasAttribute('headline')) {
					value.postLeaderTitleNode.innerText = value.postNode.getAttribute('headline');
				} else {
					value.postLeaderTitleNode.innerText = '{headline}';
				}
				/* transferring 'inner-class'-list for the 'post's */
				if (value.postNode.hasAttribute('inner-class')) {
					value.postContentNode.setAttribute('class', value.postNode.getAttribute('inner-class'));
				}
				/* ordering and hashing for the 'post's */
				let orderString = '{index}';
				if (value.postNode.hasAttribute('hash-id')) {
					orderString = value.postNode.getAttribute('hash-id');
				} else if (value.postNode.hasAttribute('marker')) {
					if (value.postNode.hasAttribute('partial-hash-id')) {
						orderString = value.postNode.getAttribute('marker').substring(0, value.postNode.getAttribute('marker').lastIndexOf('.') + 1) + value.postNode.getAttribute('partial-hash-id');
					} else {
						orderString = value.postNode.getAttribute('marker');
					}
				}
				value.postLeaderOrderNode.innerText = '#' + orderString;
				value.scrollIntoNode.id = orderString;
				/* dragging to the bottom for the 'post's */
				let subPostNode = value.postContentNode.getAll(':scope > post');
				value.postContentNode.append(...subPostNode);
				/* transferring for the 'post > sub-post > post-leader > post-leader-advance's */
				let advanceChildNode = value.postContentNode.getAll(':scope > advance > *');
				value.postLeaderAdvanceNode.prepend(...advanceChildNode);
			});
		}
		await suspend();
		/* dropdown */ {
			/* structuring for the 'dropdown's */
			insertSurround('dropdown', 'dropdown-content');
			moveOutside('dropdown > dropdown-content', 'outer-margin');
			switchFirst('dropdown', 'outer-margin');
			addFirst('dropdown', 'outer-margin');
			switchFirst('dropdown', 'dropdown-content');
			moveOutside('dropdown > dropdown-content', 'inner-padding');
			switchFirst('dropdown', 'inner-padding');
			addFirst('dropdown', 'inner-padding');
			forAllTag('dropdown').map((value) => {
				return new Dropdown(value);
			}).forEach((value) => {
				value.dropdownNode.prepend(...value.dropdownNode.getAll(':scope > :not(dropdown-content, inner-padding, outer-margin)'));
			});
		}
		await suspend();
		/* background-image with 'basis-layer, backdrop-container > blurred-filter' */ {
			switchFirst('body', 'basis-layer');
			addFirst('body', 'basis-layer');
			switchFirst('body major > sub-major > post > sub-post', 'backdrop-container');
			addFirst('body major > sub-major > post > sub-post', 'backdrop-container');
			switchFirst('body major > sub-major > post > sub-post > backdrop-container', 'blurred-filter');
			addFirst('body major > sub-major > post > sub-post > backdrop-container', 'blurred-filter');
		}
		await suspend();
		document.dispatchEvent(eventStructuredTag);
	};
	let formedStyle = async () => {
		/* style */ {
			/* style#background-image */ {
				if (document.body.hasAttribute('background-image')) {
					makeCascading(document.head, 'background-image', `
body basis-layer, body#blur major > sub-major > post > sub-post > backdrop-container > blurred-filter {
	--background-image: url('` + new URL(document.body.getAttribute('background-image'), document.baseURI).href + `');
}
`);
				} else {
					makeCascading(document.head, 'background-image', `
body basis-layer, body#blur major > sub-major > post > sub-post > backdrop-container > blurred-filter {
	--background-image: unset;
}
`);
				}
			}
			/* style#mobile-cascading */ {
				makeCascading(document.head, 'mobile-cascading', `
@media (pointer:none), (pointer:coarse) {
	body {
		--window-inner-height: ` + window.innerHeight.toString() + `px;
	}
}
`);
			}
		}
		await suspend();
		/* top */
		forAllTag('top').map((value) => {
			return new Top(value);
		}).filter((value) => {
			return value.complete;
		}).forEach((value) => {
			/* '.no-text' for the 'top' */
			value.topNode.classList.add('no-text');
			/* resizing for the 'top' */
			if (document.body.clientWidth > 1226) {
				value.topNode.classList.remove('small');
				value.topNode.classList.remove('medium');
				value.topNode.classList.add('large');
			} else if (document.body.clientWidth >= 1048) {
				value.topNode.classList.remove('small');
				value.topNode.classList.add('medium');
				value.topNode.classList.remove('large');
			} else {
				value.topNode.classList.add('small');
				value.topNode.classList.remove('medium');
				value.topNode.classList.remove('large');
			}
			/* locking an option and scrolling into the '.lock' when has been unlocked */
			if (value.topNode.matches(':not(:is(:hover, :focus-within))')) {
				value.topNode.classList.remove('unlocked');
				let aLockNode = value.topNode.getAll(':scope > a:not(.has-node).lock');
				if (aLockNode.length == 0) {
					let aNode = value.topNode.get(':scope > a:not(.has-node)');
					aNode?.classList.add('lock');
				} else {
					value.topNode.scrollTop = aLockNode[0].offsetTop;
					aLockNode.slice(1).forEach((value) => {
						value.classList.remove('lock');
					});
				}
			} else if (value.topNode.matches(':is(:hover, :focus-within):not(.unlocked)')) {
				value.topNode.classList.add('unlocked');
				value.topNode.scrollTop = 0;
			}
			/*  '.icon', '.no-content' and '.has-node' for the 'top > a's */
			value.topNode.getAll(':scope > a').forEach((value) => {
				if (window.getComputedStyle(value).backgroundImage == 'none') {
					value.classList.remove('icon');
				} else {
					value.classList.add('icon');
				}
				if (hasSubstance(value)) {
					value.classList.remove('no-content');
				} else {
					value.classList.add('no-content');
				}
				if (hasTextOnly(value)) {
					value.classList.remove('has-node');
				} else {
					value.classList.add('has-node');
				}
			});
			/* ':not(a)'s surrounded by a 'a' for the 'top > :not(a)'s */
			value.topNode.getAll(':scope > :not(a)').forEach((value) => {
				value.surroundedBy('a');
			});
		});
		await suspend();
		/* major */
		forAllTag('major').map((value) => {
			return new Major(value);
		}).filter((value) => {
			return value.complete;
		}).forEach((value) => {
			/* resizing for the 'major' */
			if (document.body.clientWidth <= 750) {
				value.majorNode.classList.add('tiny');
			} else {
				value.majorNode.classList.remove('tiny');
			}
		});
		await suspend();
		/* post */
		marker();
		forAllTag('post').map((value) => {
			return new Post(value);
		}).filter((value) => {
			return value.complete;
		}).forEach((value) => {
			/* adding the icon for the 'post's */
			if (value.postNode.hasAttribute('icon-src')) {
				value.postIconNode.style.backgroundImage = `url('` + new URL(value.postNode.getAttribute('icon-src'), document.baseURI).href + `')`;
			} else {
				value.postIconNode.style.backgroundImage = 'unset';
			}
			/* '.no-content' for the pairs of 'post > sub-post > post-leader > post-leader-advance' and 'post > sub-post > post-content' */
			if (hasSubstance(value.postLeaderAdvanceNode)) {
				value.postLeaderAdvanceNode.classList.remove('no-content');
			} else {
				value.postLeaderAdvanceNode.classList.add('no-content');
			}
			if (hasSubstance(value.postContentNode)) {
				value.postContentNode.classList.remove('no-content');
			} else {
				value.postContentNode.classList.add('no-content');
			}
			/* '.has-only-post' for the 'post > sub-post > post-content's */
			function hasOnlyPost(parentNode) {
				let has = true;
				parentNode.childNodes.forEach((value) => {
					if (value.nodeName == '#comment') {
						return;
					} else if (value.nodeName == '#text' && value.wholeText.removeSpace() == '') {
						return;
					} else if (value instanceof Element && value.nodeName == 'br'.toUpperCase()) {
						return;
					} else if (value instanceof Element && value.nodeName == 'post'.toUpperCase()) {
						return;
					} else if (value instanceof Element && window.getComputedStyle(value).display == 'none') {
						return;
					}
					has = false;
				});
				return has;
			}
			if (hasOnlyPost(value.postContentNode)) {
				value.postContentNode.classList.add('has-only-post');
			} else {
				value.postContentNode.classList.remove('has-only-post');
			}
			/* '.non-blur' for the 'post's */
			if (value.postNode.hasAttribute('marker')) {
				value.postNode.classList.remove('non-blur');
			} else {
				value.postNode.classList.add('non-blur');
			}
			/* '.no-text' for the 'post > sub-post > post-leader > post-leader-advance's with ':scope > dropdown' */
			value.postLeaderAdvanceNode.classList.add('no-text');
			value.postLeaderAdvanceNode.getAll(':scope > dropdown').forEach((value) => {
				value.classList.add('no-text');
			});
		});
		await suspend();
		forAllTag('dropdown').map((value) => {
			return new Dropdown(value);
		}).filter((value) => {
			return value.complete;
		}).forEach((value) => {
			/* '.has-node' for the 'dropdown > dropdown-content > a's */
			value.dropdownContentNode.getAll(':scope > a').forEach((value) => {
				if (hasTextOnly(value)) {
					value.classList.remove('has-node');
				} else {
					value.classList.add('has-node');
				}
			});
			/* ':not(a)'s surrounded by a 'a' for the 'dropdown > dropdown-content > :not(a)'s */
			value.dropdownContentNode.getAll(':scope > :not(a)').forEach((value) => {
				value.surroundedBy('a');
			});
			/* '.has-disabled' for the 'dropdown's existing 'button.disabled's */
			if (value.dropdownNode.has(':scope > button.disabled')) {
				value.dropdownNode.classList.add('has-disabled');
			} else {
				value.dropdownNode.classList.remove('has-disabled');
			}
			/* setting the 'maxHeight', 'left' and 'right' style, and '.hidden' for a 'dropdown-content' */
			(() => {
				let top = value.dropdownNode.getBoundingClientRect().bottom + 6;
				let bottom = document.body.clientHeight - value.dropdownNode.getBoundingClientRect().bottom;
				if (top < 69 || bottom < 64 || !inScrollable(value.dropdownNode)) {
					value.dropdownContentNode.hidden = true;
					value.dropdownContentNode.style.maxHeight = '';
					value.dropdownContentNode.style.top = '';
					value.dropdownContentNode.style.left = '';
					value.dropdownContentNode.style.right = '';
					return;
				} else {
					value.dropdownContentNode.hidden = false;
					value.dropdownContentNode.style.maxHeight = (bottom - 28).toString() + 'px';
					value.dropdownContentNode.style.top = top.toString() + 'px';
				}
				let left = value.dropdownNode.getBoundingClientRect().left;
				if (left < 6) {
					value.dropdownContentNode.style.left = '6px';
					value.dropdownContentNode.style.right = '';
				} else if (document.body.clientWidth - left - 6 < value.dropdownContentNode.offsetWidth) {
					value.dropdownContentNode.style.left = '';
					value.dropdownContentNode.style.right = '6px';
				} else {
					value.dropdownContentNode.style.left = left.toString() + 'px';
					value.dropdownContentNode.style.right = '';
				}
			})();
			/* '.no-content' for a 'dropdown-content' */
			if (hasSubstance(value.dropdownContentNode)) {
				value.dropdownContentNode.classList.remove('no-content');
			} else {
				value.dropdownContentNode.classList.add('no-content');
			}
			/* '.has-single-button' for the 'dropdown's */
			if (value.dropdownNode.has(':scope > button:first-of-type:last-of-type') && hasNoTextWithNode(value.dropdownNode)) {
				value.dropdownNode.classList.add('has-single-button');
			} else {
				value.dropdownNode.classList.remove('has-single-button');
			}
		});
		await suspend();
		/* button */
		forAllTag('button').map((value) => {
			return new Button(value);
		}).filter((value) => {
			return value.complete;
		}).forEach((value) => {
			/* '.icon', '.no-content' and '[disabled]' for the 'button's */
			if (window.getComputedStyle(value.buttonNode).backgroundImage == 'none') {
				value.buttonNode.classList.remove('icon');
			} else {
				value.buttonNode.classList.add('icon');
			}
			if (hasSubstance(value.buttonNode)) {
				value.buttonNode.classList.remove('no-content');
			} else {
				value.buttonNode.classList.add('no-content');
			}
			value.buttonNode.disabled = value.buttonNode.classList.contains('disabled');
		});
		await suspend();
		/* .no-space */
		forAllClass('no-space').map((value) => {
			return value.childNodes;
		}).forEach((value) => {
			value.forEach((value) => {
				if (value.nodeName == '#text' && value.wholeText.removeSpace() == '') {
					value.textContent = '';
				}
			});
		});
		/* .no-text */
		forAllClass('no-text').map((value) => {
			return value.childNodes;
		}).forEach((value) => {
			value.forEach((value) => {
				if (value.nodeName == '#text') {
					value.textContent = '';
				}
			});
		});
		await suspend();
		/* background-image with 'basis-layer, backdrop-container > blurred-filter' */
		forAll('body major').map((value) => {
			return new Major(value);
		}).filter((value) => {
			return value.complete;
		}).forEach((value) => {
			value.subMajorNode.getAll(':scope > post').map((value) => {
				return new Post(value);
			}).filter((value) => {
				return value.complete;
			}).forEach((value) => {
				if (!inScrollable(value.subPostNode)) {
					value.subPostNode.classList.add('suspended-backdrop');
				} else {
					value.subPostNode.classList.remove('suspended-backdrop');
				}
			});
		});
		await suspend();
		document.dispatchEvent(eventFormedStyle);
	};
	let delegate = async () => {
		if (isLoaded == false) {
			await structuredTag();
			isLoaded = true;
		}
		await formedStyle();
		if (hasScrolled == false) {
			await scrollIntoView();
			hasScrolled = true;
		}
	};
	[
		function ready() {
			return isLoaded;
		},
		function reload() {
			isLoaded = false;
		},
		function scrolledInto() {
			return hasScrolled;
		},
		function rescrollView() {
			hasScrolled = false;
		}
	].bindTo(window);
	await suspend(() => {
		return document.readyState == 'complete';
	});
	while (true) {
		await delegate();
		await suspend();
	}
})();