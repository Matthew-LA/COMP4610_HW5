/*
File: scrabble.js
GUI Assignment: HW5
Description: Implementing a Bit of Scrabble with Drag-and-Drop
Matthew Lorette Anaya, UMass Lowell Computer Science, Matthew_loretteanaya@student.uml.edu
Copyright (c) 2023 by Matt. All rights reserved. May be freely copied or
excerpted for educational purposes with credit to the author.
updated by Matthew Lorette Anaya on June 30, 2023
*/

// Define the Tile class which represents a Scrabble tile
class Tile {
  // Constructor initializes the properties of the tile
  constructor(letter, value, distribution) {
    this.letter = letter; // The letter on the tile
    this.value = value; // The point value of the tile
    this.distribution = distribution; // The total number of this tile in the game
    this.remaining = distribution; // The number of this tile remaining to be played
  }
}

// Define the set of Scrabble tiles
const ScrabbleTiles = {
    "A": new Tile("A", 1, 9),
    "B": new Tile("B", 3, 2),
    "C": new Tile("C", 3, 2),
    "D": new Tile("D", 2, 4),
    "E": new Tile("E", 1, 12),
    "F": new Tile("F", 4, 2),
    "G": new Tile("G", 2, 3),
    "H": new Tile("H", 4, 2),
    "I": new Tile("I", 1, 9),
    "J": new Tile("J", 8, 1),
    "K": new Tile("K", 5, 1),
    "L": new Tile("L", 1, 4),
    "M": new Tile("M", 3, 2),
    "N": new Tile("N", 1, 6),
    "O": new Tile("O", 1, 8),
    "P": new Tile("P", 3, 2),
    "Q": new Tile("Q", 10, 1),
    "R": new Tile("R", 1, 6),
    "S": new Tile("S", 1, 4),
    "T": new Tile("T", 1, 6),
    "U": new Tile("U", 1, 4),
    "V": new Tile("V", 4, 2),
    "W": new Tile("W", 4, 2),
    "X": new Tile("X", 8, 1),
    "Y": new Tile("Y", 4, 2),
    "Z": new Tile("Z", 10, 1),
    "_": new Tile("_", 0, 2)
};


let score = 0; // Player's current score
let placedTiles = []; // Tiles that have been placed on the board
let boardState = Array(1).fill(null).map(() => Array(7).fill(null)); // Represents the current state of the game board

// Function to generate a hand of 7 tiles for the player
function generateTiles() {
  for (let i = 0; i < 7; i++) {
    let randomLetterKey = getRandomLetter(); // Get a random letter tile that is still available

    ScrabbleTiles[randomLetterKey].remaining--; // Decrease the number of remaining tiles of this type
    placedTiles[i] = ScrabbleTiles[randomLetterKey]; // Add the new tile to the player's hand

    // Create a new image element for the tile and make it draggable
    const tile = $(`<img id='tile-drag_${i}' class='board-piece' src='img/Scrabble_Tiles/Scrabble_Tile_${randomLetterKey}.jpg'></img>`).css({
        "height": "80px", 
        "width": "80px"
    }).draggable({
        revert: 'invalid'
    });

    // Add the new tile to the game UI
    $("#tile-container").append(tile);
  }
}

// Function to get a random letter key that is still available
function getRandomLetter() {
  let randomLetterKey;
  const keys = Object.keys(ScrabbleTiles);
  do {
    randomLetterKey = keys[Math.floor(Math.random() * keys.length)];
  } while (ScrabbleTiles[randomLetterKey].remaining === 0); // If the chosen tile type is not available, try again
  return randomLetterKey;
}

// Function to handle when a tile is removed from the board
function resetTileOnBoard(event, ui) {
    $(this).droppable('option', 'accept', '.board-piece');
}

// Function to handle when a tile is dropped onto the board
function processDroppedTile(event, ui) {
    const id = ui.draggable.attr("id"); // Get the id of the dragged tile
    const index = parseInt(id.slice(-1)); // Extract the index of the tile from its id
    const tile = placedTiles[index]; // Get the actual Tile object from the placedTiles array

    let row = $(this).data("row");
    let col = $(this).data("col");

    // Check if the tile can be placed here
    if (Object.values(boardState).flat().some(Boolean)) {
        // If there are already tiles on the board, the new tile must be placed adjacent to them
        if (!(boardState[row][col - 1] || boardState[row][col + 1])) {
            ui.draggable.draggable('option', 'revert', true); // If it can't be placed here, revert the drag
            return;
        }
    }
    
    // Remove the tile from the hand and add it to the board
    ui.draggable.detach().css({top: 0,left: 0, position: 'absolute'}).appendTo(this);
    $(this).droppable('option', 'accept', ui.draggable);
    
    let multiplier = 1;
    // Apply multipliers based on the type of square the tile is placed on
    if ($(this).hasClass('double-letter')) {
        multiplier = 2;
    } else if ($(this).hasClass('double_word')) {
        multiplier = 2;
    } else if ($(this).hasClass('triple_letter')) {
        multiplier = 3;
    } else if ($(this).hasClass('triple_word')) {
        multiplier = 3;
    }

    // Add the tile's value to the score, multiplied by any multipliers
    score += tile.value * multiplier;
    
    ui.draggable.draggable('disable'); // Disable dragging of the tile now that it has been placed

    // Mark the tile as placed on the board
    boardState[row][col] = tile;

    // Update the game UI with the new letter and score
    $('#letters').append(tile.letter);
    $('#score').html(score);
}

// Function to initialize the game when the page is loaded
function initializeGame() {
    $(".drop-here").droppable({
        accept: ".board-piece", // Only tiles can be dropped here
        hoverClass: 'active', // CSS class to apply when a tile is hovering over this element
        drop: processDroppedTile, // Function to call when a tile is dropped onto this element
        out: resetTileOnBoard // Function to call when a tile is dragged off of this element
    });
}

$(document).ready(function () {
    generateBoard(); // Create the game board
    generateTiles(); // Generate the initial hand of tiles
    initializeGame(); // Initialize the game logic
});

// Function to generate the HTML for the game board
function generateBoard() {
    let table = '<table>'; //start of table
    for (let i = 0; i < 1; i++) {
        table += scrabbleRow1(i); // add each row to the table
    }
    table += '</table>'; //end of table
    $('#scrabble-board').html(table); //insert table into HTML
}

// Function to generate the HTML for a row of the game board
function scrabbleRow1(rowNumber) {
    var imageFolder = 'img/';
    let table = '<tr>'; // Start of a table row

    for (let i = 0; i < 7; i++) {
        // Generate each cell in the row
        // The cells at indices 2 and 5 are "double-letter" squares
        if (i === 2 || i === 5) {
            table += `<td class="double-letter drop-here" data-row="${rowNumber}" data-col="${i}">
                        <img src="${imageFolder}double_letter.jpg" alt="double_letter">
                       </td>`;
        } else {
            // The other cells are regular squares
            table += `<td class="drop-here" data-row="${rowNumber}" data-col="${i}">
                        <img src="${imageFolder}blank_square.jpg" alt="blank">
                       </td>`;
        }
    }

    table += '</tr>'; // End of a table row

    return table; // Return the HTML for the row
}
