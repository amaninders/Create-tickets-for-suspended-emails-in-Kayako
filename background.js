// regex to identify the suspended message page URL
var rxLookfor = /^(.*)(kayako\.com\/agent\/conversations\/suspended-messages\/)[1-9]\d(.*)$/;

// binding event listner to the tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (rxLookfor.test(changeInfo.url)) {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
      title: "Allow Email",
      contexts: ["browser_action"],
      onclick: function() {
        // alert('first');
        chrome.tabs.sendMessage(tabId, 'allow'); //sends a message to the content.js
      }
    });   
  };
});