export type TriviaQuestion = {
  id: string;
  category: "development" | "memes-nfts" | "scams" | "incidents";
  question: string;
  options: string[];
  correctAnswer: number;
  yearIndicator: number; // Approximate year this knowledge became relevant
};

export const triviaQuestions: TriviaQuestion[] = [
  // Development Category
  {
    id: "dev-1",
    category: "development",
    question: "Which consensus mechanism does Ethereum use after 'The Merge'?",
    options: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Proof of Space"],
    correctAnswer: 1,
    yearIndicator: 2022,
  },
  {
    id: "dev-2",
    category: "development",
    question: "What programming language is primarily used for Ethereum smart contracts?",
    options: ["JavaScript", "Python", "Solidity", "Rust"],
    correctAnswer: 2,
    yearIndicator: 2017,
  },
  {
    id: "dev-3",
    category: "development",
    question: "What is ERC-721?",
    options: ["A fungible token standard", "A non-fungible token standard", "A governance standard", "A staking standard"],
    correctAnswer: 1,
    yearIndicator: 2018,
  },
  {
    id: "dev-4",
    category: "development",
    question: "What is a Layer 2 solution?",
    options: ["A new blockchain", "A scaling solution built on top of an existing blockchain", "A consensus mechanism", "A type of wallet"],
    correctAnswer: 1,
    yearIndicator: 2020,
  },
  {
    id: "dev-5",
    category: "development",
    question: "What is the primary purpose of Farcaster?",
    options: ["A decentralized exchange", "A decentralized social protocol", "A layer 2 solution", "A stablecoin protocol"],
    correctAnswer: 1,
    yearIndicator: 2021,
  },

  // Memes/NFTs Category
  {
    id: "meme-1",
    category: "memes-nfts",
    question: "Which NFT collection features pixelated characters and became one of the first major NFT phenomena?",
    options: ["Bored Ape Yacht Club", "CryptoPunks", "Azuki", "Doodles"],
    correctAnswer: 1,
    yearIndicator: 2017,
  },
  {
    id: "meme-2",
    category: "memes-nfts",
    question: "What does 'WAGMI' stand for in crypto culture?",
    options: ["We Are Getting Money Instantly", "We're All Gonna Make It", "When Art Generates Massive Income", "Wealth And Growth Metrics Index"],
    correctAnswer: 1,
    yearIndicator: 2021,
  },
  {
    id: "meme-3",
    category: "memes-nfts",
    question: "What is 'Diamond Hands' referring to?",
    options: ["A type of NFT", "Holding assets despite volatility", "A crypto wallet", "A mining technique"],
    correctAnswer: 1,
    yearIndicator: 2020,
  },
  {
    id: "meme-4",
    category: "memes-nfts",
    question: "Which meme coin was initially created as a joke but gained significant value?",
    options: ["Bitcoin", "Ethereum", "Dogecoin", "USD Coin"],
    correctAnswer: 2,
    yearIndicator: 2013,
  },
  {
    id: "meme-5",
    category: "memes-nfts",
    question: "What does 'HODL' originally come from?",
    options: ["Hold On for Dear Life", "A misspelling of 'HOLD'", "High-Octane Decentralized Ledger", "Highly Optimized Digital Liquidity"],
    correctAnswer: 1,
    yearIndicator: 2013,
  },

  // Scams Category
  {
    id: "scam-1",
    category: "scams",
    question: "What is a 'rug pull' in crypto?",
    options: ["A hardware wallet malfunction", "Developers abandoning a project after taking investors' money", "A type of mining attack", "A market manipulation technique"],
    correctAnswer: 1,
    yearIndicator: 2020,
  },
  {
    id: "scam-2",
    category: "scams",
    question: "What was BitConnect primarily known for?",
    options: ["Being the first DEX", "A legitimate lending platform", "A Ponzi scheme", "A hardware wallet"],
    correctAnswer: 2,
    yearIndicator: 2018,
  },
  {
    id: "scam-3",
    category: "scams",
    question: "What is 'phishing' in the context of crypto?",
    options: ["Mining for small amounts of crypto", "Attempting to steal private keys through deception", "A consensus mechanism", "A type of airdrop"],
    correctAnswer: 1,
    yearIndicator: 2016,
  },
  {
    id: "scam-4",
    category: "scams",
    question: "What is a 'honeypot' in crypto?",
    options: ["A contract designed to trap funds", "A high-yield staking pool", "A type of hardware wallet", "A reward mechanism"],
    correctAnswer: 0,
    yearIndicator: 2019,
  },
  {
    id: "scam-5",
    category: "scams",
    question: "What type of scam involves impersonating celebrities to promote fake giveaways?",
    options: ["Rug pull", "Pump and dump", "Social engineering", "Celebrity endorsement scam"],
    correctAnswer: 3,
    yearIndicator: 2018,
  },

  // Incidents Category
  {
    id: "incident-1",
    category: "incidents",
    question: "What was 'The DAO' hack?",
    options: ["A social media account breach", "An exchange hack", "An exploit of a smart contract vulnerability", "A 51% attack"],
    correctAnswer: 2,
    yearIndicator: 2016,
  },
  {
    id: "incident-2",
    category: "incidents",
    question: "Which exchange filed for bankruptcy in 2022 after misusing customer funds?",
    options: ["Binance", "Coinbase", "FTX", "Kraken"],
    correctAnswer: 2,
    yearIndicator: 2022,
  },
  {
    id: "incident-3",
    category: "incidents",
    question: "What was the name of the Bitcoin exchange that was hacked in 2014, leading to its bankruptcy?",
    options: ["Mt. Gox", "Binance", "Coinbase", "Kraken"],
    correctAnswer: 0,
    yearIndicator: 2014,
  },
  {
    id: "incident-4",
    category: "incidents",
    question: "What major event caused Bitcoin to crash in May 2021?",
    options: ["US regulation", "China's mining ban", "Elon Musk's tweets", "DeFi collapse"],
    correctAnswer: 1,
    yearIndicator: 2021,
  },
  {
    id: "incident-5",
    category: "incidents",
    question: "What was the Terra/Luna collapse of 2022?",
    options: ["A mining pool shutdown", "A stablecoin losing its peg and collapsing", "An exchange hack", "A 51% attack"],
    correctAnswer: 1,
    yearIndicator: 2022,
  },
];

