/**
 * Question bank for Quiz Night.
 *
 * 75 questions: 25 Geography, 25 History, 25 General Knowledge.
 * Every question has exactly four options and `answer` is the 0-based index
 * of the correct one. `fact` is the one-liner the host reads on the reveal.
 *
 * This file is plain data on purpose so a community centre can edit it in a
 * text editor without touching any code.
 */

const geography = [
  {
    id: 'geo-01',
    question: 'What is the capital city of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    answer: 2,
    fact: 'Canberra was purpose-built in 1913 as a compromise after Sydney and Melbourne both wanted the job.'
  },
  {
    id: 'geo-02',
    question: 'Which is traditionally regarded as the longest river in the world?',
    options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
    answer: 1,
    fact: 'The Nile runs about 6,650 km, though some surveys put the Amazon slightly ahead.'
  },
  {
    id: 'geo-03',
    question: 'What is the largest desert in the world by area?',
    options: ['Sahara', 'Gobi', 'Antarctic', 'Arabian'],
    answer: 2,
    fact: 'Antarctica is a polar desert covering about 14 million square kilometres. The Sahara is the largest hot desert.'
  },
  {
    id: 'geo-04',
    question: 'Which country spans the most time zones?',
    options: ['Russia', 'United States', 'France', 'China'],
    answer: 2,
    fact: 'Counting its overseas territories, France spans twelve time zones — more than Russia.'
  },
  {
    id: 'geo-05',
    question: 'Mount Everest sits on the border of Nepal and which other country?',
    options: ['India', 'Bhutan', 'China', 'Pakistan'],
    answer: 2,
    fact: 'The summit itself marks the Nepal–Tibet border, and Tibet is an autonomous region of China.'
  },
  {
    id: 'geo-06',
    question: 'What is the smallest country in the world by land area?',
    options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
    answer: 1,
    fact: 'Vatican City covers about 0.49 square kilometres and has fewer than 1,000 residents.'
  },
  {
    id: 'geo-07',
    question: 'Which continent has the most countries?',
    options: ['Asia', 'Europe', 'Africa', 'South America'],
    answer: 2,
    fact: 'Africa is home to 54 sovereign states — more than any other continent.'
  },
  {
    id: 'geo-08',
    question: 'The Great Barrier Reef lies off the coast of which country?',
    options: ['Indonesia', 'Australia', 'Philippines', 'Fiji'],
    answer: 1,
    fact: 'It stretches about 2,300 km along Queensland and is the largest structure built by living organisms.'
  },
  {
    id: 'geo-09',
    question: 'What is the capital city of Canada?',
    options: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'],
    answer: 3,
    fact: 'Queen Victoria chose Ottawa in 1857, partly because it sat safely away from the American border.'
  },
  {
    id: 'geo-10',
    question: 'Which is the deepest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Pacific', 'Southern'],
    answer: 2,
    fact: 'The Challenger Deep in the Pacific reaches almost 11,000 metres — deeper than Everest is tall.'
  },
  {
    id: 'geo-11',
    question: 'Which river flows through the centre of Paris?',
    options: ['Loire', 'Rhine', 'Seine', 'Rhone'],
    answer: 2,
    fact: 'The Seine runs 777 km from Burgundy to the English Channel at Le Havre.'
  },
  {
    id: 'geo-12',
    question: 'Which country has the longest coastline in the world?',
    options: ['Indonesia', 'Russia', 'Australia', 'Canada'],
    answer: 3,
    fact: "Canada's coastline measures roughly 202,000 km, thanks to its Arctic archipelago."
  },
  {
    id: 'geo-13',
    question: 'Which is the largest U.S. state by area?',
    options: ['Texas', 'California', 'Alaska', 'Montana'],
    answer: 2,
    fact: 'Alaska covers 1.72 million square kilometres — bigger than Texas, California and Montana combined.'
  },
  {
    id: 'geo-14',
    question: 'Which mountain range is generally taken as the boundary between Europe and Asia?',
    options: ['Alps', 'Caucasus', 'Carpathians', 'Urals'],
    answer: 3,
    fact: 'The Urals run about 2,500 km from the Arctic Ocean to the Kazakh steppe.'
  },
  {
    id: 'geo-15',
    question: 'What is the capital city of Turkey?',
    options: ['Istanbul', 'Izmir', 'Ankara', 'Antalya'],
    answer: 2,
    fact: 'Ankara replaced Istanbul as the capital in 1923 when the Republic of Turkey was founded.'
  },
  {
    id: 'geo-16',
    question: 'Which sea lies between Italy and Croatia?',
    options: ['Tyrrhenian', 'Adriatic', 'Aegean', 'Ionian'],
    answer: 1,
    fact: 'The Adriatic separates the Italian peninsula from the Balkans and stretches about 800 km.'
  },
  {
    id: 'geo-17',
    question: 'The Strait of Gibraltar separates Spain from which country?',
    options: ['Portugal', 'Algeria', 'Morocco', 'Tunisia'],
    answer: 2,
    fact: 'At its narrowest the strait is only about 14 km wide — Africa is visible from the Spanish coast.'
  },
  {
    id: 'geo-18',
    question: 'What is the capital city of New Zealand?',
    options: ['Auckland', 'Christchurch', 'Wellington', 'Hamilton'],
    answer: 2,
    fact: 'Wellington is the southernmost capital city of any sovereign state.'
  },
  {
    id: 'geo-19',
    question: 'Which country is completely surrounded by South Africa?',
    options: ['Eswatini', 'Lesotho', 'Botswana', 'Zimbabwe'],
    answer: 1,
    fact: 'Lesotho is also the only country in the world lying entirely above 1,000 metres of elevation.'
  },
  {
    id: 'geo-20',
    question: 'What is the largest island in the world?',
    options: ['New Guinea', 'Borneo', 'Madagascar', 'Greenland'],
    answer: 3,
    fact: 'Greenland covers about 2.17 million square kilometres. Australia is classed as a continent, not an island.'
  },
  {
    id: 'geo-21',
    question: 'What is the name of the line of latitude at 23.5 degrees north?',
    options: ['Equator', 'Tropic of Capricorn', 'Tropic of Cancer', 'Arctic Circle'],
    answer: 2,
    fact: 'It was named when the Sun appeared in the constellation Cancer at the June solstice.'
  },
  {
    id: 'geo-22',
    question: 'In which country would you find the historic city of Timbuktu?',
    options: ['Niger', 'Mali', 'Chad', 'Mauritania'],
    answer: 1,
    fact: 'In the 15th century Timbuktu was one of the great centres of Islamic scholarship in the world.'
  },
  {
    id: 'geo-23',
    question: 'The River Danube empties into which sea?',
    options: ['Baltic Sea', 'Mediterranean Sea', 'Black Sea', 'North Sea'],
    answer: 2,
    fact: 'It flows past more national capitals than any other river: Vienna, Bratislava, Budapest and Belgrade.'
  },
  {
    id: 'geo-24',
    question: 'In which country is the ancient rock-cut city of Petra?',
    options: ['Egypt', 'Israel', 'Jordan', 'Syria'],
    answer: 2,
    fact: 'Petra was carved into rose-red sandstone by the Nabataeans more than 2,000 years ago.'
  },
  {
    id: 'geo-25',
    question: 'The Galapagos Islands belong to which country?',
    options: ['Chile', 'Peru', 'Colombia', 'Ecuador'],
    answer: 3,
    fact: 'They lie about 1,000 km off the Ecuadorian coast and helped inspire Darwin\u2019s theory of evolution.'
  }
];

