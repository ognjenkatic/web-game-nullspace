# NULL Space
This is my entry for the Gynvael's Winter GameDev Challenge 2018/19 - (https://gynvael.coldwind.pl/?lang=en&id=697). Following the game challenge, the development of the game had a few restrictions, some of which were:

![alt text](https://github.com/ognjenkatic/web-game-nullspace/blob/master/screen.png?raw=true)

(UPDATE: The game had a honorable mention (https://gynvael.coldwind.pl/?lang=en&id=703))

- The game must be an unrealistic hacking simulator
- The game setting must be: the player is a space marine's tech/hacker that aids a squad of space marines while they explore an abandoned space station.
- The game must be made in client-side web technology that runs by default on the newest stable Chrome on Windows 10 (1803/1809)
- The size of the whole game (i.e. sum of sizes of all the files) must be at most 128000 bytes (everything, including all art, fonts, etc)

For the game to have a decent amount of content and follow the rules some corners cut were:

- The background sound is a short recording played slowly to save space and give a haunting vibe to the game or sped up to produce tension.
- The game sound was downsampled and horribly maimed to save space.
- The "exploit" text is recycled from the source code of the game itself.
- Minigames were made with modifiers like swapping text for equations to add up to save space.
- No framework was used. All the "animations" and screen manipulation were made from scratch.
- There are no mechanics for saving/loading, instead a password system was used.

## Story

The game follows a team of space marines with four members on the ground and one behind the screen helping with system exploitation - the player. You are Sullivan, one of the leading and most experienced cyber security experts in the force. Your task is to enable the movement of the ground team which is exploring the abandoned ship and trying to uncover the mystery of what happened to it. 

## Gameplay

The gameplay is a mix of puzzle solving and word typing with a terminal emulation as the means to solve puzzles and start games. Note that if the terminal focus is lost, it can be regained by clicking the larger window. The machines the player is on have a file system, made up of files and directories. These directories can be traversed, however, nothing was added except in the home directories of the users you log in as, they sometimes contain the users log files (which can provide usefull hints). Important terminal commands:

- help - shows the programs this machine can run. This list can change upon completing certain actions so when stuck it is a good idea to check for new available commands.
- ls - lists the contents of the current directory
- pwd - displays the current working directory
- ifconfig - displays the network configuration of the machine
- cd <directoryname> - changes the current working directory. The first argument is the name of the directory
- cls - clear the screen
- tunnel <address> - connect to a remote machine. The first argument is it's address
- logread <filename> - read the contents of a log. The first argument is the file name
- rfe - starts up the RFE framework used for realtime vulnerability exploitation

The game also provides the player with 3 tabs, the radar, the conversations tab, and the objectives tab, these can be opened using the buttons on the upper left part of the radar screen. Some puzzles have stages in which they unlock the use of NEW PROGRAMS, so the help command should be run when stuck to see if new ones are available!

## Implementation

The game world is viewed as a computer network which contains machines. The machines are identified with IP addresses and can be accessed with the correct commands. Once connected the user is presented with an emulated terminal which he can run programs from. The game is structured as a story, containing episodes, containing scenes, which transition once conditions are completed. This is reflected in the classes present in the game's source code. 

The objectives a player is after when completed trigger condition checks which can progress scenes, or episodes, these can be viewed in the objectives tab.

## Running the game

The dist folder contains the minified game files. The files required to run are the .png and .ogg assets, the minified .js file, the .html file defining the structure and the .css file defining the styles.

# SPOILERS

This section contains details about the gameplay to help bypass bugs, puzzles that are too hard or content that is not properly explained.

- The episode codes are as follows: (no code),BGH,TTY,CMD
- Solutions for the puzzles can easily be found in the source code ( game.js in the src folder).
- The first puzzle in the generator level is the coded provided for the strtseq command, it is the word fishsticks, is mpzozapjrz if encrypted using a rot cipher. The nature of the cipher is hinted at in the user logs found in his home directory.
- The second puzzle in the generator level is a sudoku puzzle, it too can be solved by looking at the source code.
- The minigame for frequency analysis can be beat easily if you look for the words like CAPTAIN'S LOG or HAMMET and substitute the letters based on them.
- The final challenge in the game is designed to be unbeatable, with the words falling too fast and not enough mistakes allowed. This challenge should be completed by opening up the debugger and typing the command story.completeCondition("hack_the_game"), which is hinted at when the player fails.
- There is an additional episode which is not showed, it is a small dev chat and loads after the player cheats the game on the final challenge.
