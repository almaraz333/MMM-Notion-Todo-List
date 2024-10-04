const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  async start() {
    console.log("MMM-Notion-Todo-List helper started...");
    const { Client } = await import("@notionhq/client");
    this.Client = Client;
  },

  socketNotificationReceived: async function(notification, payload) {
    if (notification === "FETCH_NOTION_DATA") {
      this.fetchNotionData(payload);
    }
  },
  socketNotificationReceived: function(notification, payload) {
    if (notification === "FETCH_NOTION_DATA") {
      this.fetchNotionData(payload);
    } else if (notification === "UPDATE_TASK_STATUS") {
      this.updateTaskStatus(payload);
    }
  },
  updateTaskStatus: async function(payload) {
    try {

      const apiKey = config.apiKey;
      const notion = new this.Client({ auth: apiKey });

      console.log(payload.task)

      // Update the task in Notion
      // await notion.pages.update({
      //   page_id: taskId,
      //   properties: {
      //     "Done": {
      //       checkbox: checked,
      //     },
      //   },
      // });

      // this.fetchNotionData(config);

    } catch (error) {
      console.error("Error updating task status in Notion:", error);
      this.sendSocketNotification("NOTION_ERROR", error.message);
    }
  },


  fetchNotionData: async function(config) {
    try {
      const apiKey = config.apiKey;
      const pageId = config.pageId;

      // Use the dynamically imported Client
      const notion = new this.Client({ auth: apiKey });
      const blocks = await this.retrieveBlockChildren(notion, pageId);
      const tasks = this.getTasksFromBlocks(blocks);

      this.sendSocketNotification("NOTION_DATA", tasks);
    } catch (error) {
      console.error("Error fetching Notion data:", error);
      this.sendSocketNotification("NOTION_ERROR", error.message);
    }
  },

  retrieveBlockChildren: async function(notion, id) {
    const blocks = [];
    let cursor;

    do {
      const response = await notion.blocks.children.list({
        block_id: id,
        start_cursor: cursor,
      });
      blocks.push(...response.results);
      cursor = response.has_more ? response.next_cursor : null;
    } while (cursor);

    return blocks;
  },

  getTasksFromBlocks: function(blocks) {
    const tasks = blocks
      .filter((block) => block.type === "to_do")
      .map((block) => {
        return {
          text: this.getPlainTextFromRichText(block.to_do.rich_text),
          checked: block.to_do.checked,
        };
      });
    return tasks;
  },

  getPlainTextFromRichText: function(richText) {
    return richText.map((t) => t.plain_text).join("");
  },
});