const history = [
  {
    id: 'his-01',
    question: 'In which year did the Second World War end in Europe?',
    options: ['1943', '1944', '1945', '1946'],
    answer: 2,
    fact: 'V-E Day was 8 May 1945. The war in the Pacific continued until September.'
  },
  {
    id: 'his-02',
    question: 'Who was the first President of the United States?',
    options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'],
    answer: 1,
    fact: 'Washington served from 1789 to 1797 and is the only president ever elected unanimously.'
  },
  {
    id: 'his-03',
    question: 'The Great Pyramid of Giza is located in which country?',
    options: ['Egypt', 'Sudan', 'Mexico', 'Iraq'],
    answer: 0,
    fact: 'It was built around 2560 BC as a tomb for the pharaoh Khufu and stood as the tallest structure on Earth for nearly 4,000 years.'
  },
  {
    id: 'his-04',
    question: 'The Battle of Hastings was fought in which year?',
    options: ['1066', '1215', '1348', '1485'],
    answer: 0,
    fact: 'William of Normandy defeated King Harold II and became William the Conqueror.'
  },
  {
    id: 'his-05',
    question: 'Who was the first Roman emperor?',
    options: ['Julius Caesar', 'Nero', 'Augustus', 'Caligula'],
    answer: 2,
    fact: 'Augustus, born Octavian, ruled from 27 BC. Julius Caesar was assassinated before the empire began.'
  },
  {
    id: 'his-06',
    question: 'In which year did the Berlin Wall fall?',
    options: ['1985', '1987', '1989', '1991'],
    answer: 2,
    fact: 'It came down on 9 November 1989; Germany was formally reunified in October 1990.'
  },
  {
    id: 'his-07',
    question: 'Who was the British Prime Minister for most of the Second World War?',
    options: ['Neville Chamberlain', 'Winston Churchill', 'Clement Attlee', 'Anthony Eden'],
    answer: 1,
    fact: 'Churchill led from 1940 to 1945 and again from 1951 to 1955. He won the Nobel Prize in Literature in 1953.'
  },
  {
    id: 'his-08',
    question: 'According to tradition, how many hills was ancient Rome built on?',
    options: ['Five', 'Six', 'Seven', 'Nine'],
    answer: 2,
    fact: 'The Palatine, Aventine, Capitoline, Quirinal, Viminal, Esquiline and Caelian hills.'
  },
  {
    id: 'his-09',
    question: 'Which explorer reached the Americas in 1492?',
    options: ['Vasco da Gama', 'Ferdinand Magellan', 'Christopher Columbus', 'Amerigo Vespucci'],
    answer: 2,
    fact: 'Columbus made four voyages across the Atlantic but never set foot on mainland North America.'
  },
  {
    id: 'his-10',
    question: 'In which year did the French Revolution begin?',
    options: ['1776', '1789', '1799', '1804'],
    answer: 1,
    fact: 'The storming of the Bastille on 14 July 1789 is taken as its starting point.'
  },
  {
    id: 'his-11',
    question: 'Which pharaoh\u2019s tomb did Howard Carter discover in 1922?',
    options: ['Ramesses II', 'Tutankhamun', 'Akhenaten', 'Khufu'],
    answer: 1,
    fact: 'The tomb in the Valley of the Kings was the most intact royal burial ever found in Egypt.'
  },
  {
    id: 'his-12',
    question: 'In which year was the Magna Carta sealed?',
    options: ['1066', '1215', '1314', '1455'],
    answer: 1,
    fact: 'King John sealed it at Runnymede. It was sealed with wax, not signed.'
  },
  {
    id: 'his-13',
    question: 'Who was the first person to walk on the Moon?',
    options: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Michael Collins'],
    answer: 2,
    fact: 'Armstrong stepped onto the lunar surface on 20 July 1969, with Buzz Aldrin close behind.'
  },
  {
    id: 'his-14',
    question: 'In which year did the Titanic sink?',
    options: ['1905', '1912', '1918', '1923'],
    answer: 1,
    fact: 'She went down in the early hours of 15 April 1912, on her maiden voyage.'
  },
  {
    id: 'his-15',
    question: 'Which country was divided along the 38th parallel in 1945?',
    options: ['Vietnam', 'Germany', 'Korea', 'China'],
    answer: 2,
    fact: 'The division created North and South Korea and led directly to the Korean War of 1950\u201353.'
  },
  {
    id: 'his-16',
    question: 'Who led India\u2019s independence movement through non-violent resistance?',
    options: ['Jawaharlal Nehru', 'Mahatma Gandhi', 'Sardar Patel', 'Bhagat Singh'],
    answer: 1,
    fact: 'His 1930 Salt March, a 390 km walk to the sea, became a defining act of civil disobedience.'
  },
  {
    id: 'his-17',
    question: 'The Renaissance began in which country?',
    options: ['France', 'Italy', 'Spain', 'Germany'],
    answer: 1,
    fact: 'It started in Florence in the 14th century, fuelled by the wealth of its banking families.'
  },
  {
    id: 'his-18',
    question: 'Who was the first woman to serve as British Prime Minister?',
    options: ['Theresa May', 'Margaret Thatcher', 'Harriet Harman', 'Barbara Castle'],
    answer: 1,
    fact: 'Thatcher served from 1979 to 1990 — the longest unbroken term of any 20th-century prime minister.'
  },
  {
    id: 'his-19',
    question: 'The Aztec Empire was centred in which modern-day country?',
    options: ['Peru', 'Guatemala', 'Mexico', 'Bolivia'],
    answer: 2,
    fact: 'Its capital, Tenochtitlan, was founded in 1325 on an island in Lake Texcoco, now Mexico City.'
  },
  {
    id: 'his-20',
    question: 'The Hundred Years\u2019 War was fought mainly between England and which country?',
    options: ['France', 'Spain', 'Scotland', 'The Netherlands'],
    answer: 0,
    fact: 'It actually lasted 116 years, from 1337 to 1453.'
  },
  {
    id: 'his-21',
    question: 'Who delivered the famous \u201cI Have a Dream\u201d speech?',
    options: ['Malcolm X', 'Martin Luther King Jr.', 'Rosa Parks', 'Jesse Jackson'],
    answer: 1,
    fact: 'He gave it on 28 August 1963 to around 250,000 people at the Lincoln Memorial in Washington, D.C.'
  },
  {
    id: 'his-22',
    question: 'Which city served as the capital of the Ottoman Empire?',
    options: ['Cairo', 'Athens', 'Istanbul', 'Baghdad'],
    answer: 2,
    fact: 'Mehmed II made Constantinople his capital after capturing it in 1453; it was renamed Istanbul.'
  },
  {
    id: 'his-23',
    question: 'Which U.S. President issued the Emancipation Proclamation?',
    options: ['Ulysses S. Grant', 'Abraham Lincoln', 'Andrew Johnson', 'James Buchanan'],
    answer: 1,
    fact: 'It took effect on 1 January 1863, in the middle of the American Civil War.'
  },
  {
    id: 'his-24',
    question: 'The Cold War was a prolonged rivalry between the United States and which power?',
    options: ['China', 'Germany', 'The Soviet Union', 'Cuba'],
    answer: 2,
    fact: 'It ran roughly from 1947 until the Soviet Union dissolved in December 1991.'
  },
  {
    id: 'his-25',
    question: 'Who introduced movable-type printing to Europe around 1440?',
    options: ['Johannes Gutenberg', 'Leonardo da Vinci', 'William Caxton', 'Albrecht Durer'],
    answer: 0,
    fact: 'Working in Mainz, Gutenberg set off a revolution in how knowledge spread across Europe.'
  }
];

