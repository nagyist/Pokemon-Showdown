/**
 * Dice Game for Pokémon Showdown
 * Version: 1.0
 * Developed by: MusaddikT
 * 
 * Summary:
 * - Allows users to start and join a dice game in the official casino room.
 * - Uses the economy system to place bets with the configured currency.
 * - Automatically cancels if no one joins within 60 seconds.
 * - Uses `uhtmlchange` to prevent chat spam.
 * - Ensures both players have enough funds before starting.
 * - Matches the styling of the server-economy system.
 */

import {FS} from '../../lib';

const CASINO_ROOM = 'casino'; // Change this to your official casino room name

interface DiceGame {
	host: string;
	betAmount: number;
	opponent: string | null;
	timer?: NodeJS.Timeout;
}

const activeDiceGames: {[roomid: string]: DiceGame} = {};

export const commands: Chat.ChatCommands = {
	dice: {
		start(target, room, user) {
			if (!room || room.roomid !== CASINO_ROOM) {
				return this.errorReply(`This command can only be used in the official casino room: /join ${CASINO_ROOM}`);
			}
			if (activeDiceGames[room.roomid]) return this.errorReply("A dice game is already active in this room. Please wait for it to finish.");

			const betAmount = Number(target.trim());
			if (isNaN(betAmount) || betAmount < 1) {
				return this.errorReply(`Please enter a valid bet amount (minimum 1 ${currencyName}).`);
			}

			const userBalance = Economy.readMoney(user.id);
			if (userBalance < betAmount) {
				return this.errorReply(`You don't have enough ${currencyPlural} to start this game.`);
			}

			Economy.writeMoney(user.id, -betAmount);

			activeDiceGames[room.roomid] = {
				host: user.id,
				betAmount,
				opponent: null,
				timer: setTimeout(() => {
					if (activeDiceGames[room.roomid]) {
						Economy.writeMoney(user.id, betAmount);
						room.add(`|uhtmlchange|dice-${room.roomid}| `);
						delete activeDiceGames[room.roomid];
						room.update();
					}
				}, 60000),
			};

			room.add(`|uhtml|dice-${room.roomid}|<div style="background: #1e1f22; padding: 15px; border-radius: 12px; border: 3px solid #ffd700; text-align: center; color: #f8f8f8;">
				<strong style="color:#ffd700;">🎲 ${user.name} has started a Dice Game!</strong><br>
				Bet Amount: <span style="color:#ffd700;">${betAmount} ${currencyPlural}</span><br>
				<button name="send" value="/dice join" style="background:#ffd700; color:#222; font-weight:bold; padding: 5px 10px; border-radius: 5px; border:none;">Join Game</button>
				<br><i>Game auto-cancels in 60 seconds if no one joins.</i>
			</div>`);
			room.update();
		},

		join(target, room, user) {
			if (!room || room.roomid !== CASINO_ROOM) {
				return this.errorReply(`This command can only be used in the official casino room: /join ${CASINO_ROOM}`);
			}
			const game = activeDiceGames[room.roomid];
			if (!game) return this.errorReply("There is no active Dice Game in this room. Use /dice start to start one.");

			if (game.opponent) return this.errorReply("This game already has two players.");

			if (user.id === game.host) {
				return this.errorReply("You cannot join your own game.");
			}

			const userBalance = Economy.readMoney(user.id);
			if (userBalance < game.betAmount) {
				return this.errorReply(`You don't have enough ${currencyPlural} to join this game.`);
			}

			if (game.timer) clearTimeout(game.timer);

			Economy.writeMoney(user.id, -game.betAmount);
			game.opponent = user.id;

			const hostRoll = Math.floor(Math.random() * 6) + 1;
			const opponentRoll = Math.floor(Math.random() * 6) + 1;
			const hostName = Users.get(game.host)?.name || game.host;
			const opponentName = user.name;

			let resultMessage = `<strong>🎲 Dice Game Results!</strong><br>
			<table style="width: 90%; max-width: 450px; margin: auto; border-collapse: collapse; text-align: center; color: #f8f8f8;">
				<tr style="background: #ffd700; color: #222; font-weight: bold;">
					<th style="padding: 10px; border-bottom: 2px solid #444;">Player</th>
					<th style="padding: 10px; border-bottom: 2px solid #444;">Roll</th>
				</tr>
				<tr><td style="padding: 10px;">${hostName}</td><td>${hostRoll}</td></tr>
				<tr><td style="padding: 10px;">${opponentName}</td><td>${opponentRoll}</td></tr>
			</table><br>`;

			if (hostRoll > opponentRoll) {
				Economy.writeMoney(game.host, game.betAmount * 2);
				resultMessage += `<strong style="color:#ffd700;">🎉 ${hostName} wins!</strong>`;
			} else if (hostRoll < opponentRoll) {
				Economy.writeMoney(user.id, game.betAmount * 2);
				resultMessage += `<strong style="color:#ffd700;">🎉 ${opponentName} wins!</strong>`;
			} else {
				Economy.writeMoney(game.host, game.betAmount);
				Economy.writeMoney(user.id, game.betAmount);
				resultMessage += `<strong style="color:#ffd700;">🤝 It's a tie!</strong>`;
			}

			room.add(`|uhtmlchange|dice-${room.roomid}|<div class="broadcast-blue" style="background: #1e1f22; padding: 15px; border-radius: 12px; border: 3px solid #ffd700; text-align: center; color: #f8f8f8;">
				${resultMessage}
			</div>`);
			delete activeDiceGames[room.roomid];
			room.update();
		},

		help(target, room, user) {
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				`<div style="background: #1e1f22; padding: 15px; border-radius: 12px; border: 3px solid #ffd700; text-align: left; color: #f8f8f8;">
					<h3 style="color:#ffd700; text-align:center;">🎲 Dice Game Help 🎲</h3>
					<b>/dice start [amount]</b> - Start a dice game and bet ${currencyPlural}.<br>
					<b>/dice join</b> - Join an existing dice game.<br>
					<i>Game auto-cancels if no one joins in 60 seconds.</i><br>
				</div>`
			);
		},
	},
};
