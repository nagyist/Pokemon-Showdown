/**
 * Gym Challenge System for Pokémon Showdown
 * Version: 2.1 (Fixed AI Bot Creation)
 * Developed by: [Your Name or Server Name]
 * 
 * Summary:
 * - Users can challenge an NPC Gym Leader in any room.
 * - The server assigns a Gym Leader and controls their actions.
 * - Uses Pokémon Showdown's battle engine to run the battle.
 */

import {Chat} from '../chat';
import {Rooms} from '../rooms';
import {Users} from '../users';

const GYM_LEADERS = ['Brock', 'Misty', 'Lt. Surge', 'Erika', 'Koga', 'Sabrina', 'Blaine', 'Giovanni']; // NPC Gym Leaders

export const commands: Chat.ChatCommands = {
	gym: {
		async challenge(target, room, user) {
			if (!room) {
				return this.errorReply("This command must be used in a room.");
			}

			// Select a random Gym Leader
			const gymLeader = GYM_LEADERS[Math.floor(Math.random() * GYM_LEADERS.length)];
			const npcUsername = `GymLeader-${gymLeader.replace(/\s/g, '')}`;
			const challenger = Users.get(user.id);

			if (!challenger) {
				return this.errorReply("You must be online to challenge a Gym Leader.");
			}

			// Ensure the Gym Leader AI user exists
			let gymBot = Users.get(npcUsername);
			if (!gymBot) {
				gymBot = new Users.User(npcUsername, true); // Manually create a User object
				Users.users.set(npcUsername, gymBot); // Add it to the Users list
			}
			gymBot.isBot = true; // Mark as AI-controlled

			// Broadcast the challenge
			room.add(`|html|<div class="broadcast-blue" style="background: #1e1f22; padding: 15px; border-radius: 12px; border: 3px solid #ff4500; text-align: center; color: #f8f8f8;">
				<strong style="color:#ff4500;">⚔️ ${user.name} has challenged Gym Leader ${gymLeader}!</strong><br>
				<b>Battle Format:</b> Random Battle (gen9randombattle)<br>
				<i>The battle will start now!</i>
			</div>`);
			room.update();

			// Start the battle using Pokémon Showdown's battle engine
			const battle = Rooms.createBattle({
				format: 'gen9randombattle',
				p1: {user: challenger},
				p2: {user: gymBot, isBot: true},
			});

			if (!battle) {
				return this.errorReply("Failed to start the battle. Please try again.");
			}

			room.add(`|html|<strong style="color:#ff4500;">The battle has started! Click <a href='/${battle.roomid}' target='_blank'>here</a> to watch.</strong>`);
			room.update();
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