const general = [
  {
    id: 'gen-01',
    question: 'How many players from one football team are on the pitch at kick-off?',
    options: ['9', '10', '11', '12'],
    answer: 2,
    fact: 'Eleven, including the goalkeeper.'
  },
  {
    id: 'gen-02',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Au', 'Ag', 'Gd'],
    answer: 1,
    fact: 'It comes from aurum, the Latin word for gold. Ag is silver.'
  },
  {
    id: 'gen-03',
    question: 'How many continents are there on Earth?',
    options: ['Five', 'Six', 'Seven', 'Eight'],
    answer: 2,
    fact: 'Africa, Antarctica, Asia, Australia, Europe, North America and South America.'
  },
  {
    id: 'gen-04',
    question: 'How many bones are in the adult human body?',
    options: ['186', '206', '226', '246'],
    answer: 1,
    fact: 'Babies are born with around 300, but many fuse together as they grow.'
  },
  {
    id: 'gen-05',
    question: 'What is the largest planet in our solar system?',
    options: ['Saturn', 'Neptune', 'Earth', 'Jupiter'],
    answer: 3,
    fact: 'Jupiter is more massive than all the other planets put together.'
  },
  {
    id: 'gen-06',
    question: 'Who wrote the play Romeo and Juliet?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Oscar Wilde'],
    answer: 1,
    fact: 'It was written in the mid-1590s and first published in 1597.'
  },
  {
    id: 'gen-07',
    question: 'How many strings does a standard violin have?',
    options: ['Three', 'Four', 'Five', 'Six'],
    answer: 1,
    fact: 'They are tuned to G, D, A and E.'
  },
  {
    id: 'gen-08',
    question: 'Which gas do plants take in from the air for photosynthesis?',
    options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
    answer: 2,
    fact: 'They release oxygen back into the air as a by-product.'
  },
  {
    id: 'gen-09',
    question: 'In which sport would you perform a slam dunk?',
    options: ['Volleyball', 'Tennis', 'Basketball', 'Netball'],
    answer: 2,
    fact: 'The dunk was banned in U.S. college basketball from 1967 to 1976.'
  },
  {
    id: 'gen-10',
    question: 'What is the currency of Japan?',
    options: ['Won', 'Yuan', 'Yen', 'Ringgit'],
    answer: 2,
    fact: 'The yen is the third most traded currency in the world, after the dollar and the euro.'
  },
  {
    id: 'gen-11',
    question: 'How many colours are traditionally said to be in a rainbow?',
    options: ['Five', 'Six', 'Seven', 'Nine'],
    answer: 2,
    fact: 'Red, orange, yellow, green, blue, indigo and violet — the seven colours Isaac Newton named.'
  },
  {
    id: 'gen-12',
    question: 'What is the hardest naturally occurring substance on Earth?',
    options: ['Quartz', 'Diamond', 'Titanium', 'Graphite'],
    answer: 1,
    fact: 'Diamond sits at 10 on the Mohs hardness scale. Graphite is the same element, arranged differently.'
  },
  {
    id: 'gen-13',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mercury', 'Mars', 'Jupiter'],
    answer: 2,
    fact: 'The colour comes from iron oxide — essentially rust — across its surface.'
  },
  {
    id: 'gen-14',
    question: 'How many minutes are there in a full day?',
    options: ['1,200', '1,440', '1,600', '2,400'],
    answer: 1,
    fact: 'Twenty-four hours times sixty minutes gives 1,440.'
  },
  {
    id: 'gen-15',
    question: 'What is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    answer: 2,
    fact: 'Two is the smallest prime, and the only even one. One is not prime by definition.'
  },
  {
    id: 'gen-16',
    question: 'The Mona Lisa is displayed in which museum?',
    options: ['The British Museum', 'The Louvre', 'The Prado', 'The Uffizi'],
    answer: 1,
    fact: 'The Louvre in Paris draws around nine million visitors a year, most of them there for this painting.'
  },
  {
    id: 'gen-17',
    question: 'How many hearts does an octopus have?',
    options: ['One', 'Two', 'Three', 'Four'],
    answer: 2,
    fact: 'Two pump blood to the gills and one to the rest of the body. Octopus blood is blue.'
  },
  {
    id: 'gen-18',
    question: 'What is the chemical formula for water?',
    options: ['CO2', 'H2O', 'O2', 'NaCl'],
    answer: 1,
    fact: 'Two hydrogen atoms bonded to one oxygen atom.'
  },
  {
    id: 'gen-19',
    question: 'Which musical instrument usually has 88 keys?',
    options: ['Organ', 'Harpsichord', 'Accordion', 'Piano'],
    answer: 3,
    fact: 'A standard piano has 52 white keys and 36 black ones.'
  },
  {
    id: 'gen-20',
    question: 'In the NATO phonetic alphabet, which word represents the letter T?',
    options: ['Texas', 'Tango', 'Toast', 'Toronto'],
    answer: 1,
    fact: 'The alphabet was standardised in 1956 and is used by aviation and militaries worldwide.'
  },
  {
    id: 'gen-21',
    question: 'How many sides does a hexagon have?',
    options: ['Five', 'Six', 'Seven', 'Eight'],
    answer: 1,
    fact: 'Hexagons tile a flat surface with no gaps, which is why bees build their combs from them.'
  },
  {
    id: 'gen-22',
    question: 'What is the largest animal on Earth?',
    options: ['African elephant', 'Blue whale', 'Giraffe', 'Colossal squid'],
    answer: 1,
    fact: 'A blue whale can reach 30 metres and weigh around 150 tonnes — its heart alone weighs about 180 kg.'
  },
  {
    id: 'gen-23',
    question: 'Which vitamin does the body make when skin is exposed to sunlight?',
    options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
    answer: 3,
    fact: 'It is sometimes called the sunshine vitamin, and it helps the body absorb calcium.'
  },
  {
    id: 'gen-24',
    question: 'How many holes are played in a standard round of golf?',
    options: ['9', '12', '18', '21'],
    answer: 2,
    fact: 'Eighteen became the standard after the Old Course at St Andrews settled on it in 1764.'
  },
  {
    id: 'gen-25',
    question: 'Light travels at roughly how many kilometres per second in a vacuum?',
    options: ['30,000', '150,000', '300,000', '1,000,000'],
    answer: 2,
    fact: 'The exact figure is 299,792.458 km per second — the universal speed limit.'
  }
];

const CATEGORIES = {
  geography: { name: 'Geography', accent: '#38c9a4' },
  history: { name: 'History', accent: '#f0b357' },
  general: { name: 'General Knowledge', accent: '#7c96ff' }
};

const BANK = {
  geography: geography.map((q) => ({ ...q, category: 'geography' })),
  history: history.map((q) => ({ ...q, category: 'history' })),
  general: general.map((q) => ({ ...q, category: 'general' }))
};

module.exports = { BANK, CATEGORIES };
