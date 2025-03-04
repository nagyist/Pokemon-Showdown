/**
 * Gym Challenge System for Pokémon Showdown
 * Version: 1.4 (Server-Controlled AI, Works in Any Room)
 * Developed by: [Your Name or Server Name]
 * 
 * Summary:
 * - Users can challenge an NPC Gym Leader in any room.
 * - The server assigns a Gym Leader and controls their actions.
 * - The battle runs automatically without human input.
 */

import {Chat} from '../chat';

const GYM_LEADERS = ['Brock', 'Misty', 'Lt. Surge', 'Erika', 'Koga', 'Sabrina', 'Blaine', 'Giovanni']; // NPC Gym Leaders

export const commands: Chat.ChatCommands = {
	gym: {
		challenge(target, room, user) {
			if (!room) {
				return this.errorReply("This command must be used in a room.");
			}

			// Select a random Gym Leader from the list
			const gymLeader = GYM_LEADERS[Math.floor(Math.random() * GYM_LEADERS.length)];
			const npcUsername = `GymLeader-${gymLeader.replace(/\s/g, '')}`; // Create a unique NPC name

			// Broadcast the challenge
			room.add(`|html|<div class="broadcast-blue" style="background: #1e1f22; padding: 15px; border-radius: 12px; border: 3px solid #ff4500; text-align: center; color: #f8f8f8;">
				<strong style="color:#ff4500;">⚔️ ${user.name} has challenged Gym Leader ${gymLeader}!</strong><br>
				<b>Battle Format:</b> Random Battle (gen9randombattle)<br>
				<i>The battle will start now!</i>
			</div>`);
			room.update();

			// Create an AI-controlled bot for the Gym Leader
			this.parse(`/makebot ${npcUsername}`);

			// Start the battle
			this.parse(`/makebattle ${user.name}, ${npcUsername}, gen9randombattle`);
		},

		help(target, room, user) {
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				`<div style="background: #1e1f22; padding: 15px; border-radius: 12px; border: 3px solid #ff4500; text-align: left; color: #f8f8f8;">
					<h3 style="color:#ff4500; text-align:center;">🏆 Gym Challenge Help 🏆</h3>
					<b>/gym challenge</b> - Challenge a random NPC Gym Leader to a battle.<br>
					<i>The battle will be in the Random Battle format.</i><br>
					<b>The Gym Leader will be AI-controlled by the server.</b><br>
					<b>This command can be used in any room.</b><br>
				</div>`
			);
		},
	},
};
