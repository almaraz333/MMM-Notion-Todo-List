const NodeHelper = require("node_helper");
const { config } = require("dotenv");
config();

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

  fetchNotionData: async function(config) {
    try {
      const apiKey = config.apiKey;
      const pageId = config.pageId;
      console.log("KEYS HERE:", apiKey, pageId)

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

