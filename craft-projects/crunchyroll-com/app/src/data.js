// Sample catalog: real anime titles, metadata only (no artwork, no episodes).
// Descriptions are short summaries written for this app.
// `trailer` is a YouTube video id of an official trailer, or null when none is set;
// the player then offers a YouTube search for the official trailer instead.

export const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Historical', 'Horror',
  'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];

const s = (name, episodes, year) => ({ name, episodes, year });

export const SHOWS = [
  {
    id: 'frieren', title: "Frieren: Beyond Journey's End", year: 2023, studio: 'Madhouse', rating: '13+',
    genres: ['Adventure', 'Fantasy', 'Drama'], score: 4.9, popularity: 99,
    blurb: 'Long after the hero’s party saved the world, an elf mage who barely noticed the years go by sets out to understand the people she travelled with.',
    seasons: [s('Season 1', 28, 2023)], colors: ['#3a6b8f', '#c9e4d6'], trailer: null,
  },
  {
    id: 'jujutsu-kaisen', title: 'Jujutsu Kaisen', year: 2020, studio: 'MAPPA', rating: '16+',
    genres: ['Action', 'Supernatural'], score: 4.8, popularity: 98,
    blurb: 'A high-schooler swallows a cursed relic and joins a secret school of sorcerers who fight the curses born from human fear.',
    seasons: [s('Season 1', 24, 2020), s('Season 2', 23, 2023)], colors: ['#1d1b3a', '#6a3fd1'], trailer: 'pkKu9hLT-t8',
  },
  {
    id: 'demon-slayer', title: 'Demon Slayer: Kimetsu no Yaiba', year: 2019, studio: 'ufotable', rating: '16+',
    genres: ['Action', 'Fantasy', 'Historical'], score: 4.8, popularity: 97,
    blurb: 'After demons attack his family, a kind-hearted boy trains as a swordsman to cure his sister and hunt the creature responsible.',
    seasons: [s('Season 1', 26, 2019), s('Entertainment District Arc', 11, 2021), s('Swordsmith Village Arc', 11, 2023), s('Hashira Training Arc', 8, 2024)],
    colors: ['#0f3d3a', '#e0533b'], trailer: 'VQGCKyvzIM4',
  },
  {
    id: 'attack-on-titan', title: 'Attack on Titan', year: 2013, studio: 'Wit Studio / MAPPA', rating: '18+',
    genres: ['Action', 'Drama', 'Fantasy'], score: 4.9, popularity: 96,
    blurb: 'Humanity lives behind enormous walls to hide from man-eating giants, until the day the outer wall falls.',
    seasons: [s('Season 1', 25, 2013), s('Season 2', 12, 2017), s('Season 3', 22, 2018), s('The Final Season', 28, 2020)],
    colors: ['#3b2a1f', '#b4825a'], trailer: 'MGRm4IzK1SQ',
  },
  {
    id: 'chainsaw-man', title: 'Chainsaw Man', year: 2022, studio: 'MAPPA', rating: '18+',
    genres: ['Action', 'Horror', 'Supernatural'], score: 4.7, popularity: 94,
    blurb: 'A broke young devil hunter merges with his chainsaw-dog companion and is drafted into a government squad.',
    seasons: [s('Season 1', 12, 2022)], colors: ['#2a0e0e', '#f2a33a'], trailer: 'q15CRdE5Bv0',
  },
  {
    id: 'spy-x-family', title: 'SPY x FAMILY', year: 2022, studio: 'Wit Studio / CloverWorks', rating: '13+',
    genres: ['Comedy', 'Action', 'Slice of Life'], score: 4.8, popularity: 95,
    blurb: 'A spy, an assassin and a mind-reading girl form a fake family, each keeping their own secret from the others.',
    seasons: [s('Season 1', 25, 2022), s('Season 2', 12, 2023)], colors: ['#25425e', '#f2b5c4'], trailer: null,
  },
  {
    id: 'solo-leveling', title: 'Solo Leveling', year: 2024, studio: 'A-1 Pictures', rating: '16+',
    genres: ['Action', 'Fantasy', 'Adventure'], score: 4.7, popularity: 93,
    blurb: 'The weakest hunter in a world of monster gates gains a mysterious system that lets him grow stronger without limit.',
    seasons: [s('Season 1', 12, 2024), s('Season 2 -Arise from the Shadow-', 13, 2025)], colors: ['#0b1730', '#4a7dff'], trailer: null,
  },
  {
    id: 'one-piece', title: 'One Piece', year: 1999, studio: 'Toei Animation', rating: '13+',
    genres: ['Adventure', 'Action', 'Comedy'], score: 4.8, popularity: 92,
    blurb: 'A rubber-bodied captain gathers a crew of misfits and sails the Grand Line in search of the legendary treasure.',
    seasons: [s('East Blue', 61, 1999), s('Alabasta', 74, 2001)], colors: ['#0d4f8b', '#f5c542'], trailer: null,
  },
  {
    id: 'my-hero-academia', title: 'My Hero Academia', year: 2016, studio: 'Bones', rating: '13+',
    genres: ['Action', 'Comedy', 'Sci-Fi'], score: 4.6, popularity: 90,
    blurb: 'In a society where most people have superpowers, a boy born without one inherits the power of the greatest hero.',
    seasons: [s('Season 1', 13, 2016), s('Season 2', 25, 2017), s('Season 3', 25, 2018), s('Season 4', 25, 2019), s('Season 5', 25, 2021), s('Season 6', 25, 2022), s('Season 7', 21, 2024)],
    colors: ['#1c4f3a', '#e84a4a'], trailer: null,
  },
  {
    id: 'haikyu', title: 'Haikyu!!', year: 2014, studio: 'Production I.G', rating: '13+',
    genres: ['Sports', 'Comedy', 'Drama'], score: 4.8, popularity: 88,
    blurb: 'A short but fearless volleyball player teams up with his genius rival to take a fallen high-school team to nationals.',
    seasons: [s('Season 1', 25, 2014), s('Season 2', 25, 2015), s('Karasuno vs Shiratorizawa', 10, 2016), s('To the Top', 25, 2020)],
    colors: ['#1a1a1a', '#ff7a1a'], trailer: null,
  },
  {
    id: 'mob-psycho-100', title: 'Mob Psycho 100', year: 2016, studio: 'Bones', rating: '13+',
    genres: ['Action', 'Comedy', 'Supernatural'], score: 4.8, popularity: 82,
    blurb: 'An overwhelmingly powerful psychic middle-schooler just wants a normal life, while working for a fraud of an exorcist.',
    seasons: [s('Season 1', 12, 2016), s('Season 2', 13, 2019), s('Season 3', 12, 2022)], colors: ['#5c2d91', '#40e0b0'], trailer: null,
  },
  {
    id: 'vinland-saga', title: 'Vinland Saga', year: 2019, studio: 'Wit Studio / MAPPA', rating: '16+',
    genres: ['Action', 'Historical', 'Drama'], score: 4.8, popularity: 84,
    blurb: 'A young Viking warrior chases revenge across 11th-century Europe, then searches for a life beyond war.',
    seasons: [s('Season 1', 24, 2019), s('Season 2', 24, 2023)], colors: ['#2c3e46', '#c7b38b'], trailer: null,
  },
  {
    id: 'fullmetal-alchemist-brotherhood', title: 'Fullmetal Alchemist: Brotherhood', year: 2009, studio: 'Bones', rating: '13+',
    genres: ['Action', 'Adventure', 'Fantasy'], score: 4.9, popularity: 89,
    blurb: 'Two brothers who paid a terrible price for breaking alchemy’s greatest taboo search for a way to restore their bodies.',
    seasons: [s('Season 1', 64, 2009)], colors: ['#5a1414', '#d9a441'], trailer: null,
  },
  {
    id: 'cowboy-bebop', title: 'Cowboy Bebop', year: 1998, studio: 'Sunrise', rating: '16+',
    genres: ['Sci-Fi', 'Action', 'Drama'], score: 4.8, popularity: 80,
    blurb: 'A crew of broke bounty hunters drifts around the solar system in 2071, each running from a past that keeps catching up.',
    seasons: [s('Season 1', 26, 1998)], colors: ['#14324a', '#e3b04b'], trailer: null,
  },
  {
    id: 'death-note', title: 'Death Note', year: 2006, studio: 'Madhouse', rating: '16+',
    genres: ['Thriller', 'Mystery', 'Supernatural'], score: 4.7, popularity: 86,
    blurb: 'A top student finds a notebook that kills anyone whose name is written in it, and a brilliant detective sets out to stop him.',
    seasons: [s('Season 1', 37, 2006)], colors: ['#0d0d0d', '#b71c1c'], trailer: null,
  },
  {
    id: 'steins-gate', title: 'Steins;Gate', year: 2011, studio: 'White Fox', rating: '13+',
    genres: ['Sci-Fi', 'Thriller', 'Drama'], score: 4.8, popularity: 78,
    blurb: 'A self-styled mad scientist accidentally builds a microwave that sends messages to the past, with dangerous results.',
    seasons: [s('Season 1', 24, 2011)], colors: ['#3a3226', '#7fb069'], trailer: null,
  },
  {
    id: 'dandadan', title: 'DAN DA DAN', year: 2024, studio: 'Science SARU', rating: '16+',
    genres: ['Action', 'Comedy', 'Supernatural'], score: 4.8, popularity: 95,
    blurb: 'A girl who believes in ghosts and a boy who believes in aliens make a bet, and both turn out to be right.',
    seasons: [s('Season 1', 12, 2024), s('Season 2', 12, 2025)], colors: ['#ff4f7b', '#2d1e5f'], trailer: null,
  },
  {
    id: 'oshi-no-ko', title: '[Oshi No Ko]', year: 2023, studio: 'Doga Kobo', rating: '16+',
    genres: ['Drama', 'Mystery', 'Music'], score: 4.6, popularity: 85,
    blurb: 'Reborn as the children of a pop idol, twins dig into the glamorous and cruel entertainment industry.',
    seasons: [s('Season 1', 11, 2023), s('Season 2', 13, 2024)], colors: ['#4b2a7b', '#ff86c8'], trailer: null,
  },
  {
    id: 'blue-lock', title: 'BLUE LOCK', year: 2022, studio: 'Eight Bit', rating: '13+',
    genres: ['Sports', 'Drama'], score: 4.5, popularity: 83,
    blurb: '300 young strikers are locked in a training facility where only one will become the national team’s ace.',
    seasons: [s('Season 1', 24, 2022), s('Season 2', 14, 2024)], colors: ['#08234d', '#2fd0ff'], trailer: null,
  },
  {
    id: 'bocchi-the-rock', title: 'BOCCHI THE ROCK!', year: 2022, studio: 'CloverWorks', rating: '13+',
    genres: ['Music', 'Comedy', 'Slice of Life'], score: 4.8, popularity: 79,
    blurb: 'A painfully shy guitarist who shines online gets pulled into a real band and has to face an actual audience.',
    seasons: [s('Season 1', 12, 2022)], colors: ['#f06292', '#ffd54f'], trailer: null,
  },
  {
    id: 'made-in-abyss', title: 'Made in Abyss', year: 2017, studio: 'Kinema Citrus', rating: '16+',
    genres: ['Adventure', 'Fantasy', 'Drama'], score: 4.7, popularity: 74,
    blurb: 'An orphan and a robot boy descend into a vast, beautiful pit that grows more dangerous the deeper they go.',
    seasons: [s('Season 1', 13, 2017), s('The Golden City of the Scorching Sun', 12, 2022)], colors: ['#20453a', '#e8c37b'], trailer: null,
  },
  {
    id: 're-zero', title: 'Re:ZERO -Starting Life in Another World-', year: 2016, studio: 'White Fox', rating: '16+',
    genres: ['Fantasy', 'Drama', 'Thriller'], score: 4.6, popularity: 81,
    blurb: 'Pulled into a fantasy world, a young man discovers that each time he dies, time rewinds to a fixed checkpoint.',
    seasons: [s('Season 1', 25, 2016), s('Season 2', 25, 2020), s('Season 3', 16, 2024)], colors: ['#2c2a6b', '#9ad0ff'], trailer: null,
  },
  {
    id: 'your-name', title: 'Your Name.', year: 2016, studio: 'CoMix Wave Films', rating: '13+',
    genres: ['Romance', 'Drama', 'Fantasy'], score: 4.9, popularity: 87, movie: true, runtime: 106,
    blurb: 'A city boy and a country girl start waking up in each other’s bodies, connected across distance and time.',
    seasons: [s('Movie', 1, 2016)], colors: ['#1b2b6b', '#f7a8c4'], trailer: 'xU47nhruN-Q',
  },
  {
    id: 'kaguya-sama', title: 'Kaguya-sama: Love is War', year: 2019, studio: 'A-1 Pictures', rating: '13+',
    genres: ['Romance', 'Comedy'], score: 4.8, popularity: 77,
    blurb: 'Two proud student-council geniuses are in love, and each schemes to make the other confess first.',
    seasons: [s('Season 1', 12, 2019), s('Season 2', 12, 2020), s('Ultra Romantic', 13, 2022)], colors: ['#7a0f2e', '#f6c1d0'], trailer: null,
  },
  {
    id: 'delicious-in-dungeon', title: 'Delicious in Dungeon', year: 2024, studio: 'Trigger', rating: '13+',
    genres: ['Fantasy', 'Adventure', 'Comedy'], score: 4.7, popularity: 80,
    blurb: 'Too broke to buy supplies, a party of adventurers dives back into a dungeon and learns to cook the monsters inside.',
    seasons: [s('Season 1', 24, 2024)], colors: ['#4a3b16', '#9bd16d'], trailer: null,
  },
  {
    id: 'apothecary-diaries', title: 'The Apothecary Diaries', year: 2023, studio: 'OLM / TOHO animation', rating: '13+',
    genres: ['Mystery', 'Historical', 'Drama'], score: 4.8, popularity: 86,
    blurb: 'A sharp-witted apothecary sold into the imperial palace solves its poisonings and mysteries one by one.',
    seasons: [s('Season 1', 24, 2023), s('Season 2', 24, 2025)], colors: ['#3e1f47', '#e6b85c'], trailer: null,
  },
  {
    id: 'kaiju-no-8', title: 'Kaiju No. 8', year: 2024, studio: 'Production I.G', rating: '16+',
    genres: ['Action', 'Sci-Fi'], score: 4.5, popularity: 84,
    blurb: 'A monster-corpse cleaner who never gave up on joining the defence force suddenly gains the power to become a kaiju.',
    seasons: [s('Season 1', 12, 2024), s('Season 2', 11, 2025)], colors: ['#0f2d24', '#ff8a3d'], trailer: null,
  },
  {
    id: 'horimiya', title: 'Horimiya', year: 2021, studio: 'CloverWorks', rating: '13+',
    genres: ['Romance', 'Slice of Life', 'Comedy'], score: 4.6, popularity: 72,
    blurb: 'A popular girl and a quiet classmate discover each other’s hidden sides outside school.',
    seasons: [s('Season 1', 13, 2021), s('The Missing Pieces', 13, 2023)], colors: ['#ffb199', '#4a6fa5'], trailer: null,
  },
];

export const HERO_IDS = ['frieren', 'jujutsu-kaisen', 'dandadan', 'solo-leveling', 'spy-x-family'];

export const byId = (id) => SHOWS.find((x) => x.id === id);

export const totalEpisodes = (show) => show.seasons.reduce((n, se) => n + se.episodes, 0);