export const getRandomQuestions = (count: number = 8): TriviaQuestion[] => {
  // Ensure we get questions from each category
  const categories = ["development", "memes-nfts", "scams", "incidents"] as const;
  const questionsPerCategory = Math.floor(count / categories.length);
  const remainder = count % categories.length;
  
  let selectedQuestions: TriviaQuestion[] = [];
  
  categories.forEach((category, index) => {
    const categoryQuestions = triviaQuestions.filter(q => q.category === category);
    const categoryCount = index < remainder ? questionsPerCategory + 1 : questionsPerCategory;
    
    // Shuffle the category questions
    const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
    
    // Take the required number of questions
    selectedQuestions = [...selectedQuestions, ...shuffled.slice(0, categoryCount)];
  });
  
  // Shuffle the final selection to mix categories
  return selectedQuestions.sort(() => 0.5 - Math.random());
};

export const calculateCryptoEntryYear = (score: number, totalQuestions: number): number => {
  // Calculate percentage score
  const percentageScore = (score / totalQuestions) * 100;
  
  // Map percentage to a year (2013-2023 range)
  // Higher score = earlier entry (more knowledgeable about early crypto)
  if (percentageScore >= 90) return 2013; // OG crypto knowledge
  if (percentageScore >= 80) return 2015;
  if (percentageScore >= 70) return 2017; // Bull run era
  if (percentageScore >= 60) return 2019;
  if (percentageScore >= 50) return 2020; // DeFi summer
  if (percentageScore >= 40) return 2021; // NFT boom
  if (percentageScore >= 30) return 2022; // Bear market
  return 2023; // Crypto newbie
};
