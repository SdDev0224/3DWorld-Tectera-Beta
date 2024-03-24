var ai = {};

// OpenAI GPT
const { Configuration, OpenAIApi } = require("openai");
const openai = new OpenAIApi(new Configuration({ apiKey: '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',}));
ai.sendMessage = function(io, db, room, username, message) {
  // Load chat history for this room
  db.loadChatHistory(room, async (history) => {
    history = history.reverse();
    var messages = [];
    var charCount = 0;
    const MAX_CHARS = 1000;
    for (message in history) {
      var user = "user";
      if (history[message].username == username) user = "assistant";
      messages.push({"role": user, "content": history[message].message});
      charCount += history[message].message.length;
      if (charCount > MAX_CHARS) break;
    }
    messages.push({"role": "system", "content": "You are a helpful assistant."});
    messages = messages.reverse();
    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      const responseText = response.data.choices[0].message.content;

      // Send reply to room
      data = {room: room, username: "GPT", message: responseText};
      io.to(room).emit('message', data);

      // Save to room
      db.storeMessage(room, "GPT", responseText);
    } catch (error) {
      // Error
      if (error.response == null) console.log(error);
      else if (error.response.status == 429) console.log('No requests left', error);
      else console.log(error);
    }
  });
};

// Export
module.exports = ai;
