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
  getStyles: function() {
    return ["MMM-Notion-Todo-List.css"];
  },
  getDom: function() {
    const wrapper = document.createElement("div");

    if (!this.tasks) {
      wrapper.innerHTML = "Loading tasks...";
      return wrapper;
    }

    const listContainer = document.createElement("div");
    listContainer.className = "notion-task-list";

    this.tasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.className = "notion-task-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.checked;
      checkbox.disabled = true;

      const label = document.createElement("label");
      label.className = "notion-task-label";
      label.textContent = task.text;

      if (task.checked) {
        label.classList.add("completed");
      }

      taskItem.appendChild(checkbox);
      taskItem.appendChild(label);
      listContainer.appendChild(taskItem);
    });

    wrapper.appendChild(listContainer);
    return wrapper;
  },

});

