function insertSurround(parent, child) {
	let parentNode = document.getElementsByTagName(parent);
	for (let i = 0; i < parentNode.length; i++) {
		let childNode = parentNode[i].getElementsByTagName(child);
		if (childNode.length == 0) {
			let substance = document.createElement(child);
			substance.append(...parentNode[i].childNodes);
			parentNode[i].append(substance);
		}
	}
}
function switchFirst(parent, child) {
	let childNode = document.getElementsByTagName(child);
	for (let i = 0; i < childNode.length; i++) {
		let parentNode = childNode[i].parentElement;
		if (parentNode?.tagName != parent.toUpperCase()) {
			continue;
		}
		parentNode.prepend(childNode[i]);
	}
}
function addFirst(parent, child) {
	let parentNode = document.getElementsByTagName(parent);
	for (let i = 0; i < parentNode.length; i++) {
		if (parentNode[i].children.length > 0 && parentNode[i].children[0].tagName == child.toUpperCase()) {
			continue;
		}
		let substance = document.createElement(child);
		parentNode[i].prepend(substance);
	}
}
function moveOutside(parent, child) {
	let childNode = document.getElementsByTagName(child);
	for (let i = 0; i < childNode.length; i++) {
		let parentNode = childNode[i].parentElement;
		if (parentNode?.tagName != parent.toUpperCase()) {
			continue;
		}
		parentNode.parentElement?.prepend(childNode[i]);
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
		} else if (childNode[i].nodeName == 'br'.toUpperCase()) {
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
		} else if (childNode[i].nodeName == 'br'.toUpperCase()) {
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
	let right = rect.x + node.offsetWidth > 0;
	let bottom = rect.y + node.offsetHeight > 0;
	return (left && right) && (top && bottom);
}
function setLocked(node) {
	let parentNode = node.parentElement;
	if (node.tagName == 'a'.toUpperCase() && parentNode?.tagName == 'top'.toUpperCase()) {
		let childNode = parentNode.querySelectorAll(':scope > a');
		for (let i = 0; i < childNode.length; i++) {
			if (childNode[i] == node) {
				childNode[i].classList.add('lock');
			} else {
				childNode[i].classList.remove('lock');
			}
		}
	}
}
Element.prototype.has = function(selector)
{
	return this.querySelector(selector) != null;
}
Element.prototype.get = function(selector)
{
	return this.querySelector(selector);
}
let isLoaded = false;
let hasScrolledInto = false;
let load = setTimeout(function delegate() {
	function marker() {
		let markedNode = [];
		let orderSelector = ':scope > sub-post > post-leader > post-leader-order';
		let scrollSelector = ':scope > sub-post > scroll-into';
		function subPostConducting(orderString, postNode) {
			let subPostNode = postNode.querySelectorAll(':scope > sub-post > post-content > post');
			for (let i = 0; i < subPostNode.length; i++) {
				let subOrderString = orderString + '.' + i.toString();
				markedNode[markedNode.length] = subPostNode[i];
				subPostNode[i].setAttribute('marker', subOrderString);
				subPostConducting(subOrderString, subPostNode[i]);
			}
		}
		let postNode = document.querySelectorAll('content > sub-content > post');
		for (let i = 0; i < postNode.length; i++) {
			let orderString = i.toString();
			markedNode[markedNode.length] = postNode[i];
			postNode[i].setAttribute('marker', orderString);
			subPostConducting(orderString, postNode[i]);
		}
		/* Clearing */ {
			let postNode = document.getElementsByTagName('post');
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
	/* [ structured-tag ] */
	if (document.readyState == 'complete' && isLoaded == false) {
		isLoaded = true;
		/* structuring for the 'content' */ {
			insertSurround('content', 'sub-content');
		}
		let postNode = document.getElementsByTagName('post');
		/* structuring for the 'post's */ {
			insertSurround('post', 'sub-post');
			insertSurround('sub-post', 'post-content');
			moveOutside('post-content', 'post-leader');
			switchFirst('sub-post', 'post-leader');
			addFirst('sub-post', 'post-leader');
			switchFirst('post-leader', 'post-leader-advance');
			addFirst('post-leader', 'post-leader-advance');
			for (let i = 0; i < postNode.length; i++) {
				let advanceChildNode = postNode[i].querySelectorAll(':scope > sub-post > post-content > advance > *');
				postNode[i].get('post > sub-post > post-leader > post-leader-advance').prepend(...advanceChildNode);
			}
			switchFirst('post-leader', 'post-leader-title');
			addFirst('post-leader', 'post-leader-title');
			switchFirst('post-leader', 'post-leader-order');
			addFirst('post-leader', 'post-leader-order');
			moveOutside('post-content', 'scroll-into');
			switchFirst('sub-post', 'scroll-into');
			addFirst('sub-post', 'scroll-into');
		}
		/* adding the icon for the 'post's */ {
			for (let i = 0; i < postNode.length; i++) {
				let imgNode;
				if (postNode[i].has(':scope > img.icon')) {
					imgNode = postNode[i].get(':scope > img.icon');
				} else {
					imgNode = document.createElement('img');
					imgNode.classList.add('icon');
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
					postNode[i].get(':scope > sub-post > post-leader > post-leader-title').innerText = postNode[i].getAttribute('headline');
				} else {
					postNode[i].get(':scope > sub-post > post-leader > post-leader-title').innerText = '{headline}';
				}
			}
		}
		/* transferring 'inner-class'-list for the 'post's */ {
			let postNode = document.querySelectorAll('post[inner-class]');
			for (let i = 0; i < postNode.length; i++) {
				postNode[i].get(':scope > sub-post > post-content').setAttribute('class', postNode[i].getAttribute('inner-class'));
			}
		}
		/* ordering and hashing for the 'post's */ {
			marker();
			for (let i = 0; i < postNode.length; i++) {
				let orderSelector = ':scope > sub-post > post-leader > post-leader-order';
				let scrollSelector = ':scope > sub-post > scroll-into';
				let orderString = '{index}';
				if (postNode[i].hasAttribute('hash-id')) {
					orderString = postNode[i].getAttribute('hash-id');
				} else if (postNode[i].hasAttribute('marker')) {
					orderString = postNode[i].getAttribute('marker');
				}
				postNode[i].get(orderSelector).innerText = '#' + orderString;
				postNode[i].get(scrollSelector).id = orderString;
			}
		}
		let dropdownNode = document.getElementsByTagName('dropdown');
		/* structuring for the 'dropdown's */ {
			insertSurround('dropdown', 'dropdown-content');
			moveOutside('dropdown-content', 'outer-margin');
			switchFirst('dropdown', 'outer-margin');
			addFirst('dropdown', 'outer-margin');
			switchFirst('dropdown', 'dropdown-content');
			moveOutside('dropdown-content', 'inner-padding');
			switchFirst('dropdown', 'inner-padding');
			addFirst('dropdown', 'inner-padding');
			for (let i = 0; i < dropdownNode.length; i++) {
				let restNode = dropdownNode[i].querySelectorAll(':scope > :not(dropdown-content, inner-padding, outer-margin)');
				dropdownNode[i].prepend(...restNode);
			}
		}
	}
	/* [ pseudo-style ] */
	if (isLoaded == true) {
		/* top */ {
			/* resizing for the 'top' */
			let topNode = document.getElementsByTagName('top');
			for (let i = 0; i < topNode.length; i++) {
				if (document.body.clientWidth > 1226) {
					topNode[i].id = 'large';
				} else if (document.body.clientWidth >= 1048) {
					topNode[i].id = 'medium';
				} else {
					topNode[i].id = 'small';
				};
			}
			/* locking an option and scrolling into the '.lock' when has been unlocked */
			let topNotHoverNode = document.querySelectorAll('top:not(:hover)');
			for (let i = 0; i < topNotHoverNode.length; i++) {
				topNotHoverNode[i].classList.remove('unlocked');
				let aLockNode = topNotHoverNode[i].querySelectorAll(':scope > a:not(.has-content).lock');
				if (aLockNode.length == 0) {
					let aNode = topNotHoverNode[i].get(':scope > a:not(.has-content)');
					aNode?.classList.add('lock');
				} else {
					topNotHoverNode[i].scrollTop = aLockNode[0].offsetTop;
					for (let j = 1; j < aLockNode.length; j++) {
						aLockNode[j].classList.remove('lock');
					}
				}
			}
			let topHoverNotUnlockedNode = document.querySelectorAll('top:hover:not(.unlocked)');
			for (let i = 0; i < topHoverNotUnlockedNode.length; i++) {
				topHoverNotUnlockedNode[i].classList.add('unlocked');
				topHoverNotUnlockedNode[i].scrollTop = 0;
			}
			/* '.has-content' and '.icon' for the 'top > a's */
			let aNode = document.querySelectorAll('top > a');
			for (let i = 0; i < aNode.length; i++) {
				if (hasTextOnly(aNode[i])) {
					aNode[i].classList.remove('has-content');
				} else {
					aNode[i].classList.add('has-content');
				}
				if (window.getComputedStyle(aNode[i]).backgroundImage == 'none') {
					aNode[i].classList.remove('icon');
				} else {
					aNode[i].classList.add('icon');
				}
			}
			/* ':not(a)'s surrounded by a 'a' for the 'top > :not(a)'s */
			let notANode = document.querySelectorAll('top > :not(a)');
			for (let i = 0; i < notANode.length; i++) {
				surroundedBy('a', notANode[i]);
			}
			/* '.no-content' for the 'top > a's */
			for (let i = 0; i < aNode.length; i++) {
				if (hasSubstance(aNode[i])) {
					aNode[i].classList.remove('no-content');
				} else {
					aNode[i].classList.add('no-content');
				}
			}
		}
		/* post */ {
			/* '.no-content' for the 'post > sub-post > post-content's */
			let postContentNode = document.querySelectorAll('post > sub-post > post-content');
			for (let i = 0; i < postContentNode.length; i++) {
				if (hasSubstance(postContentNode[i])) {
					postContentNode[i].classList.remove('no-content');
				} else {
					postContentNode[i].classList.add('no-content');
				}
			}
			/* '.non-blur' for the 'post's */
			marker();
			let postNode = document.getElementsByTagName('post');
			for (let i = 0; i < postNode.length; i++) {
				if (postNode[i].hasAttribute('marker')) {
					postNode[i].classList.remove('non-blur');
				} else {
					postNode[i].classList.add('non-blur');
				}
			}
		}
		/* dropdown */ {
			/* '.has-content' for the 'dropdown > dropdown-content > a's */
			let aNode = document.querySelectorAll('dropdown > dropdown-content > a');
			for (let i = 0; i < aNode.length; i++) {
				if (hasTextOnly(aNode[i])) {
					aNode[i].classList.remove('has-content');
				} else {
					aNode[i].classList.add('has-content');
				}
			}
			/* ':not(a)'s surrounded by a 'a' for the 'dropdown > dropdown-content > :not(a)'s */
			let notANode = document.querySelectorAll('dropdown > dropdown-content > :not(a)');
			for (let i = 0; i < notANode.length; i++) {
				surroundedBy('a', notANode[i]);
			}
			/* '.has-disabled' for the 'dropdown's existing 'button.disabled's */
			let dropdownNode = document.getElementsByTagName('dropdown');
			for (let i = 0; i < dropdownNode.length; i++) {
				if (dropdownNode[i].querySelectorAll('button.disabled').length == 0) {
					dropdownNode[i].classList.remove('has-disabled');
				} else {
					dropdownNode[i].classList.add('has-disabled');
				}
			}
			/* setting the 'maxHeight' and 'right' style for a 'dropdown-content' */
			for (let i = 0; i < dropdownNode.length; i++) {
				if (!inClient(dropdownNode[i]) || !dropdownNode[i].has(':scope > dropdown-content')) {
					continue;
				}
				let targetNode = dropdownNode[i].get(':scope > dropdown-content');
				let bottom = document.body.clientHeight - dropdownNode[i].getBoundingClientRect().bottom;
				if (bottom < 64) {
					targetNode.classList.add('hidden');
					targetNode.style.maxHeight = '';
				} else {
					targetNode.classList.remove('hidden');
					targetNode.style.maxHeight = (bottom - 28).toString() + 'px';
				}
				let left = dropdownNode[i].getBoundingClientRect().left;
				if (left < 8) {
					targetNode.style.left = (4 - left).toString() + 'px';
				} else {
					targetNode.style.left = '';
				}
				let right = document.body.clientWidth - dropdownNode[i].getBoundingClientRect().right;
				if (right + dropdownNode[i].clientWidth < Math.max(targetNode.clientWidth, 175) + 8) {
					targetNode.style.right = (4 - right).toString() + 'px';
				} else {
					targetNode.style.right = '';
				}
			}
			/* '.no-option' for a 'dropdown-content' */
			let dropdownContentNode = document.querySelectorAll('dropdown > dropdown-content');
			for (let i = 0; i < dropdownContentNode.length; i++) {
				if (hasSubstance(dropdownContentNode[i])) {
					dropdownContentNode[i].classList.remove('no-option');
				} else {
					dropdownContentNode[i].classList.add('no-option');
				}
			}
		}
		/* button */ {
			/* '.icon' and '.no-content' for the 'button.advance's */
			let buttonNode = document.querySelectorAll('button.advance');
			for (let i = 0; i < buttonNode.length; i++) {
				if (window.getComputedStyle(buttonNode[i]).backgroundImage == 'none') {
					buttonNode[i].classList.remove('icon');
				} else {
					buttonNode[i].classList.add('icon');
				}
				if (hasSubstance(buttonNode[i])) {
					buttonNode[i].classList.remove('no-content');
				} else {
					buttonNode[i].classList.add('no-content');
				}
			}
		}
		/* scroll-into */ {
			if (hasScrolledInto == false) {
				hasScrolledInto = true;
				let hash = document.location.hash;
				if (hash != '')
				{
					hash = hash.substring(1, hash.length);
					document.getElementById(hash)?.scrollIntoView();
				}
			}
		}
		/* no-space */ {
			let anyNode = document.getElementsByClassName('no-space');
			for (let i = 0; i < anyNode.length; i++) {
				let childNode = anyNode[i].childNodes;
				for (let j = 0; j < childNode.length; j++) {
					if (childNode[j].nodeName == '#text' && removeSpace(childNode[j].wholeText) == '') {
						childNode[j].textContent = '';
					}
				}
			}
		}
	}
	load = setTimeout(delegate, 100);
}, 100);