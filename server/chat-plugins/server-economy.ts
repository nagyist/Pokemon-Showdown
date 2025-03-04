/**
 * Economy System for Pokémon Showdown
 * -----------------------------------
 * This file implements an economy system for rewarding PokéCoins to users.
 * Users can earn and spend PokéCoins through daily rewards, tournaments, and admin commands.
 *
 * Developed by: [Your Name or Team Name]
 * Inspired by: Wavelength's Economy System
 * Version: 1.0.0
 *
 * Features:
 * - Daily PokéCoins system
 * - Admin commands to set/give/take PokéCoins
 * - Tournament rewards based on participants
 * - Leaderboard to track the richest users
 *
 * Contributions & Credits:
 * - Clark Jones (@Prince Sky ) - Core economy system
 * - Clark Jones (@Prince Sjy ) - Tournament integration
 * - Pokémon Showdown Development Team - Base framework
 */

export const economyDB: Record<string, number> = {}; // Stores user balances

/** Returns a user's balance (always a number) */
export function getBalance(userID: string): number {
    return economyDB[userID] ?? 0;
}

/** Adds PokéCoins to a user's balance */
export function giveMoney(userID: string, amount: number): void {
    if (!economyDB[userID]) economyDB[userID] = 0;
    economyDB[userID] += amount;
}

/** Removes PokéCoins from a user's balance */
export function takeMoney(userID: string, amount: number): void {
    if (!economyDB[userID]) economyDB[userID] = 0;
    economyDB[userID] = Math.max(0, economyDB[userID] - amount);
}

/** Allows admins to set a specific amount of PokéCoins */
export function setMoney(userID: string, amount: number): void {
    economyDB[userID] = Math.max(0, amount);
}

/** Admin-configurable tournament reward system */
interface TournamentRewardConfig {
    winnerCoins: number;
    runnerUpCoins: number;
    minParticipants: number;
}

let tournamentRewardConfig: TournamentRewardConfig = {
    winnerCoins: 5,
    runnerUpCoins: 3,
    minParticipants: 4,
};

export function setTournamentRewardConfig(winnerCoins: number, runnerUpCoins: number, minParticipants: number): void {
    tournamentRewardConfig = { winnerCoins, runnerUpCoins, minParticipants };
}

export function getTournamentRewardConfig(): TournamentRewardConfig {
    return tournamentRewardConfig;
}

/** Leaderboard command */
export function getRichestUsers(): string[] {
    const sortedUsers = Object.entries(economyDB)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
    return sortedUsers.map(([user, balance], rank) => `${rank + 1}. ${user}: ${balance} PokéCoins`);
}

/** Commands for managing the economy */
export const commands: ChatCommands = {
    givemoney(target, room, user) {
        if (!user.can('declare')) return this.errorReply("Permission denied.");
        const [targetUser, amount] = target.split(',').map(str => str.trim());
        if (!targetUser || !amount) return this.errorReply("Usage: /givemoney [user], [amount]");
        const numAmount = parseInt(amount);
        if (isNaN(numAmount) || numAmount <= 0) return this.errorReply("Invalid amount.");

        giveMoney(targetUser, numAmount);
        this.sendReply(`✅ Gave ${numAmount} PokéCoins to ${targetUser}.`);
    },

    takemoney(target, room, user) {
        if (!user.can('declare')) return this.errorReply("Permission denied.");
        const [targetUser, amount] = target.split(',').map(str => str.trim());
        if (!targetUser || !amount) return this.errorReply("Usage: /takemoney [user], [amount]");
        const numAmount = parseInt(amount);
        if (isNaN(numAmount) || numAmount <= 0) return this.errorReply("Invalid amount.");

        takeMoney(targetUser, numAmount);
        this.sendReply(`✅ Took ${numAmount} PokéCoins from ${targetUser}.`);
    },

    richestusers() {
        const leaderboard = getRichestUsers().join('\n');
        this.sendReplyBox(`<b>🏆 Richest Users:</b><br>${leaderboard}`);
    },
};
