import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

export const broadcastBuys = functions.firestore
  .document("/moralis/events/TelegramBot/{docId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data() as { confirmed: boolean };
    const oldData = change.before.data() as { confirmed: boolean };

    // Check if the "confirmed" key has been set to "true" in the updated data
    if (newData.confirmed && !oldData.confirmed) {
      // eslint-disable-next-line max-len
      console.log(`Document with ID ${context.params.docId} has been updated and "confirmed" is now set to true.`);
      // send the doc to our telegram API endpoint
      const document = change.after.data();
      try {
        const response = await axios.post("https://telegram-bot-rose-two.vercel.app/api/swap", document);
        console.log(`POST request sent. Response status: ${response.status}.`);
      } catch (error) {
        console.error(`Error sending POST request: ${error}`);
      }
    }
  });
