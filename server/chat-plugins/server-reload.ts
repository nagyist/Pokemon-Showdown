/**
 * Reload Command for Chat Plugins
 * 
 * Version: 1.0.0
 * Author: Clark Jones (@smoothoperator07)
 * Description: Allows Leaders (&) and Admins (~) to reload chat plugins without restarting the server.
 * 
 * Credits: Inspired by Pokémon Showdown's hotpatch system.
 */

import { FS } from '../../lib';

export const commands: Chat.ChatCommands = {
    reload(target, room, user) {
        if (!target) {
            return this.errorReply("Usage: /reload chat-plugins [filename]");
        }
        if (!user.hasRank(user, '&')) { // Restrict to Leaders (&) and Admins (~)
            return this.errorReply("Access denied. This command is only available to Leaders (&) and Admins (~).");
        }

        target = toID(target); // Convert to lowercase and remove special characters

        // **Reload all chat-plugins**
        if (target === 'chat-plugins') {
            this.addGlobalModAction(`${user.name} is reloading all chat-plugins...`);
            this.sendReply("Reloading all chat plugins...");

            let successCount = 0;
            let failedFiles: string[] = [];

            // Unload all chat-plugins
            for (const key in require.cache) {
                if (key.includes('../../server/chat-plugins/')) {
                    delete require.cache[key];
                }
            }

            // Reload all chat-plugin files
            const pluginFiles = FS('../../server/chat-plugins').readdirSync();
            for (const file of pluginFiles) {
                if (file.endsWith('.ts') || file.endsWith('.js')) {
                    try {
                        require(`../../server/chat-plugins/${file.replace(/\.(ts|js)$/, '')}`);
                        successCount++;
                    } catch (err) {
                        failedFiles.push(file);
                        console.error(`Error loading ${file}:`, err);
                    }
                }
            }

            if (failedFiles.length > 0) {
                this.errorReply(`Failed to reload: ${failedFiles.join(', ')}`);
            }

            this.addGlobalModAction(`Successfully reloaded ${successCount} chat-plugins.`);
            return this.sendReply(`Chat-plugins reloaded: ${successCount} successful, ${failedFiles.length} failed.`);
        }

        // **Reload a specific chat-plugin**
        if (target.startsWith('chat-plugins/')) target = target.replace('chat-plugins/', '');

        // Check for file existence without requiring .ts or .js extension
        let pluginPath = `../../server/chat-plugins/${target}`;
        let foundPath = "";
        if (FS(`${pluginPath}.ts`).existsSync()) {
            foundPath = `${pluginPath}.ts`;
        } else if (FS(`${pluginPath}.js`).existsSync()) {
            foundPath = `${pluginPath}.js`;
        } else {
            return this.errorReply(`Error: Chat-plugin '${target}' does not exist in 'server/chat-plugins/'.`);
        }

        this.addGlobalModAction(`${user.name} is reloading chat-plugin: ${target}...`);
        this.sendReply(`Reloading chat-plugin: ${target}...`);

        // Unload the specific file
        let unloaded = false;
        for (const key in require.cache) {
            if (key.includes(`../../server/chat-plugins/${target}`)) {
                delete require.cache[key];
                unloaded = true;
            }
        }

        if (!unloaded) {
            this.errorReply(`Warning: '${target}' was not loaded previously.`);
        }

        // Reload the specific file
        try {
            require(`../${foundPath.replace(/\.ts|\.js$/, '')}`);
            this.addGlobalModAction(`Chat-plugin '${target}' reloaded successfully.`);
            return this.sendReply(`Chat-plugin '${target}' has been reloaded successfully.`);
        } catch (err) {
            this.errorReply(`Error reloading '${target}': ${err}`);
            console.error(`Error loading ${target}:`, err);
            return;
        }
    },

    reloadhelp(target, room, user) {
        if (!user.hasRank(user, '&')) {
            return this.errorReply("Access denied. This command is only available to Leaders (&) and Admins (~).");
        }

        return this.sendReplyBox(
            `<b>/reload [chat-plugins | filename]</b> - Reloads all or a specific chat-plugin.<br>` +
            `&bull; <code>/reload chat-plugins</code> - Reloads all chat-plugins.<br>` +
            `&bull; <code>/reload chat-plugins/example</code> - Reloads a single chat-plugin (example.ts or example.js).<br>` +
            `<b>Note:</b> This command is only available to Leaders (&) and Admins (~).`
        );
    },
};
