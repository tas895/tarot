import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import seedrandom from 'seedrandom';

//Arrays set up so that later they can be used to provide an overall answer to the user based on the topic of their fortune
//Yes array
const yesCards = [
  "the fool", "the magician", "empress", "lovers", "chariot", "fortitude", "wheel of fortune", "temperance", "star", "sun",
  "the last judgement", "world", "knight of wands", "king of wands", "queen of wands", "page of wands", "two of wands", "three of wands",
  "six of wands", "eight of wands", "nine of wands", "ace of wands", "four of wands", "ace of cups", "two of cups", "three of cups",
  "six of cups", "nine of cups", "ten of cups", "page of cups", "knight of cups", "queen of cups", "king of cups", "knight of swords",
  "page of swords", "ace of swords", "king of pentacles", "queen of pentacles", "knight of pentacles", "page of pentacles",
  "ten of pentacles", "nine of pentacles", "eight of pentacles", "six of pentacles", "three of pentacles", "ace of pentacles"
];
//No array
const noCards = [
  "death", "devil", "tower", "moon", "five of wands", "ten of wands", "seven of wands", "five of cups", "eight of cups",
  "ten of swords", "nine of swords", "eight of swords", "seven of swords", "five of swords", "three of swords", "five of pentacles",
  "four of pentacles"
];
//Maybe array
const maybeCards = [
  "high priestess", "emperor", "hierophant", "hermit", "justice", "hanged man", "four of cups", "seven of cups", "king of swords",
  "four of swords", "two of swords", "seven of pentacles", "two of pentacles", "queen of swords", "six of swords"
];

// PageTitle component rendering the heading tag
function PageTitle(props) {
  const Tag = props.t;
  return <Tag>{props.children}</Tag>;
}

//LandingPage component rendering the initial landing page where the random number to seed the tarot reading is
function LandingPage() {
  const [randomNumber, setRandomNumber] = useState(''); //State for the random number input
  const navigate = useNavigate(); //Allows user to navigate between pages in the app, this only works if the user first types in the number to get to the fortune page (programmatic navigation)

  //Handle form submission to navigate to the fortune page with the random number
  const handleSubmit = (e) => {
    e.preventDefault(); //Stops the browser from reloading the page once the form is submitted
    const num = parseInt(randomNumber, 10); //Convert input to integer
    if (randomNumber && !isNaN(num) && num >= 1 && num <= 100) { //Checks that the number submitted is a valid number and within 1-100
      navigate('/fortune', { state: { seed: randomNumber } }); //Pass random number as seed
    } else {
      alert('Please enter a valid number between 1 and 100.'); //Displays an alert if the user does not enter a number/a valid number
    }
  };

  //JSX for the landing page
  return (
    <div className="landing-page"> {/* Styling tag for landing-page*/}
      <PageTitle t="h1">Welcome to Your Tarot Reading 🔮</PageTitle> {/* Renders the Welcome message */}
      <p className="instruction-label">✨Enter a lucky number between 1-100 to shuffle the tarot deck✨ <br></br> {/* Renders the instructions for the landing page */}
        <i>This helps infuse the deck with your energy for a more accurate read</i> 🔮</p> {/* Renders more mystical instructions for the landing page */}
      <form onSubmit={handleSubmit} className="random-number-form"> {/* Renders a form to submit the random number in */}
        <input
          type="number" //Allows for only numerical inputs
          value={randomNumber} //Binds input value to only the randomNumber state
          onChange={(e) => setRandomNumber(e.target.value)} //Updates the state of randomNumber when user inputs the number
          placeholder="Enter a number 1-100" //Placeholder text in textbox
          className="random-number-input" //Style for random number input
          min="1" // Minimum value 1
          max="100" // Maximum value 100
          required //Ensures this field is required to move forward
        />
        <button type="submit">Get Your Fortune</button> {/* Renders the submit button to trigger form submission */}
      </form>
    </div>
  );
}

