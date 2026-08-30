import { encode } from "base-64";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GITHUB_TOKEN = "YOUR_PERSONAL_ACCESS_TOKEN";
const REPO_OWNER = "YOUR_GITHUB_USERNAME";
const REPO_NAME = "YOUR_PRIVATE_REPO_NAME";
const FILE_PATH = "backups/solo_leveling_save.json";

const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

export class CloudSyncEngine {
  static async backupToGitHub(): Promise<boolean> {
    try {
      // 1. Extract the raw JSON string from AsyncStorage
      const rawState = await AsyncStorage.getItem("system-player-storage");
      if (!rawState) return false;

      const encodedContent = encode(rawState);
      let fileSha = "";

      // 2. Fetch the current file to get its SHA (Required for updates)
      const getResponse = await fetch(GITHUB_API_URL, {
        method: "GET",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (getResponse.ok) {
        const getResult = await getResponse.json();
        fileSha = getResult.sha;
      }

      // 3. Push the updated JSON to the repository
      const putResponse = await fetch(GITHUB_API_URL, {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `System Backup: ${new Date().toISOString()}`,
          content: encodedContent,
          ...(fileSha && { sha: fileSha }), // Append SHA only if file exists
        }),
      });

      return putResponse.ok;
    } catch (error) {
      console.error("[SYSTEM CLOUD ERROR]", error);
      return false;
    }
  }
}
