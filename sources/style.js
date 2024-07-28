/*
 *   MIT License
 *   
 *   Copyright (c) 2023 Edmond Chow
 *   
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *   
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 *   
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */
(async () => {
	/* { binder } */
	let makeDescriptor = (value, enumerable = true) => {
		return { value: value, writable: false, enumerable: enumerable, configurable: false };
	};
	let makeObject = (object, extensible, constantize) => {
		let names = Object.getOwnPropertyNames(object);
		if (object instanceof Function) {
			names = names.filter((name) => {
				return name != 'arguments' && name != 'caller';
			});
		}
		names.forEach((name) => {
			let descriptor = Object.getOwnPropertyDescriptor(object, name);
			if (constantize && descriptor.hasOwnProperty('value')) {
				descriptor.writable = false;
			}
			descriptor.configurable = false;
			Object.defineProperty(object, name, descriptor);
		});
		if (!extensible) {
			Object.preventExtensions(object);
		}
		return object;
	};
	let makeSealed = (object, extensible = false) => {
		return makeObject(object, extensible, false);
	};
	let makeFrozen = (object, extensible = false) => {
		return makeObject(object, extensible, true);
	};
	Array.prototype.bindTo = function bindTo(scope, sealed = true, protoize = false) {
		this.filter((value) => {
			return value instanceof Function;
		}).forEach((value) => {
			Object.defineProperty(scope, value['name'], makeDescriptor(value, true));
			Object.defineProperty(value, 'name', makeDescriptor(value['name'], false));
			Object.defineProperty(value, 'length', makeDescriptor(value['length'], false));
			if (value.hasOwnProperty('prototype')) {
				let prototype = value['prototype'];
				Object.defineProperty(value, 'prototype', makeDescriptor(prototype, false));
				Object.defineProperty(prototype, 'constructor', makeDescriptor(value, false));
				makeFrozen(prototype, !protoize);
			}
			makeSealed(value, sealed);
		});
	};
	[Array.prototype.bindTo].bindTo(Array.prototype);
	[makeDescriptor, makeSealed, makeFrozen].bindTo(window);
	/* { reflection } */
	class Nullable {
		constructor(type) {
			this.type = type;
			makeFrozen(this, true);
		}
	};
	[Nullable].bindTo(window);
	[
		function toNullable() {
			return new Nullable(this);
		}
	].bindTo(Function.prototype);
	[
		function isNullable(container) {
			return container instanceof Nullable && container.type instanceof Function;
		},
		function removeNullable(container) {
			let decay = container instanceof Nullable ? container.type : container;
			if (decay instanceof Function) {
				return decay;
			} else {
				throw 'The decayed type are not function types.';
			}
		}
	].bindTo(window);
	[
		function constrainedWith(...types) {
			let arguments = Array.from(this);
			if (arguments.length != types.length) {
				return false;
			}
			for (let i = 0; i < arguments.length; i++) {
				let decay = removeNullable(types[i]);
				if (arguments[i] === undefined) {
					throw 'Some sort of function arguments should be exist.';
				} else if (arguments[i] == null) {
					if (isNullable(types[i])) {
						continue;
					} else {
						return false;
					}
				} else if (arguments[i] instanceof decay) {
					continue;
				} else if (Object.getPrototypeOf(arguments[i]) == decay.prototype) {
					continue;
				} else {
					return false;
				}
			}
			return true;
		},
		function constrainedWithAndThrow(...types) {
			if (!this.constrainedWith(...types)) {
				throw 'The function arguments should match up the parameter types.';
			}
		}
	].bindTo(Object.prototype);
	/* { property-definer } */
	[
		function hardFreeze(scope, types, protoize = true) {
			[scope, types, protoize].constrainedWithAndThrow(Object, Array, Boolean);
			types.bindTo(scope, true, protoize);
		},
		function lockFields(instance, keys, mutable = true) {
			[instance, keys, mutable].constrainedWithAndThrow(Object, Array, Boolean);
			keys.forEach((key) => {
				Object.defineProperty(instance, key, { writable: mutable, enumerable: !mutable, configurable: false });
			});
		},
		function shareProperties(type, keys, static = false) {
			[type, keys, static, type.prototype].constrainedWithAndThrow(Function, Array, Boolean, Object);
			keys.forEach((key) => {
				let scope = static ? type : type.prototype;
				if (Object.getOwnPropertyDescriptor(scope, key).hasOwnProperty('value')) {
					Object.defineProperty(scope, key, { writable: false, enumerable: true, configurable: false });
				} else {
					Object.defineProperty(scope, key, { enumerable: true, configurable: false });
				}
			});
		}
	].bindTo(window);
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
	let isMatched = (head, name) => {
		return head.nodeName == name.toUpperCase();
	};
	let switchIf = (matched, value) => {
		return matched ? value : null;
	};
	let isCompleted = (object) => {
		return Object.getOwnPropertyNames(object).every((name) => {
			return object[name] != null;
		});
	};
	class Top {
		constructor(head) {
			[head].constrainedWithAndThrow(Element);
			let matched = isMatched(head, 'top');
			this.topNode = switchIf(matched, head);
			this.completed = isCompleted(this);
			makeFrozen(this, true);
		}
	};
	class Major {
		constructor(head) {
			[head].constrainedWithAndThrow(Element);
			let matched = isMatched(head, 'major');
			this.majorNode = switchIf(matched, head);
			this.subMajorNode = switchIf(matched, head.get(':scope > sub-major'));
			this.majorMenuNode = switchIf(matched, head.get(':scope > major-menu'));
			this.majorPostNode = switchIf(matched, head.get(':scope > sub-major > major-post'));
			this.completed = isCompleted(this);
			makeFrozen(this, true);
		}
	};
	class Post {
		constructor(head) {
			[head].constrainedWithAndThrow(Element);
			let matched = isMatched(head, 'post');
			this.postNode = switchIf(matched, head);
			this.postIconNode = switchIf(matched, head.get(':scope > post-icon'));
			this.subPostNode = switchIf(matched, head.get(':scope > sub-post'));
			this.scrollIntoNode = switchIf(matched, head.get(':scope > sub-post > scroll-into'));
			this.postLeaderNode = switchIf(matched, head.get(':scope > sub-post > post-leader'));
			this.postContentNode = switchIf(matched, head.get(':scope > sub-post > post-content'));
			this.postLeaderSectionNode = switchIf(matched, head.get(':scope > sub-post > post-leader > post-leader-section'));
			this.postLeaderAdvanceNode = switchIf(matched, head.get(':scope > sub-post > post-leader > post-leader-advance'));
			this.postLeaderOrderNode = switchIf(matched, head.get(':scope > sub-post > post-leader > post-leader-section > post-leader-order'));
			this.postLeaderTitleNode = switchIf(matched, head.get(':scope > sub-post > post-leader > post-leader-section > post-leader-title'));
			this.postContentSubstanceNode = switchIf(matched, head.get(':scope > sub-post > post-content > post-content-substance'));
			this.completed = isCompleted(this);
			makeFrozen(this, true);
		}
	};
	class Dropdown {
		constructor(head) {
			[head].constrainedWithAndThrow(Element);
			let matched = isMatched(head, 'dropdown');
			this.dropdownNode = switchIf(matched, head);
			this.innerPaddingNode = switchIf(matched, head.get(':scope > inner-padding'));
			this.dropdownContentNode = switchIf(matched, head.get(':scope > dropdown-content'));
			this.outerMarginNode = switchIf(matched, head.get(':scope > outer-margin'));
			this.completed = isCompleted(this);
			makeFrozen(this, true);
		}
	};
	class Button {
		constructor(head) {
			[head].constrainedWithAndThrow(Element);
			let matched = isMatched(head, 'button');
			this.buttonNode = switchIf(matched, head);
			this.completed = isCompleted(this);
			makeFrozen(this, true);
		}
	};
	hardFreeze(window, [Top, Major, Post, Dropdown, Button], false);
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
			forAll(parentSelector).forEach((value) => {
				let childs = value.arrayForChild(childName);
				if (childs.length == 0) {
					let substance = document.createElement(childName);
					substance.append(...value.childNodes);
					value.append(substance);
				}
			});
		},
		function switchBottom(parentSelector, childName) {
			[parentSelector, childName].constrainedWithAndThrow(String, String);
			forAll(parentSelector).forEach((value) => {
				let childs = value.arrayForChild(childName);
				if (childs.length == 0) {
					let substance = document.createElement(childName);
					value.append(substance);
				}
				value.append(...childs);
			});
		},
		function moveOutside(parentSelector, childName) {
			[parentSelector, childName].constrainedWithAndThrow(String, String);
			forAll(parentSelector).forEach((value) => {
				let childs = value.arrayForChild(childName);
				if (childs.length == 0) {
					let substance = document.createElement(childName);
					value.parentElement.append(substance);
				}
				value.parentElement.append(...childs);
			});
		},
		function hasSubstance(parentNode) {
			[parentNode].constrainedWithAndThrow(Element);
			return !Array.from(parentNode.childNodes).every((value) => {
				if (value.nodeName == '#comment') {
					return true;
				} else if (value.nodeName == '#text' && value.wholeText.removeSpace() == '') {
					return true;
				} else if (value instanceof Element && value.nodeName == 'br'.toUpperCase()) {
					return true;
				} else if (value instanceof Element && window.getComputedStyle(value).display == 'none') {
					return true;
				} else {
					return false;
				}
			});
		},
		function hasTextOnly(parentNode) {
			[parentNode].constrainedWithAndThrow(Element);
			return Array.from(parentNode.childNodes).every((value) => {
				if (value.nodeName == '#comment') {
					return true;
				} else if (value.nodeName == '#text') {
					return true;
				} else if (value instanceof Element && value.nodeName == 'br'.toUpperCase()) {
					return true;
				} else {
					return false;
				}
			});
		},
		function hasNoTextWithNode(parentNode) {
			[parentNode].constrainedWithAndThrow(Element);
			return Array.from(parentNode.childNodes).every((value) => {
				if (value.nodeName == '#comment') {
					return true;
				} else if (value.nodeName == '#text' && value.wholeText.removeSpace() == '') {
					return true;
				} else if (value instanceof Element && value.nodeName != 'br'.toUpperCase()) {
					return true;
				} else {
					return false;
				}
			});
		},
		function isInside(currentNode, parentNode, headNode = document.body) {
			[currentNode, parentNode].constrainedWithAndThrow(Element, Element);
			if (!currentNode.isOfNodeTree(parentNode) || !parentNode.isOfNodeTree(headNode)) {
				return false;
			}
			let currentRect = currentNode.getBoundingClientRect();
			let parentRect = parentNode != headNode ? parentNode.getBoundingClientRect() : new DOMRect(0, 0, headNode.clientWidth, headNode.clientHeight);
			let insideX = currentRect.left < parentRect.right && currentRect.right > parentRect.left;
			let insideY = currentRect.top < parentRect.bottom && currentRect.bottom > parentRect.top;
			return insideX && insideY;
		},
		function isScrollable(currentNode, headNode = document.body) {
			[currentNode].constrainedWithAndThrow(Element);
			if (!currentNode.isOfNodeTree(headNode)) {
				return false;
			}
			let scrollableX = currentNode.scrollWidth > currentNode.clientWidth;
			let scrollableY = currentNode.scrollHeight > currentNode.clientHeight;
			return scrollableX || scrollableY;
		},
		function getScrollable(currentNode, headNode = document.body) {
			[currentNode].constrainedWithAndThrow(Element);
			if (!currentNode.isOfNodeTree(headNode)) {
				return null;
			}
			let container = currentNode.parentElement;
			while (container != null) {
				if (container == headNode) {
					return headNode;
				} else if (!isScrollable(container, headNode)) {
					container = container.parentElement;
				} else {
					return container;
				}
			}
			return null;
		},
		function inScrollable(currentNode, headNode = document.body) {
			[currentNode].constrainedWithAndThrow(Element);
			if (!currentNode.isOfNodeTree(headNode)) {
				return false;
			}
			let substance = currentNode;
			while (substance != null) {
				let container = getScrollable(substance, headNode);
				if (substance == headNode) {
					return true;
				} else if (container != null && isInside(substance, container, headNode)) {
					substance = container;
				} else {
					return false;
				}
			}
			return false;
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
				let cascadingNode = headNode.getAll(':scope > style').filter((value) => {
					return value.id == nodeId;
				});
				if (cascadingNode.length == 0) {
					let styleNode = document.createElement('style');
					styleNode.id = nodeId;
					headNode.append(styleNode);
					return styleNode;
				} else {
					cascadingNode.slice(1).forEach((value) => {
						value.remove();
					});
					return cascadingNode[0];
				}
			})();
			styleNode.textContent = styleText;
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
			return Array.from(this.childNodes).filter((value) => {
				return value.nodeName == childName.toUpperCase();
			});
		},
		function isOfNodeTree(headNode = document.body) {
			let currentNode = this;
			while (currentNode != null) {
				if (currentNode == headNode) {
					return true;
				}
				currentNode = currentNode.parentElement;
			}
			return false;
		},
		function hasParentNode(headNode = document.body) {
			return this != headNode && this.isOfNodeTree(headNode);
		},
		function surroundedBy(parentName) {
			arguments.constrainedWithAndThrow(String);
			if (this.hasParentNode()) {
				let parentNode = this.parentElement;
				let surroundingNode = document.createElement(parentName);
				surroundingNode.append(this);
				parentNode.append(surroundingNode);
			}
		}
	].bindTo(Element.prototype);
	[
		function removeSpace() {
			let spaces = ['\t', '\r', '\n', '\f', '\u0020', '\u00A0', '\u1680', '\u180E', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u200B', '\u202F', '\u205F', '\u3000', '\uFEFF'];
			let result = this;
			spaces.forEach((space) => {
				result = result.replaceAll(space, '');
			});
			return result;
		}
	].bindTo(String.prototype);
	/* { event-dispatcher } */
	let isLoaded = false;
	let hasScrolled = false;
	let eventDispatcherInitialized = new CustomEvent('dispatcherInitialized');
	let eventStructuredTag = new CustomEvent('structuredTag');
	let eventFormedStyle = new CustomEvent('formedStyle');
	let eventScrollIntoView = new CustomEvent('scrollIntoView');
	let scrollIntoView = async () => {
		let hash = document.location.hash;
		if (hash.length == 0) {
			scrollTo(scrollX, 0);
		} else {
			document.location.hash = '#';
			await suspend();
			document.location.hash = hash;
		}
		await suspend();
		document.dispatchEvent(eventScrollIntoView);
	};
	let conveyMajorToPosts = () => {
		let markedPostNodes = [];
		forAllTag('major').map((value) => {
			return new Major(value);
		}).filter((value) => {
			return value.completed;
		}).forEach((majorValue) => {
			let shouldTinyPosts = majorValue.majorNode.classList.contains('tiny');
			let markerReversed = [];
			if (majorValue.majorNode.hasAttribute('marker-reversed')) {
				markerReversed = majorValue.majorNode.getAttribute('marker-reversed').split(' ').map((value) => {
					return value.toLowerCase() == 'true';
				});
			}
			let markerStartedWith = [];
			if (majorValue.majorNode.hasAttribute('marker-started-with')) {
				markerStartedWith = majorValue.majorNode.getAttribute('marker-started-with').split(' ').map((value) => {
					return parseInt(value);
				}).map((value) => {
					return isNaN(value) ? 0 : value;
				});
			}
			let getOrder = (layer, index, length) => {
				let reversed = layer < markerReversed.length ? markerReversed[layer] : false;
				let startedWith = layer < markerStartedWith.length ? markerStartedWith[layer] : 0;
				return startedWith + (reversed ? length - 1 - index : index);
			};
			let subPostConducting = (headNode, orderString, postLayer) => {
				headNode.getAll(':scope > post').map((value) => {
					return new Post(value);
				}).filter((value) => {
					return value.completed;
				}).forEach((postValue, postIndex, postArray) => {
					let subOrderString = orderString + getOrder(postLayer, postIndex, postArray.length).toString();
					postValue.postNode.setAttribute('marker', subOrderString);
					if (shouldTinyPosts) {
						postValue.postNode.classList.add('tiny');
					} else {
						postValue.postNode.classList.remove('tiny');
					}
					markedPostNodes.push(postValue.postNode);
					subPostConducting(postValue.postContentSubstanceNode, subOrderString + '.', postLayer + 1);
				});
			};
			subPostConducting(majorValue.majorPostNode, '', 0);
		});
		forAll('post[marker]').map((value) => {
			return new Post(value);
		}).filter((value) => {
			return value.completed;
		}).filter((postValue) => {
			return !markedPostNodes.includes(postValue.postNode);
		}).forEach((postValue) => {
			postValue.postNode.removeAttribute('marker');
			postValue.postNode.classList.remove('tiny');
		});
	};
	let structuredTag = async () => {
		/* major */ {
			/* structuring for the 'major' */ 
			insertSurround('major', 'sub-major');
			moveOutside('major > sub-major', 'major-menu');
			switchBottom('major', 'sub-major');
			switchBottom('major', 'major-menu');
			insertSurround('major > sub-major', 'major-post');
			forAllTag('major').map((value) => {
				return new Major(value);
			}).forEach((value) => {
				/* transferring for the 'major > major-menu's */
				let topNodes = value.majorPostNode.getAll(':scope > top');
				value.majorMenuNode.prepend(...topNodes);
			});
		}
		await suspend();
		/* post */ {
			/* structuring for the 'post's */
			insertSurround('post', 'sub-post');
			moveOutside('post > sub-post', 'post-icon');
			switchBottom('post', 'post-icon');
			switchBottom('post', 'sub-post');
			insertSurround('post > sub-post', 'post-content');
			moveOutside('post > sub-post > post-content', 'scroll-into');
			moveOutside('post > sub-post > post-content', 'post-leader');
			switchBottom('post > sub-post', 'scroll-into');
			switchBottom('post > sub-post', 'post-leader');
			switchBottom('post > sub-post', 'post-content');
			switchBottom('post > sub-post > post-leader', 'post-leader-section');
			switchBottom('post > sub-post > post-leader', 'post-leader-advance');
			switchBottom('post > sub-post > post-leader > post-leader-section', 'post-leader-order');
			switchBottom('post > sub-post > post-leader > post-leader-section', 'post-leader-title');
			insertSurround('post > sub-post > post-content', 'post-content-substance');
			switchBottom('post > sub-post > post-content', 'post-content-substance');
			conveyMajorToPosts();
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
					value.postContentSubstanceNode.setAttribute('class', value.postNode.getAttribute('inner-class'));
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
				let subPostNode = value.postContentSubstanceNode.getAll(':scope > post');
				value.postContentSubstanceNode.append(...subPostNode);
				/* transferring for the 'post > sub-post > post-leader > post-leader-advance's */
				let advanceChildNode = value.postContentSubstanceNode.getAll(':scope > advance > *');
				value.postLeaderAdvanceNode.prepend(...advanceChildNode);
			});
		}
		await suspend();
		/* dropdown */ {
			/* structuring for the 'dropdown's */
			insertSurround('dropdown', 'dropdown-content');
			moveOutside('dropdown > dropdown-content', 'inner-padding');
			moveOutside('dropdown > dropdown-content', 'outer-margin');
			switchBottom('dropdown', 'inner-padding');
			switchBottom('dropdown', 'dropdown-content');
			switchBottom('dropdown', 'outer-margin');
			forAllTag('dropdown').map((value) => {
				return new Dropdown(value);
			}).forEach((value) => {
				value.dropdownNode.prepend(...value.dropdownNode.getAll(':scope > :not(dropdown-content, inner-padding, outer-margin)'));
			});
		}
		await suspend();
		/* background-image with 'basis-layer, backdrop-container > blurred-filter' */ {
			switchBottom('body', 'basis-layer');
			switchBottom('body major > sub-major > major-post > post > sub-post', 'backdrop-container');
			switchBottom('body major > sub-major > major-post > post > sub-post > backdrop-container', 'blurred-filter');
		}
		await suspend();
		document.dispatchEvent(eventStructuredTag);
	};
	let formedStyle = async () => {
		/* style */ {
			/* style#background-image */ {
				if (document.body.hasAttribute('background-image')) {
					makeCascading(document.head, 'background-image', `
@layer basis {
	@layer backdrop-before {
		body basis-layer, body.blur major > sub-major > major-post > post > sub-post > backdrop-container > blurred-filter {
			--background-image: url('` + new URL(document.body.getAttribute('background-image'), document.baseURI).href + `');
		}
	}
}
`);
				} else {
					makeCascading(document.head, 'background-image', `
@layer basis {
	@layer backdrop-before {
		body basis-layer, body.blur major > sub-major > major-post > post > sub-post > backdrop-container > blurred-filter {
			--background-image: unset;
		}
	}
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
			return value.completed;
		}).forEach((value) => {
			/* '.no-text' for the 'top's */
			value.topNode.classList.add('no-text');
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
			return value.completed;
		}).forEach((value) => {
			/* resizing for the 'major's */
			if (value.subMajorNode.clientWidth >= 1048) {
				value.majorNode.classList.remove('tiny');
			} else {
				value.majorNode.classList.add('tiny');
			}
			/* '.no-menu' for the 'major's */
			if (value.majorMenuNode.getAll(':scope > top').length == 0) {
				value.majorNode.classList.add('no-menu');
			} else {
				value.majorNode.classList.remove('no-menu');
			}
		});
		await suspend();
		/* post */
		conveyMajorToPosts();
		forAllTag('post').map((value) => {
			return new Post(value);
		}).filter((value) => {
			return value.completed;
		}).forEach((value) => {
			/* adding the icon for the 'post's */
			if (value.postNode.hasAttribute('icon-src')) {
				value.postIconNode.style.backgroundImage = `url('` + new URL(value.postNode.getAttribute('icon-src'), document.baseURI).href + `')`;
			} else {
				value.postIconNode.style.backgroundImage = 'unset';
			}
			/* '.no-content' for the 'post > sub-post > post-leader > post-leader-advance's */
			if (hasSubstance(value.postLeaderAdvanceNode)) {
				value.postLeaderAdvanceNode.classList.remove('no-content');
			} else {
				value.postLeaderAdvanceNode.classList.add('no-content');
			}
			/* '.no-content' for the 'post > sub-post > post-content > post-content-substance's */
			if (hasSubstance(value.postContentSubstanceNode)) {
				value.postContentSubstanceNode.classList.remove('no-content');
			} else {
				value.postContentSubstanceNode.classList.add('no-content');
			}
			/* '.has-only-post' for the 'post > sub-post > post-content's */
			let hasOnlyPost = (postContentSubstanceNode) => {
				return Array.from(postContentSubstanceNode.childNodes).every((value) => {
					if (value.nodeName == '#comment') {
						return true;
					} else if (value.nodeName == '#text' && value.wholeText.removeSpace() == '') {
						return true;
					} else if (value instanceof Element && value.nodeName == 'br'.toUpperCase()) {
						return true;
					} else if (value instanceof Element && value.nodeName == 'post'.toUpperCase()) {
						return true;
					} else if (value instanceof Element && window.getComputedStyle(value).display == 'none') {
						return true;
					} else {
						return false;
					}
				});
			};
			if (hasOnlyPost(value.postContentSubstanceNode)) {
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
			/* '.wrap-leader' for the 'post's */
			if (value.postNode.offsetWidth < 320) {
				value.postNode.classList.add('wrap-leader');
			} else {
				value.postNode.classList.remove('wrap-leader');
			}
		});
		await suspend();
		/* dropdown */
		forAllTag('dropdown').map((value) => {
			return new Dropdown(value);
		}).filter((value) => {
			return value.completed;
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
			let top = value.dropdownNode.getBoundingClientRect().bottom + 6;
			let bottom = document.body.clientHeight - value.dropdownNode.getBoundingClientRect().bottom;
			if (top < 69 || bottom < 64 || !inScrollable(value.dropdownNode)) {
				value.dropdownContentNode.hidden = true;
				value.dropdownContentNode.style.maxHeight = '';
				value.dropdownContentNode.style.top = '';
				value.dropdownContentNode.style.left = '';
				value.dropdownContentNode.style.right = '';
			} else {
				value.dropdownContentNode.hidden = false;
				value.dropdownContentNode.style.maxHeight = (bottom - 28).toString() + 'px';
				value.dropdownContentNode.style.top = top.toString() + 'px';
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
			}
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
			return value.completed;
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
		/* '.no-space' */
		forAllClass('no-space').map((value) => {
			return value.childNodes;
		}).forEach((value) => {
			value.forEach((value) => {
				if (value.nodeName == '#text' && value.wholeText.removeSpace() == '') {
					value.textContent = '';
				}
			});
		});
		/* '.no-text' */
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
		forAllTag('major').map((value) => {
			return new Major(value);
		}).filter((value) => {
			return value.completed;
		}).forEach((value) => {
			value.majorPostNode.getAll(':scope > post').map((value) => {
				return new Post(value);
			}).filter((value) => {
				return value.completed;
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
	let dispatcher = async () => {
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
	document.dispatchEvent(eventDispatcherInitialized);
	while (true) {
		await dispatcher();
		await suspend();
	}
})();