//MyButton component to fetch tarot cards and select them randomly using a seed (to mimic a shuffle)
function MyButton({ setFortunes, topic, seed, isClarify = false, existingIndices = [], setIndices }) {
  const fetchFortune = async () => {  //Asynchronous function to fetch and select tarot cards
    //When the button is clicked it will log the topic of the reading and the seed (randomizes the reading based on # selected)
    console.log(`Button clicked, fetching ${isClarify ? 'clarifying card' : 'fortune'} for topic: ${topic}, seed: ${seed}...`); 
    try{
      //Fetch all cards from the API
      const response = await fetch('https://tarotapi.dev/api/v1/cards');
      if(!response.ok) {
        throw new Error(`HTTP error: ${response.status} - ${response.statusText}`); //Detailed error for API issues
      }
      const data = await response.json(); //Parses API response as JSON to extract card info
      const allCards = data.cards || data;  //Gets list of all tarot cards from API response to verify they exist

      //Generate current date in YYYY-MM-DD format to modify the seed daily
      const today = new Date().toISOString().split('T')[0];
      //Combine user-provided seed with the current date to ensure different randomization each day
      const dailySeed = `${seed}-${today}${isClarify ? '-clarify' : ''}`;
      
      //Initialize seeded random number generator, using the daily seed to shuffle/randomize cards differently each day
      const rng = seedrandom(dailySeed);
      const indices = isClarify ? [...existingIndices] : []; //Copy existing indices for clarify to avoid duplicates, or empty array for initial draw
      const numCards = isClarify ? 1 : 3; //Fetch 1 card for clarify, 3 for initial draw
      while(indices.length < (isClarify ? existingIndices.length + 1 : 3)) { //Runs a loop until the required number of unique cards is selected
        const index = Math.floor(rng() * allCards.length); //Generates a random number to choose a card
        if(!indices.includes(index)) { //Ensures index is unique to avoid selecting the same card multiple times
          indices.push(index);  //Adds the unique index to indices array
        }
      }

      //Select cards based on seeded indices by mapping the indices to their corresponding cards in the allCards array
      const fortunesArray = indices.map((index) => allCards[index]);
      console.log(`Fetched ${isClarify ? 'clarifying' : 'initial'} cards:`, fortunesArray); //Log fetched cards for debugging
      setFortunes(isClarify ? fortunesArray[fortunesArray.length - 1] : fortunesArray); //Set single card for clarify, or array for initial 3 cards
      if(!isClarify && setIndices) {
        setIndices(indices); //Store indices for initial tarot reading
      }
    } catch(error){ //Catches any errors
      console.error(`Error fetching ${isClarify ? 'clarifying card' : 'fortune'}:`, error);  //Logs detailed errors to the console
      setFortunes(isClarify ? null : [null, null, null]);  //Set null for clarify card or array of nulls for initial draw
      if(isClarify) {
        alert('Oops! Perhaps divine intervention but your card was lost in the cosmos. Try again!'); //Notify user of clarify failure
      }
    }
  };
  //Button triggers fortune or clarifying card fetch
  return <button className={isClarify ? 'clarify-button' : ''} onClick={fetchFortune}> {/* Button class set to clarify-button for clarifying cards and an empty string for the initial 3 cards*/}
    {isClarify ? '✨ Shuffle 1 more card from the cosmos ✨' : 'Your Fortune'} {/* Calls fetchFortune function when clicked */}
  </button>;
}

//Card component
function Card({ fortune, cardNumber, label }) { //Takes the fortune, cardNumber, and label as props
  console.log(`Card ${cardNumber} fortune:`, fortune); //Logs fortune info and card number to the console
  //Sets the base path for the card image using the card's name, or null if no name exists
  const imageBasePath = fortune?.name ? `/tarot_cards/${fortune.name}` : null;
  const imagePath = imageBasePath ? `${imageBasePath}.png` : null; //Creates the full image path by adding .png to the base path, or null if no base path
  //Normalize card name
  const cardName = fortune?.name
    ?.toLowerCase() //Converts to lower case
    .replace(/^the\s+/, '') //Removes "the" from the start of the cards including it
    || 'Error 404: Fortune not found'; //Shows unknown if no name

  //Returns JSX to render the card
  return(
    <div className="card">  {/* Creates a div class for the card for styling */}
      <h4 className="card-label">🔮 {label} 🔮</h4> {/* Shows the label Card 1/Card 2/Card 3 */}
      {imagePath && ( //Checks if the image path exists so it can render the image
        <img
          src={imagePath}
          alt={fortune?.name || 'Tarot card lost in the cosmos'} //Sets the alt text to tarot card if not found
          className="card-image"  //Applies the card-image class for styling of the image
          //Handles any issues/errors with loading the images
          onError={(e) => {
            if(e.target.src.endsWith('.png')) { //Checks if the images ends in .png
              e.target.src = `${imageBasePath}.jpg`;  //If .png fails tries .jpg
            } else{  //If that also fails then use a placeholder image
              e.target.src = '/tarot_cards/placeholder.png'; //Placeholder image
              e.target.alt = 'Image not found'; //Alt text image not found
              console.error(`Failed to load image for ${fortune?.name}: ${imagePath} or ${imageBasePath}.jpg`); //Logs any errors in the console
            }
          }}
        />
      )}
      <h5 className="card-name">{fortune?.name || 'Unknown'}</h5> {/* Displays card name or unknown if not found */}
      {fortune && fortune.meaning_up ? (  //Looks for the meaning_up in the API to display that as the fortune
        <p>{fortune.meaning_up}</p> //Shows the cards upright meaning as the fortune when found
      ) : (
        <p>Click the button to get a fortune!</p> //If fortunes don't show up this button is there as a failsafe to prompt the user to try again
      )}
    </div>
  );
}

