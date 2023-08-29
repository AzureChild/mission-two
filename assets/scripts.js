"use strict";
const contents = document.getElementsByClassName("contentGallery");
console.log(contents);
// I was curious what this actually returned. It's an array of HTML...stuff.
// Its not an array. It's an HTMLCollection which might be old or something
let currentContent = 0;
showContent(currentContent); //On page load this is the first piece of content loaded in the gallery

//Function for < > buttons to select next/previous content. Calls showContent
//Works for previous too but is called nextContent whaddya gonna do
function nextContent(posChange) {
    showContent(currentContent += posChange);
}

// //Function for when content is hard selected via the nav menu. pos stands for position. 
// function selectContent(pos) {

// }

//Function to display selected content
function showContent(newPos) {
    const navLinkELs = document.getElementsByClassName("navLinks");
    //First check that we are 'in bounds' and loop around if we aren't.
    //This is purely for the next/previous buttons
    if (newPos < 0) {
        newPos = contents.length-1;
    }
    else if (newPos > contents.length-1)
    {
        newPos = 0;
    }

    currentContent = newPos;

    //HTMLContent not being arrays means no forEach
    for (let i=0; i<contents.length; i++) {
        contents[i].style.display = "none"; //Clear everything from the gallery
        // console.log(`${contents[i].id} cleared`);
    }
    contents[currentContent].style.display = "flex";

    //Change the navLinks to display currently active content divider
    for (let i=0; i<navLinkELs.length; i++) {
        navLinkELs[i].className = navLinkELs[i].className.replace(" active", "");
    }

    navLinkELs[currentContent].classList.add("active");
}

//Create an array of objects to store the glossary terms.
//All in upper case for later logic. Must be a better way to do this.
const glossary = [
    {term: "TEST", desc: "This is a test entry."},
    {term: "PSCT", desc: 'Stands for "Problem-Solving Card Text". This was introduced to address the readability of cards and understanding of their rulings by clearly marking the differences between requirement, cost and effect. The activation requirement is behind a colon, followed by the cost behind a semi-colon, followed by the effect.<br><br>REQUIREMENT: COST; EFFECT.'},
    {term: "TARGET", desc: "In simple terms, if the card says 'target' then it targets. Otherwise it does not. This is key, for example, with a card like Mekk-Knight Crusadia Avramax who cannot be targeted. However Destroyer Phoenix Enforcer's effect to destroy does not mention the word 'target' and so Avramax has no protection. It is also important for timing purposes; if a card does not target and you wish to respond to its effect - you won't know which card they're going to mess with until the resolution!"},
    {term: "GARNET", desc: "Refers to a card you need to include in your deck but do not want to actually draw. The term comes from a once popular strategy involving the card 'Brilliant Fusion'. In order to play this card you would need to send two 'Gem-Knight' monsters from your deck to the graveyard. The most popular of these to run was 'Gem-Knight Garnet'. However if you drew your copy of 'Gem-Knight Garnet' then 'Brilliant Fusion' could no longer be used!"},
];

// console.log(glossary);

//Select my overlay element
const glossaryOverlay = document.getElementById("fadeoutOverlay");
//Need one for the actual box now too because I've decided to use the overlay for the guessing game
const popOutBox = document.getElementById("glossaryPopOutBox");
const popOutHeader = document.getElementById("popOutHeader");
const popOutContent = document.getElementById("popOutContent");
const resultBox = document.getElementById("guessResult");
const backButton = document.getElementById("backButton");
//Oh no my event listeners are everywhere
backButton.addEventListener("click", backButtonPressed);



let glossaryVisible = false; 
//Dug myself a hole with reusing the fadeout display after coding it just for the glossary
//Now we use this to check if the glossary boxes are up. If they aren't, clicking in the fadeout
//window will no longer dismiss the overlay.

function displayGlossaryBox(displayTerm) {
    // console.log(term);
    let selectedTerm = "ERROR";
    let selectedDesc = "ERROR";

    for (let def in glossary) {
        if(glossary[def].term === displayTerm){
            selectedTerm = glossary[def].term;
            selectedDesc = glossary[def].desc;
        }
    }

    popOutHeader.innerHTML = `<h3>${selectedTerm}</h3>`;
    popOutContent.innerHTML = `<p>${selectedDesc}</p>`;

    glossaryOverlay.style.display = 'block';
    popOutBox.style.display = 'block';
    glossaryVisible = true;
}

//If user clicks the faded area of the window, close the glossary box
glossaryOverlay.addEventListener("click", clearGlossaryBox);

function clearGlossaryBox(e) {
    if(e.target === glossaryOverlay && glossaryVisible===true){
        glossaryOverlay.style.display = 'none';
        popOutBox.style.display = 'none';
        glossaryVisible = false;
    }
}

//Code for the guessing game
//TEST CODE
/* Was used to check the results box before the code was finished
const resultBox = document.getElementById("guessResult")
function testResultBox() {
    resultBox.style.display = 'flex';
    glossaryOverlay.style.display = 'block';
}
*/
//END TEST CODE ^
const flipCard = document.getElementById("gcImgInner");

const flipButton = document.getElementById("guessButton");
const formEL = document.getElementById("guessForm");
const userGuessEL = document.getElementById("userGuess");
// formEL.addEventListener("onsubmit", guessTheCard);
flipButton.addEventListener("click", guessTheCard);


const clue = document.getElementById("gtClue");
const cardFront = document.getElementById("cardFront");

class Card {
    constructor(cardName, cardGuessed, cardPath, cardClue) {
        this.cardName = cardName;
        this.cardClue = cardClue;
        this.cardGuessed = cardGuessed;
        this.cardPath = cardPath;
    }
}

