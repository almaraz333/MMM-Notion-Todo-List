Module.register("MMM-Notion-Todo-List", {
  defaults: {
    updateInterval: 60000,
  },

  start: function() {
    console.log("MMM-Notion-Todo-List module started.");
    this.tasks = null;
    this.getData();

    setInterval(() => {
      this.getData();
    }, this.config.updateInterval);
  },

  getData: function() {
    console.log("Requesting data from Node helper...");
    console.log("CONFIG PRE SEND", this.config)
    this.sendSocketNotification("FETCH_NOTION_DATA", this.config);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "NOTION_DATA") {
      console.log("Received tasks from Node helper:", payload);
      this.tasks = payload;
      this.updateDom();
    } else if (notification === "NOTION_ERROR") {
      console.error("Error from Node helper:", payload);
    }
  },

  getDom: function() {
    const wrapper = document.createElement("div");

    if (!this.tasks) {
      wrapper.innerHTML = "Loading tasks...";
      return wrapper;
    }

    const list = document.createElement("ul");
    list.style.cssText = "color: white;";
    this.tasks.forEach((task) => {
      const listItem = document.createElement("li");
      listItem.textContent = task.checked
        ? `☑️ ${task.text}`
        : `⬜ ${task.text}`;
      list.appendChild(listItem);
    });

    wrapper.appendChild(list);
    return wrapper;
  },
});

