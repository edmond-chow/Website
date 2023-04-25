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
function hasSubstance(parentNode) {
	let childNode = parentNode.childNodes;
	for (let i = 0; i < childNode.length; i++) {
		if (childNode[i].nodeName == '#comment') {
			continue;
		} else if (childNode[i].nodeName == '#text' && childNode[i].wholeText.replace(/\n/g, '').replace(/ /g, '') == '') {
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
	let left = rect.x < (window.innerWidth || document.documentElement.clientWidth);
	let top = rect.y < (window.innerHeight || document.documentElement.clientHeight);
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
let isLoaded = false;
let hasScrolledInto = false;
let load = setInterval(function() {
	if (document.readyState == 'complete' && isLoaded == false) {
		isLoaded = true;
		/* structuring for the 'content' */ {
			insertSurround('content', 'sub-content');
		}
		/* structuring for the 'post's */ {
			insertSurround('post', 'sub-post');
			insertSurround('sub-post', 'post-content');
			moveOutside('post-content', 'post-leader');
			addFirst('sub-post', 'post-leader');
			switchFirst('post-leader', 'post-leader-title');
			addFirst('post-leader', 'post-leader-title');
			switchFirst('post-leader', 'post-leader-order');
			addFirst('post-leader', 'post-leader-order');
			moveOutside('post-content', 'scroll-into');
			addFirst('sub-post', 'scroll-into');
		}
		/* titling for the 'post's */ {
			let titleNode = document.querySelectorAll('post > sub-post > post-leader > post-leader-title');
			for (let i = 0; i < titleNode.length; i++) {
				let targetNode = titleNode[i].parentElement.parentElement.parentElement;
				if (targetNode.hasAttribute('headline')) {
					titleNode[i].innerText = targetNode.getAttribute('headline');
				}
			}
		}
		/* transferring 'inner-class'-list for the 'post's */ {
			let postNode = document.getElementsByTagName('post');
			for (let i = 0; i < postNode.length; i++) {
				if (postNode[i].hasAttribute('inner-class')) {
					postNode[i].querySelector(':scope > sub-post > post-content').setAttribute('class', postNode[i].getAttribute('inner-class'));
				}
			}
		}
		/* ordering and hashing for the 'post's */ {
			let orderSelector = ':scope > sub-post > post-leader > post-leader-order';
			let scrollSelector = ':scope > sub-post > scroll-into';
			function subPostOrdering(orderString, postNode) {
				let subPostNode = postNode.querySelectorAll(':scope > sub-post > post-content > post');
				if (subPostNode == null) {
					return;
				}
				for (let i = 0; i < subPostNode.length; i++) {
					let subOrderString = orderString + '.' + i.toString();
					subPostNode[i].querySelector(orderSelector).innerText = '#' + subOrderString;
					subPostNode[i].querySelector(scrollSelector).id = subOrderString;
					subPostOrdering(subOrderString, subPostNode[i]);
				}
			}
			let postNode = document.querySelectorAll('content > sub-content > post');
			for (let i = 0; i < postNode.length; i++) {
				let orderString = i.toString();
				postNode[i].querySelector(orderSelector).innerText = '#' + orderString;
				postNode[i].querySelector(scrollSelector).id = orderString;
				subPostOrdering(orderString, postNode[i]);
			}
		}
		/* disposing all the 'inner-padding's and 'outer-margin's for a 'dropdown' in use */ {
			let dropdownNode = document.querySelectorAll('dropdown');
			for (let i = 0; i < dropdownNode.length; i++) {
				let innerNode = dropdownNode[i].querySelectorAll('inner-padding');
				for (let j = 0; j < innerNode.length; j++) {
					innerNode[j].classList.add('hidden');
				}
				let outerNode = dropdownNode[i].querySelectorAll('outer-margin');
				for (let j = 0; j < outerNode.length; j++) {
					outerNode[j].classList.add('hidden');
				}
			}
		}
		/* adding all the 'inner-padding's and 'outer-margin's for a 'dropdown-content' to be placed in client */ {
			let dropdownNode = document.querySelectorAll('dropdown');
			for (let i = 0; i < dropdownNode.length; i++) {
				let targetNode = dropdownNode[i].querySelector(':scope > dropdown-content');
				if (targetNode.previousSibling.tagName != 'inner-padding'.toUpperCase()) {
					let innerNode = document.createElement('inner-padding');
					dropdownNode[i].insertBefore(innerNode, targetNode);
				}
				targetNode.previousSibling.classList.remove('hidden');
				if (targetNode.nextSibling.tagName != 'outer-margin'.toUpperCase()) {
					let outerNode = document.createElement('outer-margin');
					dropdownNode[i].insertBefore(outerNode, targetNode.nextSibling);
				}
				targetNode.nextSibling.classList.remove('hidden');
			}
		}
	}
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
			/* locking an option and scrolling into the top when has been unlocked */
			let topNotHoverNode = document.querySelectorAll('top:not(:hover)');
			for (let i = 0; i < topNotHoverNode.length; i++) {
				topNotHoverNode[i].classList.remove('unlocked');
				let aLockNode = topNotHoverNode[i].querySelectorAll(':scope > a:not(.has-content).lock');
				if (aLockNode.length == 0) {
					let aNode = topNotHoverNode[i].querySelector(':scope > a:not(.has-content)');
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
			/* 'dropdown-content's should exist atleast 1 from a 'dropdown' */
			for (let i = 0; i < dropdownNode.length; i++) {
				if (dropdownNode[i].querySelectorAll(':scope > dropdown-content').length == 0) {
					let targetNode = document.createElement('dropdown-content');
					dropdownNode[i].insertBefore(targetNode, dropdownNode[i].lastChild);
				}
			}
			/* setting the 'maxHeight' style for a 'dropdown-content' */
			for (let i = 0; i < dropdownNode.length; i++) {
				if (!inClient(dropdownNode[i])) {
					continue;
				}
				let targetNode = dropdownNode[i].querySelector(':scope > dropdown-content');
				let bottom = document.body.clientHeight - dropdownNode[i].getBoundingClientRect().bottom;
				if (bottom < 64) {
					targetNode.classList.add('hidden');
					targetNode.style.maxHeight = '';
				} else {
					targetNode.classList.remove('hidden');
					targetNode.style.maxHeight = (bottom - 28).toString() + 'px';
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
					document.getElementById(hash).scrollIntoView();
				}
			}
		}
		/* no-space */ {
			let anyNode = document.getElementsByClassName('no-space');
			for (let i = 0; i < anyNode.length; i++) {
				let childNode = anyNode[i].childNodes;
				for (let j = 0; j < childNode.length; j++) {
					if (childNode[j].nodeName == '#text' && childNode[j].wholeText.replace(/\n/g, '').replace(/ /g, '') == '') {
						childNode[j].textContent = '';
					}
				}
			}
		}
	}
}, 100);