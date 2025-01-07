const TEMPLATES = {
  folderItem: (tagname) => `
    <div class="folder-list-item">
      <span class="folder-list-item-icon">
        <i class="el-icon-folder"></i>
      </span>
      <span class="folder-list-item-name">${tagname}</span>
    </div>
  `,
  
  folderViewContainer: `
    <div id="folder-view-container">
      <hr class="divider"/>
      <div id="folder-list-container">
        <ul id="folder-list">
        </ul>
      </div>
      <hr class="divider"/>
    </div>
  `
};

/**
 * Creates a view for folders based on the provided tag names.
 *
 * @param {string[]} tagNames - The list of tag names to display.
 */
function createFolderView(tagNames) {
  const addFolderListItem = (tagname) => {
    document.querySelector('#folder-list').insertAdjacentHTML('beforeend', TEMPLATES.folderItem(tagname));
  }

  const handleFolderListItemClick = (event) => {
    const folderListItem = event.target.closest('.folder-list-item');
    if (folderListItem) {
      const tagName = folderListItem.querySelector('.folder-list-item-name').textContent.trim();
      filterWorkflowsByTag(tagName);
      applyActive(folderListItem);
    }
  }

  const menuContent = document.querySelector('#sidebar [class^="_menuContent_"]');
  menuContent.insertAdjacentHTML('beforebegin', TEMPLATES.folderViewContainer);

  addFolderListItem('All');

  tagNames.forEach(tagName => {
    addFolderListItem(tagName);
  });

  const folderList = document.querySelector('#folder-list');
  folderList.addEventListener('click', (event) => {
    handleFolderListItemClick(event);
  });
}

/**
 * Sets the specified folder item as active and removes the active state from others.
 *
 * @param {Element} folderItem - The folder item element to activate.
 */
async function applyActive(folderItem) {
  const folderItems = document.querySelectorAll('.folder-list-item');
  folderItems.forEach(item => {
    if (item !== folderItem) {
      item.classList.remove('is-active');
    }
  });
  folderItem.classList.add('is-active');
}

/**
 * Filters workflows based on the provided tag name.
 *
 * @param {string} tagName - The name of the tag to filter workflows by.
 */
async function filterWorkflowsByTag(tagName) {
  const isUnfiltered = () => {
    return window.location.pathname === '/home/workflows' && window.location.search.length === 0;
  }

  if (isUnfiltered()) {
    queryXpath(`//li[contains(., "${tagName}") and @data-test-id="tag"]`)?.click();
    return;
  }

  const removeFiltersButton = await waitQuerySelector('a[data-test-id="workflows-filter-reset"]');
  removeFiltersButton.click();

  const intervalId = setInterval(() => {
    if (isUnfiltered()) {
      clearInterval(intervalId);
      queryXpath(`//li[contains(., "${tagName}") and @data-test-id="tag"]`)?.click();
    }
  }, 100);
}

/**
 * Extracts and returns an array of unique tag names from the DOM.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of tag names.
 */
async function extractTagNames() {
  await waitQuerySelector('li[data-test-id="tag"] > span');
  const tagElements = document.querySelectorAll('li[data-test-id="tag"] > span');
  const tagNames = new Set();
  tagElements.forEach(tagElement => {
    tagNames.add(tagElement.textContent.trim());
  });
  return Array.from(tagNames);
}

/**
 * Waits for an element matching the selector to appear in the DOM.
 *
 * @param {string} selector - The CSS selector of the element to wait for.
 * @param {Node} [node=document] - The root node to query within. Defaults to the document.
 * @returns {Promise<Element>} A promise that resolves to the found element.
 */
async function waitQuerySelector(selector, node = document) {
  let obj = null;
  while (!obj) {
    obj = await new Promise(resolve => setTimeout(() => resolve(node.querySelector(selector)), 100));
  }
  return obj;
}

/**
 * Evaluates the given XPath expression and returns the first matching node.
 *
 * @param {string} xpath - The XPath expression to evaluate.
 * @param {Node} [node=document] - The root node to query within. Defaults to the document.
 * @returns {Node | null} The first node that matches the XPath expression, or null if no match is found.
 */
function queryXpath(xpath, node = document) {
  const result = document.evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  return result.singleNodeValue;
}

async function main(){
  const tagNames = await extractTagNames();
  createFolderView(tagNames);
}

main();