const cards = [
    new Card("MIRRORFORCE", false, "mirrorForce.png", "Think you've got the upper hand? Be wary of launching an all out attack or this trap card will spell the doom of all your attacking monsters!"),
    new Card("CHANGEOFHEART", false, "changeOfHeart.jpg", "Think you can rest easy after summoning a powerful monster? If your opponent has this card they might change your mind - or perhaps your heart."),
    new Card("MANEATERBUG", false, "manEaterBug.jpg", "You'll have to think twice about attacking a face down monster after this nasty bug flips up and destroys any monster on the field!"),
    new Card("MONSTERREBORN", false, "monsterReborn.png", "Have they defeated your strongest monster? Don't lose hope. Summon it from the graveyard with this card and retake the field!"),
    new Card("INFINITEIMPERMANENCE", false, "infiniteImpermanence.jpg", "Here's a new one. A staple of modern Yu-Gi-Oh, although the effect to negate a monster on the field may be on a trap card, you can use it right from the hand if you control no cards!")
]

let randomCard;
let score = 0; //I might not do this before presentation

initializeGame(); //Easiest way to set this up is on page load

function initializeGame() {
    //Set a random card to be guessed
    randomCard = getRandomCard();
    document.getElementById("userGuess").innerHTML = ""; //Clear the text box
    //Insert the values into DOM
    clue.innerHTML = `<p>${randomCard.cardClue}</p>`;
    cardFront.style.backgroundImage = `url("assets/images/${randomCard.cardPath}")`;
}

function getRandomCard() {
    //Moving this to own function.
    //We need to: Check that there is at least 1 card in the array to be guessed
    //If so, get a random number. Go to that index. Check that it hasn't been guessed.
    //If it hasn't - return the element. If it has, increase number by 1 or cycle it to 0 if out of bounds.
    //For now, if there are no more valid cards I'll just reset the array.

    let numOfFalseValues = 0;
    cards.forEach((card) => {
        if(!card.cardGuessed){
            numOfFalseValues++;
        }
    });
    if(numOfFalseValues===0){
        cards.forEach((card) => {
            card.cardGuessed = false;
        });
    }
    //Create an array of only left over cards
    const filteredCards = cards.filter(card => !card.cardGuessed); //Thanks ChatGPT

    console.log(filteredCards);
    const randomIndex = Math.floor(Math.random()*filteredCards.length);
    return filteredCards[randomIndex];
}

//Its gonna get messy because I misunderstood setTimeOut before writing this code
function guessTheCard(e) {
    e.preventDefault();
    let userGuess = userGuessEL.value.toUpperCase().replaceAll(" ", "");
    console.log(userGuess);
    let userResult;
    if(userGuess===randomCard.cardName) {
        userResult = true;
        score++;
        document.getElementById("score").innerHTML = score;
    }
    else {
        userResult = false;
    }
    console.log(userResult);
    flipCard.classList.add('cardFlipped');
    //Put a set time out here to give time for the flip animation before displaying results
    if(userResult) {
        document.getElementById("guessResultText").innerHTML = `You got it!`;
    }
    else {
        document.getElementById("guessResultText").innerHTML = `Wrong, but nice try!`;
    }
    
    //We'll do it here then, loop the cards array and set guessed to true where it matched our
    //Card name. Should have spliced this somewhere earlier or something.
    cards.forEach((card) => {
        if(randomCard.cardName===card.cardName) {
            card.cardGuessed=true;
        }
    });
    console.log(cards);
    setTimeout((displayResult), 1500);
}

function displayResult() {
    resultBox.style.display = 'flex';
    glossaryOverlay.style.display = 'block';
}

function backButtonPressed() {
    resultBox.style.display = 'none';
    glossaryOverlay.style.display = 'none';
    flipCard.classList.remove('cardFlipped');
    document.getElementById("userGuess").value = ""; //Yeah, hard call but it is now 1am
    setTimeout((initializeGame), 1000);
}

//Code to handle swapping out the sidebar images
/* Commenting for now until I can figure out a way to check for visible and implement the animation slide
const imageContainer = document.getElementsByClassName("imageContainer");

let sideImagesArray = [
    {visible: true, url:'assets/images/darkMagicianVector.png'},
    {visible: true, url:'assets/images/masterDiamondVector.png'},
    {visible: false, url:'assets/images/bardicheVector.png'},
    {visible: false, url:'assets/images/serzielVector.png'}
];

for(let i=0;i<imageContainer.length;i++) {
    imageContainer[i].addEventListener("click", swapSideImage);
}

//Loop needs to select an image from the array that isn't currently visible
//And swap out the image that was clicked on.
function swapSideImage(e) {
    // console.log(e.target.parentNode.id);
    //Get an array of potential replacements
    const potentials = sideImagesArray.filter((image) => image.visible === false);
    //Find a new potential image
    let newImage = potentials[Math.floor(Math.random()*potentials.length)];
    //Map through the main array - swap the new one to visible, the old one to invisible and remap it onto itself.
    let targetString = e.target.src.toString(); //Ho-lee this is some hack nonsense
    sideImagesArray.forEach((image) => {
        //Old one out
        if(targetString.includes(image.url)) {
            image.visible = false;
        }
        //New one in. Can probably be done in one if with || but we'll stick with this for now for my brain
        if(newImage.url===image.url) {
            image.visible = true;
        }
    });

    //Replace the DOM image
    e.target.parentNode.innerHTML = `<img class="imageContainer" src="${newImage.url}"/>`;
    console.log(sideImagesArray);
}

*/
