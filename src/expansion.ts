/** Five authored variations for each of thirty interactive systems: 150 more bad ideas. */
export type Mechanic =
  | 'whack'
  | 'defuse'
  | 'wires'
  | 'sort'
  | 'balance'
  | 'launch'
  | 'paint'
  | 'scratch'
  | 'swarm'
  | 'pinball'
  | 'orbit'
  | 'catch'
  | 'simon'
  | 'lights'
  | 'type'
  | 'stack'
  | 'herd'
  | 'grow'
  | 'vacuum'
  | 'domino'
  | 'lens'
  | 'constellation'
  | 'safe'
  | 'cookie'
  | 'traffic'
  | 'fishing'
  | 'alchemy'
  | 'garden'
  | 'mirror'
  | 'auction';
export interface ExpansionPack {
  mechanic: Mechanic;
  category: 'Arcade' | 'Toy' | 'Puzzle' | 'World' | 'Trap';
  names: string[];
  instruction: string;
  colors: string[];
}
const warm = ['#f58b66', '#e7c577', '#cc9bdf', '#7ecbb6', '#7eade4'];
export const packs: ExpansionPack[] = [
  {
    mechanic: 'whack',
    category: 'Arcade',
    names: [
      'Whack-a-lawyer',
      'The popup exterminator',
      'Angry mushroom season',
      'Gophers in the mainframe',
      'The audit has teeth',
    ],
    instruction: 'Click the intruders. Avoid the innocent green ones. Ten points wins.',
    colors: warm,
  },
  {
    mechanic: 'defuse',
    category: 'Trap',
    names: [
      'A bomb with trust issues',
      'The aggressively ticking toaster',
      'Deadline.exe',
      'The anxiety generator',
      'Please cut the suspense',
    ],
    instruction:
      'Hold to disarm. Release whenever the warning turns red. Fill the bar before the timer runs out.',
    colors: warm,
  },
  {
    mechanic: 'wires',
    category: 'Puzzle',
    names: [
      'Spaghetti engineering',
      'The cable management incident',
      'Connect the emotional support wires',
      'Electrician of the month',
      'A suspiciously colorful firewall',
    ],
    instruction:
      'Connect each left terminal to its matching right terminal. Colors are clues; numbers work too.',
    colors: warm,
  },
  {
    mechanic: 'sort',
    category: 'Puzzle',
    names: [
      'The sock dimension',
      'A very petty sorting hat',
      'Department of misplaced shapes',
      'Recycling your personality',
      'Organize the apocalypse',
    ],
    instruction:
      'Select a falling parcel, then its matching bin. Sort eight before three mistakes.',
    colors: warm,
  },
  {
    mechanic: 'balance',
    category: 'Toy',
    names: [
      'A perfectly balanced disaster',
      'The leaning tower of nonsense',
      'Egg on a spreadsheet',
      'Zen and the art of button maintenance',
      'The last brain cell',
    ],
    instruction:
      'Move the cursor or drag to tilt the beam. Keep the orb balanced for twelve seconds.',
    colors: warm,
  },
  {
    mechanic: 'launch',
    category: 'Arcade',
    names: [
      'Yeet the office supplies',
      'Intercontinental rubber band',
      'The emotionally loaded slingshot',
      'A practical use for meetings',
      'Catapult your problems',
    ],
    instruction:
      'Drag back from the launcher and release. Land three shots inside the moving target.',
    colors: warm,
  },
  {
    mechanic: 'paint',
    category: 'Toy',
    names: [
      'Vandalism with permission',
      'Graffiti for introverts',
      'The website gets a tattoo',
      'Modern art emergency',
      'Paint outside the consequences',
    ],
    instruction: 'Drag to paint. Pick a color. Your masterpiece is legally questionable.',
    colors: warm,
  },
  {
    mechanic: 'scratch',
    category: 'Trap',
    names: [
      'Scratch and mildly inconvenience',
      'The worst lottery ticket',
      'Warranty void if curious',
      'A secret under the pixels',
      'Congratulations: more website',
    ],
    instruction: 'Scratch away the foil to reveal the prize. Your finger is the coin.',
    colors: warm,
  },
  {
    mechanic: 'swarm',
    category: 'World',
    names: [
      'You are the bee manager',
      'A school of bad ideas',
      'The sentient dust bunnies',
      'Mosquitoes with a business plan',
      'Fireflies in witness protection',
    ],
    instruction: 'Move to guide the swarm. Hold down to scatter it. Collect the glowing food.',
    colors: warm,
  },
  {
    mechanic: 'pinball',
    category: 'Arcade',
    names: [
      'Pinball accounting',
      'Bumpers of infinite regret',
      'The elastic tax return',
      'Executive ball pit',
      'Newton has left the chat',
    ],
    instruction:
      'Tap either half to flip its paddle. Hit bumpers to score. Reach 200 before losing three balls.',
    colors: warm,
  },
  {
    mechanic: 'orbit',
    category: 'Arcade',
    names: [
      'Orbital parking violation',
      'Launch the very small moon',
      'Space debris internship',
      'The planet needs a hug',
      'NASA said absolutely not',
    ],
    instruction:
      'Click to release the orbiting satellite into the target. Three successful launches.',
    colors: warm,
  },
  {
    mechanic: 'catch',
    category: 'Arcade',
    names: [
      'Catch the falling excuses',
      'It is raining tiny hats',
      'The unpaid intern bucket',
      'Marshmallow liability insurance',
      'The emergency cheese collection',
    ],
    instruction: 'Move your basket to catch good drops. Red drops cost a life. Catch twelve.',
    colors: warm,
  },
  {
    mechanic: 'simon',
    category: 'Puzzle',
    names: [
      'Simon says stop pressing',
      'The memory of a goldfish',
      'Blink twice for technical support',
      'Repeat after the haunted toaster',
      'A very demanding doorbell',
    ],
    instruction: 'Watch the numbered pads, then repeat the sequence. Complete four rounds.',
    colors: warm,
  },
  {
    mechanic: 'lights',
    category: 'Puzzle',
    names: [
      'Who left the apocalypse on?',
      'The light switch conspiracy',
      'Outage in sector ridiculous',
      'Five by five existential crisis',
      'A grid with commitment issues',
    ],
    instruction: 'Click a tile to toggle it and its neighbors. Make every tile dark.',
    colors: warm,
  },
  {
    mechanic: 'type',
    category: 'Arcade',
    names: [
      'Keyboard exorcism',
      'The typo tribunal',
      'An aggressively literary ghost',
      'Escape from autocorrect',
      'Terms and conditions speedrun',
    ],
    instruction:
      'Type the displayed word and press Enter. On touch, use the text field. Complete five words.',
    colors: warm,
  },
  {
    mechanic: 'stack',
    category: 'Arcade',
    names: [
      'Stack overflow, literally',
      'The municipal planning disaster',
      'Tower of overdue invoices',
      'Skyscraper made of cheese',
      'One more floor cannot hurt',
    ],
    instruction:
      'Tap to drop the moving block. Only the overlapping part survives. Stack ten floors.',
    colors: warm,
  },
  {
    mechanic: 'herd',
    category: 'World',
    names: [
      'Herding quantum cats',
      'Escape of the office chairs',
      'Sheep without supervision',
      'A union of tiny triangles',
      'The ducks have organized',
    ],
    instruction: 'Move behind the creatures to herd them into the green pen. Bring five home.',
    colors: warm,
  },
  {
    mechanic: 'grow',
    category: 'World',
    names: [
      'Grow your own existential dread',
      'A tree with terrible opinions',
      'The bean that ate the interface',
      'The very hungry spreadsheet',
      'Botany with consequences',
    ],
    instruction:
      'Click to water your creature. Trim red branches before they overtake it. Reach full growth.',
    colors: warm,
  },
  {
    mechanic: 'vacuum',
    category: 'Toy',
    names: [
      'Vacuum the void',
      'An intern for the black hole',
      'Cosmic janitor simulator',
      'Dust management in sector zero',
      'The crumbs of reality',
    ],
    instruction:
      'Hold to pull the debris into your vacuum. Release to blast it outward. Clean the whole field.',
    colors: warm,
  },
  {
    mechanic: 'domino',
    category: 'Toy',
    names: [
      'The domino department',
      'A chain of questionable decisions',
      'The corporate restructure simulator',
      'One small push for nonsense',
      'The falling standards',
    ],
    instruction: 'Tap any domino to start a chain. Place a new one with a click in an empty space.',
    colors: warm,
  },
  {
    mechanic: 'lens',
    category: 'Puzzle',
    names: [
      'Find the invisible employee',
      'A defect in the wallpaper',
      'The secret accountant',
      'Spot the existential difference',
      'A suspiciously blank room',
    ],
    instruction:
      'Move the inspection light to find hidden symbols. Click them while illuminated. Find five.',
    colors: warm,
  },
  {
    mechanic: 'constellation',
    category: 'Puzzle',
    names: [
      'Connect the bad omens',
      'Astronomy for button addicts',
      'Your horoscope is buffering',
      'The celestial rubber duck',
      'A constellation of mistakes',
    ],
    instruction:
      'Connect stars in numbered order. A new constellation forms with each correct connection.',
    colors: warm,
  },
  {
    mechanic: 'safe',
    category: 'Puzzle',
    names: [
      'The safe contains another safe',
      'Crack the snack vault',
      'National reserve of bad ideas',
      'The savings account of chaos',
      'Do not open before yesterday',
    ],
    instruction:
      'Drag the dial. Click TEST when the marker points at the highlighted sector. Crack three tumblers.',
    colors: warm,
  },
  {
    mechanic: 'cookie',
    category: 'Trap',
    names: [
      'Accept all consequences',
      'The consent manager is hungry',
      'This cookie tracks your sadness',
      'A biscuit with legal counsel',
      'Reject all common sense',
    ],
    instruction:
      'Catch the escaping reject button. The accept button spawns more cookies. Reject three times to escape.',
    colors: warm,
  },
  {
    mechanic: 'traffic',
    category: 'World',
    names: [
      'Rush hour in Buttonopolis',
      'The intersection of poor decisions',
      'Tiny cars, massive egos',
      'Roundabout of eternal uncertainty',
      'Traffic department: one employee',
    ],
    instruction:
      'Click the junction to switch the green signal. Let twelve cars pass without three collisions.',
    colors: warm,
  },
  {
    mechanic: 'fishing',
    category: 'Arcade',
    names: [
      'Phishing, but with actual fish',
      'The inbox aquarium',
      'Gone fishing for common sense',
      'A bite from the data lake',
      'The very suspicious salmon',
    ],
    instruction:
      'Cast when fish pass under your hook, then reel when it flashes. Catch five; three misses ends the trip.',
    colors: warm,
  },
  {
    mechanic: 'alchemy',
    category: 'Puzzle',
    names: [
      'Mixology for catastrophes',
      'The potion of mild inconvenience',
      'Chemistry without adult supervision',
      'A cocktail called regret',
      'The forbidden soup recipe',
    ],
    instruction:
      'Read the recipe. Add ingredients in order, then stir. Brew three increasingly dubious potions.',
    colors: warm,
  },
  {
    mechanic: 'garden',
    category: 'World',
    names: [
      'The popup community garden',
      'Mushrooms in the source code',
      'Windowsill of infinite possibility',
      'A very dramatic greenhouse',
      'The garden of bad decisions',
    ],
    instruction:
      'Plant empty plots, water sprouts, and remove weeds. Grow six flowers before the weeds win.',
    colors: warm,
  },
  {
    mechanic: 'mirror',
    category: 'Arcade',
    names: [
      'The mirror is doing its best',
      'An equally confused reflection',
      'Left is right and right is wrong',
      'A second opinion from yourself',
      'The cursor in the looking glass',
    ],
    instruction:
      'Your cursor is mirrored. Guide its reflection into green checkpoints, avoiding the red walls.',
    colors: warm,
  },
  {
    mechanic: 'auction',
    category: 'Trap',
    names: [
      'Auction your remaining brain cells',
      'The button stock exchange',
      'Buy low, panic immediately',
      'An investment in bad decisions',
      'The invisible hand is clicking',
    ],
    instruction:
      'Buy when the price is low, sell when it rises. Make 50 credits before the market closes.',
    colors: warm,
  },
];
export const expansion = packs.flatMap((pack, family) =>
  pack.names.map((name, variant) => ({
    id: 121 + family * 5 + variant,
    name,
    category: pack.category,
    mechanic: pack.mechanic,
    variant,
    family: 'expansion-' + pack.mechanic,
    instruction: pack.instruction,
    color: pack.colors[variant],
  })),
);
