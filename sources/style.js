function forAll(selector) {
	return document.querySelectorAll(selector);
}
function forAllTag(name) {
	return document.getElementsByTagName(name);
}
function forAllClass(name) {
	return document.getElementsByClassName(name);
}
Element.prototype.has = function(selector)
{
	return this.querySelector(selector) != null;
}
Element.prototype.get = function(selector)
{
	return this.querySelector(selector);
}
Element.prototype.getAll = function(selector)
{
	return this.querySelectorAll(selector);
}
function arrayForChild(childNode, child) {
	let array = [];
	for (let i = 0; i < childNode.length; i++) {
		if (childNode[i].tagName == child.toUpperCase()) {
			array.push(childNode[i]);
		}
	}
	return array;
}
function insertSurround(parent, child) {
	let parentNode = forAll(parent);
	for (let i = 0; i < parentNode.length; i++) {
		let childNode = parentNode[i].children;
		if (arrayForChild(childNode, child).length == 0) {
			let substance = document.createElement(child);
			substance.prepend(...parentNode[i].childNodes);
			parentNode[i].prepend(substance);
		}
	}
}
function switchFirst(parent, child) {
	let parentNode = forAll(parent);
	for (let i = 0; i < parentNode.length; i++) {
		let childNode = parentNode[i].children;
		parentNode[i].prepend(...arrayForChild(childNode, child));
	}
}
function addFirst(parent, child) {
	let parentNode = forAll(parent);
	for (let i = 0; i < parentNode.length; i++) {
		if (parentNode[i].children.length > 0 && parentNode[i].children[0].tagName == child.toUpperCase()) {
			continue;
		}
		let substance = document.createElement(child);
		parentNode[i].prepend(substance);
	}
}
function moveOutside(parent, child) {
	let parentNode = forAll(parent);
	for (let i = 0; i < parentNode.length; i++) {
		let childNode = parentNode[i].children;
		parentNode[i].parentElement?.prepend(...arrayForChild(childNode, child));
	}
}
function surroundedBy(parent, childNode) {
	let parentNode = childNode.parentElement;
	let surroundingNode = document.createElement(parent);
	surroundingNode.append(childNode);
	parentNode.append(surroundingNode);
}
function removeSpace(text) {
	return text.replace(/\t/g, '').replace(/\r/g, '').replace(/\n/g, '').replace(/\f/g, '')
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
function hasSubstance(parentNode) {
	let childNode = parentNode.childNodes;
	for (let i = 0; i < childNode.length; i++) {
		if (childNode[i].nodeName == '#comment') {
			continue;
		} else if (childNode[i].nodeName == '#text' && removeSpace(childNode[i].wholeText) == '') {
			continue;
		} else if (childNode[i] instanceof Element && childNode[i].nodeName == 'br'.toUpperCase()) {
			continue;
		} else if (childNode[i] instanceof Element && window.getComputedStyle(childNode[i]).display == 'none') {
			continue;
		}
		return true;
	}
	return false;
}
function hasTextOnly(parentNode) {
	let childNode = parentNode.childNodes;
	for (let i = 0; i < childNode.length; i++) {
		if (childNode[i].nodeName == '#comment') {
			continue;
		} else if (childNode[i].nodeName == '#text') {
			continue;
		} else if (childNode[i] instanceof Element && childNode[i].nodeName == 'br'.toUpperCase()) {
			continue;
		}
		return false;
	}
	return true;
}
function hasNoTextWithNode(parentNode) {
	let childNode = parentNode.childNodes;
	for (let i = 0; i < childNode.length; i++) {
		if (childNode[i].nodeName == '#comment') {
			continue;
		} else if (childNode[i].nodeName == '#text' && removeSpace(childNode[i].wholeText) == '') {
			continue;
		} else if (childNode[i] instanceof Element && childNode[i].nodeName != 'br'.toUpperCase()) {
			continue;
		}
		return false;
	}
	return true;
}
function inClient(node) {
	let rect = node.getBoundingClientRect();
	let left = rect.x < document.body.clientWidth;
	let top = rect.y < document.body.clientHeight;
	let right = rect.x + rect.width > 0;
	let bottom = rect.y + rect.height > 0;
	return (left && right) && (top && bottom);
}
function setLocked(node) {
	let parentNode = node.parentElement;
	if (node.tagName == 'a'.toUpperCase() && parentNode?.tagName == 'top'.toUpperCase()) {
		let childNode = parentNode.getAll(':scope > a');
		for (let i = 0; i < childNode.length; i++) {
			if (childNode[i] == node) {
				childNode[i].classList.add('lock');
			} else {
				childNode[i].classList.remove('lock');
			}
		}
	}
}
function makeCascading(headNode, nodeId, styleText) {
	let styleNode = function() {
		let pseudoNode = function() {
			let cascadingNode = headNode.getAll(':scope > style');
			let filteredNode = [];
			for (let i = 0; i < cascadingNode.length; i++) {
				if (cascadingNode[i].id == nodeId) {
					filteredNode.push(cascadingNode[i]);
				}
			}
			return filteredNode;
		}();
		if (pseudoNode.length == 0) {
			let styleNode = document.createElement('style');
			styleNode.type = 'text/css';
			styleNode.id = nodeId;
			headNode.append(styleNode);
			return styleNode;
		} else {
			for (let i = 1; i < pseudoNode.length; i++) {
				pseudoNode[i].remove();
			}
			return pseudoNode[0];
		}
	}();
	if (styleNode.childNodes.length != 1) {
		while (styleNode.firstChild != null) {
			styleNode.removeChild(styleNode.firstChild);
		}
		styleNode.append(document.createTextNode(styleText));
	} else if (styleNode.firstChild.wholeText != styleText) {
		styleNode.firstChild.textContent = styleText;
	}
}
let isLoaded = false;
let hasScrolledInto = false;
requestAnimationFrame(function delegate() {
	function marker() {
		function getMarker(majorNode, stackCount, postNode, index) {
			let markerReversed = false;
			if (majorNode.hasAttribute('marker-reversed')) {
				if (majorNode.getAttribute('marker-reversed').split(' ')[stackCount]?.toLowerCase() == 'true') {
					markerReversed = true;
				};
			}
			let markerStartedWith = 0;
			if (majorNode.hasAttribute('marker-started-with')) {
				let value = parseInt(majorNode.getAttribute('marker-started-with').split(' ')[stackCount]);
				if (!isNaN(value)) {
					markerStartedWith = value;
				};
			}
			if (markerReversed) {
				markerStartedWith += postNode.length - 1 - index;
			} else {
				markerStartedWith += index;
			}
			return markerStartedWith;
		}
		let markedNode = [];
		let orderSelector = ':scope > sub-post > post-leader > post-leader-order';
		let scrollSelector = ':scope > sub-post > scroll-into';
		function subPostConducting(majorNode, stackCount, orderString, postNode) {
			let subPostNode = postNode.getAll(':scope > sub-post > post-content > post');
			for (let i = 0; i < subPostNode.length; i++) {
				let subOrderString = orderString + '.' + getMarker(majorNode, stackCount + 1, subPostNode, i).toString();
				markedNode.push(subPostNode[i]);
				subPostNode[i].setAttribute('marker', subOrderString);
				subPostConducting(majorNode, stackCount + 1, subOrderString, subPostNode[i]);
			}
		}
		let majorNode = forAllTag('major');
		for (let i = 0; i < majorNode.length; i++) {
			if (!majorNode[i].has(':scope > sub-major')) {
				continue;
			}
			let postNode = majorNode[i].get(':scope > sub-major').getAll(':scope > post');
			for (let j = 0; j < postNode.length; j++) {
				let orderString = getMarker(majorNode[i], 0, postNode, j).toString();
				markedNode.push(postNode[j]);
				postNode[j].setAttribute('marker', orderString);
				subPostConducting(majorNode[i], 0, orderString, postNode[j]);
			}
		}
		/* Clearing */ {
			let postNode = forAllTag('post');
			for (let i = 0; i < postNode.length; i++) {
				let isMarked = false;
				for (let j = 0; j < markedNode.length; j++) {
					if (markedNode[j] == postNode[i]) {
						isMarked = true;
						break;
					}
				}
				if (!isMarked) {
					postNode[i].removeAttribute('marker');
				}
			}
		}
	}
	requestAnimationFrame(delegate);
	if (document.readyState != 'complete') {
		return;
	}
	/* scroll-into */
	if (hasScrolledInto == false) {
		hasScrolledInto = true;
		let hash = document.location.hash;
		if (hash.substring(0, 1) == '#')
		{
			setTimeout(function() {
				document.location.hash = '#';
				document.location.hash = hash;
			}, 500);
		}
	}
	/* [ structured-tag ] */
	if (isLoaded == false) {
		isLoaded = true;
		/* major */ {
			/* structuring for the 'major' */ {
				insertSurround('major', 'sub-major');
			}
		}
		/* post */ {
			let postNode = forAllTag('post');
			/* structuring for the 'post's */ {
				insertSurround('post', 'sub-post');
				insertSurround('post > sub-post', 'post-content');
				moveOutside('post > sub-post > post-content', 'post-leader');
				switchFirst('post > sub-post', 'post-leader');
				addFirst('post > sub-post', 'post-leader');
				switchFirst('post > sub-post > post-leader', 'post-leader-advance');
				addFirst('post > sub-post > post-leader', 'post-leader-advance');
				for (let i = 0; i < postNode.length; i++) {
					let advanceChildNode = postNode[i].getAll(':scope > sub-post > post-content > advance > *');
					postNode[i].get(':scope > sub-post > post-leader > post-leader-advance').prepend(...advanceChildNode);
					postNode[i].get(':scope > sub-post > post-leader > post-leader-advance').classList.add('no-text');
				}
				switchFirst('post > sub-post > post-leader', 'post-leader-section');
				addFirst('post > sub-post > post-leader', 'post-leader-section');
				switchFirst('post > sub-post > post-leader > post-leader-section', 'post-leader-title');
				addFirst('post > sub-post > post-leader > post-leader-section', 'post-leader-title');
				switchFirst('post > sub-post > post-leader > post-leader-section', 'post-leader-order');
				addFirst('post > sub-post > post-leader > post-leader-section', 'post-leader-order');
				moveOutside('post > sub-post > post-content', 'scroll-into');
				switchFirst('post > sub-post', 'scroll-into');
				addFirst('post > sub-post', 'scroll-into');
			}
			/* adding the icon for the 'post's */ {
				for (let i = 0; i < postNode.length; i++) {
					let imgNode;
					if (postNode[i].has(':scope > img.icon[alt=""]')) {
						imgNode = postNode[i].get(':scope > img.icon');
					} else {
						imgNode = document.createElement('img');
						imgNode.classList.add('icon');
						imgNode.setAttribute('alt', '');
					}
					let iconSrc = '';
					if (postNode[i].hasAttribute('icon-src')) {
						iconSrc = postNode[i].getAttribute('icon-src');
					}
					imgNode.setAttribute('src', iconSrc);
					postNode[i].prepend(imgNode);
				}
			}
			/* titling for the 'post's */ {
				for (let i = 0; i < postNode.length; i++) {
					if (postNode[i].hasAttribute('headline')) {
						postNode[i].get(':scope > sub-post > post-leader > post-leader-section > post-leader-title').innerText = postNode[i].getAttribute('headline');
					} else {
						postNode[i].get(':scope > sub-post > post-leader > post-leader-section > post-leader-title').innerText = '{headline}';
					}
				}
			}
			/* transferring 'inner-class'-list for the 'post's */ {
				let postInnerClassNode = forAll('post[inner-class]');
				for (let i = 0; i < postInnerClassNode.length; i++) {
					postInnerClassNode[i].get(':scope > sub-post > post-content').setAttribute('class', postInnerClassNode[i].getAttribute('inner-class'));
				}
			}
			/* ordering and hashing for the 'post's */ {
				marker();
				for (let i = 0; i < postNode.length; i++) {
					let orderSelector = ':scope > sub-post > post-leader > post-leader-section > post-leader-order';
					let scrollSelector = ':scope > sub-post > scroll-into';
					let orderString = '{index}';
					if (postNode[i].hasAttribute('hash-id')) {
						orderString = postNode[i].getAttribute('hash-id');
					} else if (postNode[i].hasAttribute('marker')) {
						if (postNode[i].hasAttribute('partial-hash-id')) {
							orderString = postNode[i].getAttribute('marker').substring(0, postNode[i].getAttribute('marker').lastIndexOf('.') + 1) + postNode[i].getAttribute('partial-hash-id');
						} else {
							orderString = postNode[i].getAttribute('marker');
						}
					}
					postNode[i].get(orderSelector).innerText = '#' + orderString;
					postNode[i].get(scrollSelector).id = orderString;
				}
			}
			/* dragging to the bottom for the 'post's */  {
				for (let i = 0; i < postNode.length; i++) {
					let postContentNode = postNode[i].get(':scope > sub-post > post-content');
					let subPostNode = postContentNode.getAll(':scope > post');
					postContentNode.append(...subPostNode);
				}
			}
		}
		/* dropdown */ {
			let dropdownNode = forAllTag('dropdown');
				/* structuring for the 'dropdown's */ {
				insertSurround('dropdown', 'dropdown-content');
				moveOutside('dropdown > dropdown-content', 'outer-margin');
				switchFirst('dropdown', 'outer-margin');
				addFirst('dropdown', 'outer-margin');
				switchFirst('dropdown', 'dropdown-content');
				moveOutside('dropdown > dropdown-content', 'inner-padding');
				switchFirst('dropdown', 'inner-padding');
				addFirst('dropdown', 'inner-padding');
				for (let i = 0; i < dropdownNode.length; i++) {
					let restNode = dropdownNode[i].getAll(':scope > :not(dropdown-content, inner-padding, outer-margin)');
					dropdownNode[i].prepend(...restNode);
				}
			}
		}
		/* background-image with 'basis-layer, backdrop-container > blurred-filter' */ {
			switchFirst('body', 'basis-layer');
			addFirst('body', 'basis-layer');
			switchFirst('major > sub-major > post > sub-post', 'backdrop-container');
			addFirst('major > sub-major > post > sub-post', 'backdrop-container');
			switchFirst('major > sub-major > post > sub-post > backdrop-container', 'blurred-filter');
			addFirst('major > sub-major > post > sub-post > backdrop-container', 'blurred-filter');
		}
	}
	/* [ pseudo-style ] */
	{
		/* style#background-image */ {
			if (document.body.hasAttribute('background-image')) {
				let styleText = `
body > basis-layer, major > sub-major > post > sub-post > backdrop-container > blurred-filter {
	background-image: ` + document.body.getAttribute('background-image') + `;
}
`;
				makeCascading(document.head, 'background-image', styleText);
			} else {
				let styleText = `
body > basis-layer, major > sub-major > post > sub-post > backdrop-container > blurred-filter {
}
`;
				makeCascading(document.head, 'background-image', styleText);
			}
		}
		/* style#mobile-cascading */ {
			let styleText = `
@media (pointer:none), (pointer:coarse) {
	body {
		min-height: ` + window.innerHeight.toString() + `px;
	}
	@media only screen and (max-width: 1048px) {
		body {
			min-width: 1048px;
		}
	}
	@media only screen and (max-width: 570px) {
		body {
			min-width: 570px;
		}
	}
}
`;
			makeCascading(document.head, 'mobile-cascading', styleText);
		}
		/* major */ {
			let majorNode = forAllTag('major');
			/* resizing for the 'major' */ {
				for (let i = 0; i < majorNode.length; i++) {
					if (document.body.clientWidth <= 750) {
						majorNode[i].classList.add('tiny');
					} else {
						majorNode[i].classList.remove('tiny');
					}
				}
			}
		}
		/* top */ {
			let topNode = forAllTag('top');
			/* resizing for the 'top' */ {
				for (let i = 0; i < topNode.length; i++) {
					if (document.body.clientWidth > 1226) {
						topNode[i].id = 'large';
					} else if (document.body.clientWidth >= 1048) {
						topNode[i].id = 'medium';
					} else {
						topNode[i].id = 'small';
					};
				}
			}
			/* locking an option and scrolling into the '.lock' when has been unlocked */ {
				let topNotHoverNode = forAll('top:not(:hover)');
				for (let i = 0; i < topNotHoverNode.length; i++) {
					topNotHoverNode[i].classList.remove('unlocked');
					let aLockNode = topNotHoverNode[i].getAll(':scope > a:not(.has-node).lock');
					if (aLockNode.length == 0) {
						let aNode = topNotHoverNode[i].get(':scope > a:not(.has-node)');
						aNode?.classList.add('lock');
					} else {
						topNotHoverNode[i].scrollTop = aLockNode[0].offsetTop;
						for (let j = 1; j < aLockNode.length; j++) {
							aLockNode[j].classList.remove('lock');
						}
					}
				}
				let topHoverNotUnlockedNode = forAll('top:hover:not(.unlocked)');
				for (let i = 0; i < topHoverNotUnlockedNode.length; i++) {
					topHoverNotUnlockedNode[i].classList.add('unlocked');
					topHoverNotUnlockedNode[i].scrollTop = 0;
				}
			}
			/*  '.icon', '.no-content' and '.has-node' for the 'top > a's */ {
				let aNode = forAll('top > a');
				for (let i = 0; i < aNode.length; i++) {
					if (window.getComputedStyle(aNode[i]).backgroundImage == 'none') {
						aNode[i].classList.remove('icon');
					} else {
						aNode[i].classList.add('icon');
					}
					if (hasSubstance(aNode[i])) {
						aNode[i].classList.remove('no-content');
					} else {
						aNode[i].classList.add('no-content');
					}
					if (hasTextOnly(aNode[i])) {
						aNode[i].classList.remove('has-node');
					} else {
						aNode[i].classList.add('has-node');
					}
				}
			}
			/* ':not(a)'s surrounded by a 'a' for the 'top > :not(a)'s */ {
				let notANode = forAll('top > :not(a)');
				for (let i = 0; i < notANode.length; i++) {
					surroundedBy('a', notANode[i]);
				}
			}
		}
		/* post */ {
			let postNode = forAllTag('post');
			/* '.no-content' for the pairs of 'post > sub-post > post-leader > post-leader-advance' and 'post > sub-post > post-content' */ {
				for (let i = 0; i < postNode.length; i++) {
					let postLeaderAdvanceNode = postNode[i].get(':scope > sub-post > post-leader > post-leader-advance');
					if (hasSubstance(postLeaderAdvanceNode)) {
						postLeaderAdvanceNode.classList.remove('no-content');
					} else {
						postLeaderAdvanceNode.classList.add('no-content');
					}
					let postContentNode = postNode[i].get(':scope > sub-post > post-content');
					if (hasSubstance(postContentNode)) {
						postContentNode.classList.remove('no-content');
					} else {
						postContentNode.classList.add('no-content');
					}
				}
			}
			/* '.has-only-post' for the 'post > sub-post > post-content's */ {
				for (let i = 0; i < postNode.length; i++) {
					let postContentNode = postNode[i].get(':scope > sub-post > post-content');
					function hasOnlyPost(parentNode) {
						let childNode = parentNode.childNodes;
						for (let i = 0; i < childNode.length; i++) {
							if (childNode[i].nodeName == '#comment') {
								continue;
							} else if (childNode[i].nodeName == '#text' && removeSpace(childNode[i].wholeText) == '') {
								continue;
							} else if (childNode[i] instanceof Element && childNode[i].nodeName == 'br'.toUpperCase()) {
								continue;
							} else if (childNode[i] instanceof Element && childNode[i].nodeName == 'post'.toUpperCase()) {
								continue;
							} else if (childNode[i] instanceof Element && window.getComputedStyle(childNode[i]).display == 'none') {
								continue;
							}
							return false;
						}
						return true;
					}
					if (hasOnlyPost(postContentNode)) {
						postContentNode.classList.add('has-only-post');
					} else {
						postContentNode.classList.remove('has-only-post');
					}
				}
			}
			/* '.non-blur' for the 'post's */ {
				marker();
				for (let i = 0; i < postNode.length; i++) {
					if (postNode[i].hasAttribute('marker')) {
						postNode[i].classList.remove('non-blur');
					} else {
						postNode[i].classList.add('non-blur');
					}
				}
			}
			/* '.no-text' for the 'post > sub-post > post-leader > post-leader-advance > dropdown's */ {
				for (let i = 0; i < postNode.length; i++) {
					let dropdownNode = postNode[i].getAll(':scope > sub-post > post-leader > post-leader-advance > dropdown');
					for (let j = 0; j < dropdownNode.length; j++) {
						dropdownNode[j].classList.add('no-text');
					}
				}
			}
		}
		/* dropdown */ {
			let dropdownNode = forAllTag('dropdown');
			/* '.has-node' for the 'dropdown > dropdown-content > a's */ {
				for (let i = 0; i < dropdownNode.length; i++) {
					let aNode = dropdownNode[i].get(':scope > dropdown-content').getAll(':scope > a');
					for (let j = 0; j < aNode.length; j++) {
						if (hasTextOnly(aNode[j])) {
							aNode[j].classList.remove('has-node');
						} else {
							aNode[j].classList.add('has-node');
						}
					}
				}
			}
			/* ':not(a)'s surrounded by a 'a' for the 'dropdown > dropdown-content > :not(a)'s */ {
				for (let i = 0; i < dropdownNode.length; i++) {
					let notANode = dropdownNode[i].get(':scope > dropdown-content').getAll(':scope > :not(a)');
					for (let j = 0; j < notANode.length; j++) {
						surroundedBy('a', notANode[j]);
					}
				}
			}
			/* '.has-disabled' for the 'dropdown's existing 'button.disabled's */ {
				for (let i = 0; i < dropdownNode.length; i++) {
					if (dropdownNode[i].has('button.disabled')) {
						dropdownNode[i].classList.add('has-disabled');
					} else {
						dropdownNode[i].classList.remove('has-disabled');
					}
				}
			}
			/* setting the 'maxHeight', 'left' and 'right' style, and '.hidden' for a 'dropdown-content' */ {
				for (let i = 0; i < dropdownNode.length; i++) {
					if (!dropdownNode[i].has(':scope > dropdown-content')) {
						continue;
					}
					let targetNode = dropdownNode[i].get(':scope > dropdown-content');
					let top = dropdownNode[i].getBoundingClientRect().bottom + 6;
					let bottom = document.body.clientHeight - dropdownNode[i].getBoundingClientRect().bottom;
					if (top < 69 || bottom < 64 || !inClient(dropdownNode[i])) {
						targetNode.classList.add('hidden');
						targetNode.style.maxHeight = '';
						targetNode.style.top = '';
						targetNode.style.left = '';
						targetNode.style.right = '';
						continue;
					} else {
						targetNode.classList.remove('hidden');
						targetNode.style.maxHeight = (bottom - 28).toString() + 'px';
						targetNode.style.top = top.toString() + 'px';
					}
					let left = dropdownNode[i].getBoundingClientRect().left;
					if (left < 6) {
						targetNode.style.left = '6px';
						targetNode.style.right = '';
					} else if (document.body.clientWidth - left - 6 < targetNode.offsetWidth) {
						targetNode.style.left = '';
						targetNode.style.right = '6px';
					} else {
						targetNode.style.left = left.toString() + 'px';
						targetNode.style.right = '';
					}
				}
			}
			/* '.no-content' for a 'dropdown-content' */ {
				for (let i = 0; i < dropdownNode.length; i++) {
					let dropdownContentNode = dropdownNode[i].get(':scope > dropdown-content');
					if (hasSubstance(dropdownContentNode)) {
						dropdownContentNode.classList.remove('no-content');
					} else {
						dropdownContentNode.classList.add('no-content');
					}
				}
			}
			/* '.has-single-button' for the 'dropdown's */ {
				for (let i = 0; i < dropdownNode.length; i++) {
					if (dropdownNode[i].has(':scope > button:first-of-type:last-of-type') && hasNoTextWithNode(dropdownNode[i])) {
						dropdownNode[i].classList.add('has-single-button');
					} else {
						dropdownNode[i].classList.remove('has-single-button');
					}
				}
			}
		}
		/* button */ {
			/* '.icon' and '.no-content' for the 'button.advance's */ {
				let buttonAdvanceNode = forAll('button.advance');
				for (let i = 0; i < buttonAdvanceNode.length; i++) {
					if (window.getComputedStyle(buttonAdvanceNode[i]).backgroundImage == 'none') {
						buttonAdvanceNode[i].classList.remove('icon');
					} else {
						buttonAdvanceNode[i].classList.add('icon');
					}
					if (hasSubstance(buttonAdvanceNode[i])) {
						buttonAdvanceNode[i].classList.remove('no-content');
					} else {
						buttonAdvanceNode[i].classList.add('no-content');
					}
				}
			}
		}
		/* .no-space */ {
			let anyNoSpaceNode = forAllClass('no-space');
			for (let i = 0; i < anyNoSpaceNode.length; i++) {
				let childNode = anyNoSpaceNode[i].childNodes;
				for (let j = 0; j < childNode.length; j++) {
					if (childNode[j].nodeName == '#text' && removeSpace(childNode[j].wholeText) == '') {
						childNode[j].textContent = '';
					}
				}
			}
		}
		/* .no-text */ {
			let anyNoSpaceNode = forAllClass('no-text');
			for (let i = 0; i < anyNoSpaceNode.length; i++) {
				let childNode = anyNoSpaceNode[i].childNodes;
				for (let j = 0; j < childNode.length; j++) {
					if (childNode[j].nodeName == '#text') {
						childNode[j].textContent = '';
					}
				}
			}
		}
		/* background-image with 'basis-layer, backdrop-container > blurred-filter' */ {
			let postNode = forAll('major > sub-major > post');
			for (let i = 0; i < postNode.length; i++) {
				if (!postNode[i].has(':scope > sub-post > backdrop-container')) {
					continue;
				}
				let backdropContainerNode = postNode[i].get(':scope > sub-post > backdrop-container');
				function isMobile(stringUserAgent) {
					return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|ad|od)|Macintosh|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(stringUserAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(stringUserAgent.substr(0, 4));
				}
				if (!isMobile(navigator.userAgent) || inClient(postNode[i])) {
					backdropContainerNode.classList.remove('suspended');
				} else {
					backdropContainerNode.classList.add('suspended');
				}
			}
		}
	}
});