//React component to route to an about tarot page
function About() {
  return(  //Returns JSX to render the page content
    <div> {/* Div for page elements */}
      <PageTitle t="h1">About Tarot</PageTitle> {/* About Tarot title for the page */}
      <p>Learn more about the meanings and suits of tarot cards.</p> {/* Description to learn more */}
      <a href="https://labyrinthos.co/blogs/tarot-card-meanings-list" target="_blank" rel="noopener noreferrer"> {/* Opens informational tarot website in a new browser */}
        <button>Explore Tarot Card Meanings</button> {/* Click on this button to open the link above in a new window */}
      </a>
      <Link to="/fortune">Back to Fortune</Link> {/* Links back to the main fortune page */}
      <Link to="/"> {/* Links back to the randomization page */}
        <button>Choose Another Number</button> {/* Button to navigate back to the randomization page */}
      </Link>
    </div>
  );
}

//FortunePage component (main tarot reading page)
function FortunePage() {
  const [fortunes, setFortunes] = useState([null, null, null]); //Initializes state for 3 tarot cards with null placeholders
  const [clarifyCard, setClarifyCard] = useState(null); //State for the optional 4th clarifying card/destiny card
  const [topic, setTopic] = useState(''); //Default to empty string for "Select your topic"
  const [question, setQuestion] = useState(''); //State for the user's yes/no question
  const [cardIndices, setCardIndices] = useState([]); //State to track indices of selected cards to avoid duplicates
  const location = useLocation(); //Hook to access navigation state
  const seed = location.state?.seed || 'default'; //Retrieve seed from navigation state, fallback to 'default'

  console.log('Current fortunes state:', fortunes); //Logs current fortunes state to the console
  console.log('Clarifying card state:', clarifyCard); //Logs clarifying card state to the console
  console.log('Selected topic:', topic);  //Logs the selected topic (love/financial/career) to the console for debugging
  console.log('User question:', question); //Logs the user's question for debugging

  //Calculate overall answer
  let overallAnswer = 'No'; //Defaults overallAnswer to No
  if(fortunes.every(f => f !== null)) {  //Check if all 3 fortune cards have been fetched (no nulls)
    //Get yes/no/maybe as the overall answer based on the card names, including the clarifying card if it exists
    const allCards = [...fortunes, clarifyCard].filter(card => card !== null); //Include clarifyCard if not null
    const cardOutcomes = allCards.map(fortune => {
      if(!fortune || !fortune.name) return 'Uncertain, the cosmos cannot determine';  //Uncertain if 1 of the cards is missing
      //Sets up a standard for card names
      const cardName = fortune.name
        .toLowerCase()  //Everything to lowercase
        .replace(/^the\s+/, '') //Removes "the" from the cards that start with that
      if(yesCards.includes(cardName)) return 'Yes';  //Check for the card in the yes array
      if(noCards.includes(cardName)) return 'No';    //Check for the card in the no array
      if(maybeCards.includes(cardName)) return 'Maybe';  //Check for the card in the maybe array
      return 'Uncertain';
    });

    console.log('Card outcomes:', cardOutcomes);  //Logs the card outcomes (array of yes/no/maybe) for debugging

    //Topic logic determines the "overall" answer to the user's question for their fortune yes/no/maybe
    if(topic === 'Love') {   //If the user selects a love reading
      const hasNo = cardOutcomes.includes('No'); //Check for at least 1 no
      const hasMaybe = cardOutcomes.includes('Maybe'); //Check for at least 1 maybe
      overallAnswer = hasNo || hasMaybe ? 'No' : 'Yes'; //No if any No or Maybe, otherwise Yes
    } else if(topic === 'Career') {   //If the user selects a career reading
      const hasMaybe = cardOutcomes.includes('Maybe');   //Check for at least 1 Maybe
      const hasNo = cardOutcomes.includes('No');   //Check for at least 1 No
      overallAnswer = hasMaybe && hasNo ? 'No' : 'Yes';  //No if both Maybe and No, otherwise Yes
    } else if(topic === 'Financial') {  //If the user selects a financial reading
      const hasYes = cardOutcomes.includes('Yes');  //Checks for at least 1 Yes
      overallAnswer = hasYes ? 'Yes' : 'No'; //Yes if at least 1 Yes, otherwise No
    }
  } else{
    overallAnswer = 'Please click "Your Fortune" to get a reading'; //Prompt user to fetch a reading if fortunes are null
  }

  //Returns JSX for the fortune page UI
  return(
    <>
      <PageTitle t="h1">Welcome to the Fortune Teller 🔮</PageTitle> {/* Title page with emoji */}
      <p className="instruction-label">✨ Please enter a yes/no question and select the topic ✨</p> {/* Instructions updated to prompt for question input */}
      <div className="controls">  {/* Topic selector, question input, and button */}
        {/* Input field for the user's yes/no question */}
        <input
          type="text" //Sets the input type to text for the question textbox
          value={question} //Binds the input value to the question state
          onChange={(e) => setQuestion(e.target.value)}  //Updates the question state when the user types it in
          placeholder="Enter your yes/no question"  //Placeholder text in the textbox
          className="question-input"  //Applies the question-input styling to the textbox
        />
        {/* Dropdown menu for the topic of your fortune */}
        <select
          name="topic" //Sets name attribute from the dropdown
          value={topic} //Binds the dropdown's value to the topic state
          onChange={(e) => setTopic(e.target.value)} //Updates the topic state when the user selects an option
          className="topic-select"  //Applies styling with the topic-select class
          disabled={!question} //Disables dropdown until a question is entered
        >
          <option value="" disabled>Select your topic</option> {/* Default placeholder option */}
          <option value="Love">Love</option> {/* Love question for your fortune */}
          <option value="Career">Career</option> {/* Career question for your fortune */}
          <option value="Financial">Financial</option> {/* Financial question for your fortune */}
        </select>
        <MyButton 
          setFortunes={setFortunes} //Passes setFortunes to store the first 3 tarot cards
          setIndices={setCardIndices} //Passes setCardIndices to store indices of the 3 tarot cards
          topic={topic} //Passes the selected topic for the reading (love/career/financial)
          seed={seed} //Passes the user's random number seed for shuffling/randomizing the cards
        /> {/* Renders the MyButton component to fetch tarot cards with seed */}
      </div>
      {/* Container for the 3 tarot cards to display them */}
      <div className="card-container">
        <Card fortune={fortunes[0]} cardNumber={1} label="Card 1" />   {/* Card 1 */}
        <Card fortune={fortunes[1]} cardNumber={2} label="Card 2" />   {/* Card 2 */}
        <Card fortune={fortunes[2]} cardNumber={3} label="Card 3" />    {/* Card 3 */}
      </div>
      {/* Container for overall answer, clarifying/destiny card, and buttons */}
      <div className="overall-answer"> {/* Styling for overall-answer section */}
        <h3>Your Answer: ✨{overallAnswer}✨</h3> {/* Shows the overall answer based on the logic for yes/no/maybe */}
        {/* Displays the user's question with the answer if a question is entered and answer is Yes/No */}
        {question && (overallAnswer === 'Yes' || overallAnswer === 'No') && ( //Shows the question and answer (user has to type a question to move forward, get fortune and answer)
          <p>The answer to the question "{question}" is {overallAnswer}.</p> //Displays the question and yes/no answer
        )}
        {/* Clarifying card, displayed below the answer but above buttons */}
        {clarifyCard && (
          <div className="clarify-card-container"> {/* Div styling for the clarifying or destiny card */}
            <Card fortune={clarifyCard} cardNumber={4} label="Destiny Card" /> {/* Renders the Clarifying/Destiny card */}
          </div>
        )}
        {/* Button to draw a clarifying/destiny card, shown after initial fortune, this button only displays after the initial 3 cards are drawn */}
        {fortunes.every(f => f !== null) && ( //Checks if the 3 initial tarot cards are drawn (no nulls) before displaying the button
          <MyButton //Renders the button to fetch the 4th card (clarifying/destiny card)
            setFortunes={setClarifyCard} //Passes setClarifyCard function to store the 4th card
            topic={topic} //Passes the selected topic for the reading (love/career/financial)
            seed={seed} //Passes the user's random number seed, this means the clarifying card should be the same each day assuming same number/topic selected
            isClarify={true} //Sets isClarify to true to indicate this is a clarifying or destiny card
            existingIndices={cardIndices} //Passes indices to avoid a duplicate card for the clarifying/destiny card
          /> 
        )}
        <Link to="/about"> {/* Renders link to about page */}
          <button>Learn More About Tarot</button> {/* Button to navigate to about page */}
        </Link>
        <Link to="/"> {/* Links back to the randomization page */}
          <button>Choose Another Number</button> {/* Button to navigate back to the randomization page */}
        </Link>
      </div>
    </>
  );
}

//Main app component
function App() {
  return (
    <BrowserRouter basename="/tarot"> {/* Sets up the router to handle different pages */}
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* Landing page with random number input */}
        <Route path="/fortune" element={<FortunePage />} /> {/* Main tarot reading page */}
        <Route path="/about" element={<About />} /> {/* About page */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
