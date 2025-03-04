/**
 * Impulse Server Economy System
 * Developed by: Clark Jones @Prince Sky
 * Description: A simple economy system for the Impulse Server, 
 * allowing users to manage PokéCoins with balance tracking, transfers, and a leaderboard.
 * 
 * Commands:
 * - /balance [user]
 * - /givemoney [user], [amount]
 * - /takemoney [user], [amount]
 * - /transfermoney [user], [amount]
 * - /leaderboard [page]
 * - /economyhelp
 */

import { FS } from '../../lib/fs';

const ECONOMY_FILE = '../../impulse/economy.json';

interface EconomyData {
    [userID: string]: number;
}

// Load economy data from file
function loadEconomy(): EconomyData {
    try {
        return JSON.parse(FS(ECONOMY_FILE).readIfExistsSync() || '{}');
    } catch {
        return {};
    }
}

// Save economy data to file
function saveEconomy(data: EconomyData) {
    FS(ECONOMY_FILE).writeUpdate(() => JSON.stringify(data, null, 2));
}

// Get a user's balance
function getBalance(userID: string): number {
    const economy = loadEconomy();
    return economy[userID] || 0;
}

// Give money to a user
function giveMoney(userID: string, amount: number): boolean {
    if (isNaN(amount) || amount <= 0) return false;
    const economy = loadEconomy();
    if (!economy[userID]) economy[userID] = 0;

    economy[userID] += amount;
    saveEconomy(economy);
    return true;
}

// Take money from a user
function takeMoney(userID: string, amount: number): boolean {
    if (isNaN(amount) || amount <= 0) return false;
    const economy = loadEconomy();
    if (!economy[userID] || economy[userID] < amount) return false; // Prevent negative balance

    economy[userID] -= amount;
    saveEconomy(economy);
    return true;
}

// Transfer money between users
function transferMoney(senderID: string, receiverID: string, amount: number): boolean {
    if (senderID === receiverID || isNaN(amount) || amount <= 0) return false;
    const economy = loadEconomy();
    if (!economy[senderID] || economy[senderID] < amount) return false;

    if (!economy[receiverID]) economy[receiverID] = 0;
    economy[senderID] -= amount;
    economy[receiverID] += amount;
    saveEconomy(economy);
    return true;
}

// Get the richest users (sorted list)
function getRichestUsers(): [string, number][] {
    const economy = loadEconomy();
    return Object.entries(economy).sort((a, b) => b[1] - a[1]);
}

export const commands: Chat.ChatCommands = {
    balance(target, room, user) {
        if (!target) target = user.id;
        const balance = getBalance(toID(target));
        this.sendReply(`${target} has ${balance} PokéCoins.`);
    },

    givemoney(target, room, user) {
        if (!this.can('declare')) return false;
        const [targetUser, amountStr] = target.split(',').map(param => param.trim());
        const amount = parseInt(amountStr);
        if (!targetUser || isNaN(amount)) return this.errorReply("Usage: /givemoney [user], [amount]");

        if (giveMoney(toID(targetUser), amount)) {
            this.addModAction(`${user.name} has given ${amount} PokéCoins to ${targetUser}.`);
        } else {
            this.errorReply("Invalid transaction.");
        }
    },

    takemoney(target, room, user) {
        if (!this.can('declare')) return false;
        const [targetUser, amountStr] = target.split(',').map(param => param.trim());
        const amount = parseInt(amountStr);
        if (!targetUser || isNaN(amount)) return this.errorReply("Usage: /takemoney [user], [amount]");

        if (takeMoney(toID(targetUser), amount)) {
            this.addModAction(`${user.name} has taken ${amount} PokéCoins from ${targetUser}.`);
        } else {
            this.errorReply("Invalid transaction.");
        }
    },

    transfermoney(target, room, user) {
        const [receiver, amountStr] = target.split(',').map(param => param.trim());
        const amount = parseInt(amountStr);
        if (!receiver || isNaN(amount)) return this.errorReply("Usage: /transfermoney [user], [amount]");

        if (transferMoney(user.id, toID(receiver), amount)) {
            this.addModAction(`${user.name} has transferred ${amount} PokéCoins to ${receiver}.`);
        } else {
            this.errorReply("Transaction failed.");
        }
    },

    leaderboard(target, room, user) {
        if (!this.runBroadcast()) return;
        const page = parseInt(target) || 1;
        const entriesPerPage = 10;
        const allUsers = getRichestUsers();

        if (allUsers.length === 0) return this.sendReplyBox("No users found in the economy system.");
        const totalPages = Math.ceil(allUsers.length / entriesPerPage);

        if (page < 1 || page > totalPages) return this.errorReply(`Invalid page. Please enter a number between 1 and ${totalPages}.`);

        let output = `<strong>Top PokéCoin Holders (Page ${page}/${totalPages}):</strong><br>`;
        const start = (page - 1) * entriesPerPage;
        const end = Math.min(start + entriesPerPage, allUsers.length);
        for (let i = start; i < end; i++) {
            output += `#${i + 1}: ${allUsers[i][0]} - ${allUsers[i][1]} PokéCoins<br>`;
        }
        output += `<br><small>Use /leaderboard [page] to view more.</small>`;
        this.sendReplyBox(output);
    },

    economyhelp() {
        if (!this.runBroadcast()) return;
        this.sendReplyBox(`
            <strong>Impulse Economy Commands:</strong><br>
            <code>/balance [user]</code> - View your or another user's balance.<br>
            <code>/givemoney [user], [amount]</code> - Give a user PokéCoins. (Requires authority)<br>
            <code>/takemoney [user], [amount]</code> - Remove a user's PokéCoins. (Requires authority)<br>
            <code>/transfermoney [user], [amount]</code> - Transfer PokéCoins to another user.<br>
            <code>/leaderboard [page]</code> - View the richest users.<br>
            <code>/economyhelp</code> - Show this help message.
        `);
    },
};
