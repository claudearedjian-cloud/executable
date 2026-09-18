/**
 * Question bank for Quiz Night.
 *
 * 125 questions: 25 each of Geography, History, General Knowledge, Celebrities
 * and Lebanon. Every question has exactly four options and `answer` is the
 * 0-based index of the correct one. `fact` is the one-liner the host reads on
 * the reveal. Celebrities questions carry an optional `avatar` (an emoji shown
 * as the visual tile) and a clue as the question text; an `image` path may be
 * supplied instead to show a real photo.
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

const celebrities = [
  {
    id: 'cel-01',
    avatar: '🎤',
    question: 'Known as the \u201cQueen of Pop\u201d, with hits like \u201cLike a Prayer\u201d and \u201cVogue\u201d.',
    options: ['Madonna', 'Cher', 'Whitney Houston', 'Cyndi Lauper'],
    answer: 0,
    fact: 'Madonna was born in Michigan in 1958 and has sold more than 300 million records worldwide.'
  },
  {
    id: 'cel-02',
    avatar: '🕺',
    question: 'The \u201cKing of Pop\u201d behind \u201cThriller\u201d, the best-selling album of all time.',
    options: ['Prince', 'Michael Jackson', 'Stevie Wonder', 'James Brown'],
    answer: 1,
    fact: 'Thriller (1982) has sold over 70 million copies, more than any other album.'
  },
  {
    id: 'cel-03',
    avatar: '👑',
    question: 'Sang \u201cHalo\u201d and \u201cSingle Ladies\u201d and headlined the album \u201cLemonade\u201d.',
    options: ['Rihanna', 'Alicia Keys', 'Beyonc\u00e9', 'Mariah Carey'],
    answer: 2,
    fact: 'Beyonc\u00e9 holds the record for the most Grammy wins of any artist in history.'
  },
  {
    id: 'cel-04',
    avatar: '🎸',
    question: 'Behind the \u201cEras Tour\u201d and albums \u201cFearless\u201d and \u201c1989\u201d.',
    options: ['Katy Perry', 'Taylor Swift', 'Selena Gomez', 'Miley Cyrus'],
    answer: 1,
    fact: 'Taylor Swift began in country music and re-recorded her early albums as \u201cTaylor\u2019s Versions\u201d.'
  },
  {
    id: 'cel-05',
    avatar: '⚽',
    question: 'Portuguese footballer known as \u201cCR7\u201d, with five Ballon d\u2019Or awards.',
    options: ['Cristiano Ronaldo', 'Lu\u00eds Figo', 'Neymar', 'Zlatan Ibrahimovi\u0107'],
    answer: 0,
    fact: 'Cristiano Ronaldo is the all-time top scorer in men\u2019s international football.'
  },
  {
    id: 'cel-06',
    avatar: '🏆',
    question: 'Argentine forward who captained his country to the 2022 World Cup.',
    options: ['Sergio Ag\u00fcero', 'Lionel Messi', 'Diego Maradona', 'Paulo Dybala'],
    answer: 1,
    fact: 'Lionel Messi won a record eight Ballon d\u2019Or awards.'
  },
  {
    id: 'cel-07',
    avatar: '🎬',
    question: 'Starred in \u201cTitanic\u201d and won an Oscar for \u201cThe Revenant\u201d.',
    options: ['Brad Pitt', 'Matt Damon', 'Leonardo DiCaprio', 'Tom Hanks'],
    answer: 2,
    fact: 'DiCaprio\u2019s first Oscar came after five previous nominations.'
  },
  {
    id: 'cel-08',
    avatar: '🎭',
    question: 'Played the lead in \u201cFight Club\u201d and \u201cOnce Upon a Time in Hollywood\u201d.',
    options: ['Brad Pitt', 'George Clooney', 'Johnny Depp', 'Leonardo DiCaprio'],
    answer: 0,
    fact: 'Brad Pitt won a Best Picture Oscar as a producer of 12 Years a Slave.'
  },
  {
    id: 'cel-09',
    avatar: '🦖',
    question: 'Played Lara Croft in \u201cTomb Raider\u201d and the title role in \u201cMaleficent\u201d.',
    options: ['Scarlett Johansson', 'Angelina Jolie', 'Natalie Portman', 'Charlize Theron'],
    answer: 1,
    fact: 'Angelina Jolie won an Oscar for Girl, Interrupted in 2000.'
  },
  {
    id: 'cel-10',
    avatar: '📺',
    question: 'American talk-show host whose show ran for 25 years and who co-founded OWN.',
    options: ['Ellen DeGeneres', 'Oprah Winfrey', 'Wendy Williams', 'Jay Leno'],
    answer: 1,
    fact: 'Oprah Winfrey was the first Black woman to become a self-made billionaire.'
  },
  {
    id: 'cel-11',
    avatar: '🎙',
    question: 'The \u201cKing of Rock and Roll\u201d, from \u201cHound Dog\u201d to \u201cJailhouse Rock\u201d.',
    options: ['Chuck Berry', 'Buddy Holly', 'Elvis Presley', 'Jerry Lee Lewis'],
    answer: 2,
    fact: 'Elvis\u2019s Graceland in Memphis is one of the most-visited homes in America.'
  },
  {
    id: 'cel-12',
    avatar: '🎹',
    question: 'Frontman of Queen who wrote \u201cBohemian Rhapsody\u201d.',
    options: ['Freddie Mercury', 'David Bowie', 'Elton John', 'Robert Plant'],
    answer: 0,
    fact: 'Freddie Mercury\u2019s 1985 Live Aid set is often voted the greatest live performance ever.'
  },
  {
    id: 'cel-13',
    avatar: '🎧',
    question: 'British singer of \u201cHello\u201d and the album \u201c21\u201d.',
    options: ['Amy Winehouse', 'Dua Lipa', 'Adele', 'Sia'],
    answer: 2,
    fact: 'Adele\u2019s 21 is the best-selling album of the 21st century so far.'
  },
  {
    id: 'cel-14',
    avatar: '🎻',
    question: 'Sang \u201cShape of You\u201d and \u201cPerfect\u201d, and often performs loop-pedal sets.',
    options: ['Ed Sheeran', 'Sam Smith', 'Harry Styles', 'Shawn Mendes'],
    answer: 0,
    fact: 'Ed Sheeran\u2019s \u00f7 (Divide) tour became the highest-grossing concert tour ever at the time.'
  },
  {
    id: 'cel-15',
    avatar: '💃',
    question: 'Colombian star of \u201cHips Don\u2019t Lie\u201d and \u201cWaka Waka\u201d.',
    options: ['Jennifer Lopez', 'Shakira', 'Gloria Estefan', 'Rosal\u00eda'],
    answer: 1,
    fact: 'Shakira\u2019s \u201cWaka Waka\u201d was the official song of the 2010 World Cup.'
  },
  {
    id: 'cel-16',
    avatar: '🌟',
    question: '\u201cJ.Lo\u201d, singer and actress behind \u201cOn the Floor\u201d and \u201cHustlers\u201d.',
    options: ['Jennifer Lopez', 'Beyonc\u00e9', 'Christina Aguilera', 'Jessica Alba'],
    answer: 0,
    fact: 'Jennifer Lopez co-headlined the 2020 Super Bowl halftime show with Shakira.'
  },
  {
    id: 'cel-17',
    avatar: '🕶',
    question: 'From \u201cThe Fresh Prince\u201d to \u201cMen in Black\u201d, and an Oscar for \u201cAli\u201d nomination.',
    options: ['Denzel Washington', 'Will Smith', 'Martin Lawrence', 'Jamie Foxx'],
    answer: 1,
    fact: 'Will Smith won the Best Actor Oscar for King Richard in 2022.'
  },
  {
    id: 'cel-18',
    avatar: '🛩',
    question: 'Star of \u201cMission: Impossible\u201d and \u201cTop Gun\u201d, known for doing his own stunts.',
    options: ['Tom Hanks', 'Tom Cruise', 'Keanu Reeves', 'Bruce Willis'],
    answer: 1,
    fact: 'Tom Cruise famously performed a HALO jump and hung off the side of a plane for stunts.'
  },
  {
    id: 'cel-19',
    avatar: '🎭',
    question: 'The most Oscar-nominated actor in history, star of \u201cThe Devil Wears Prada\u201d.',
    options: ['Cate Blanchett', 'Meryl Streep', 'Judi Dench', 'Glenn Close'],
    answer: 1,
    fact: 'Meryl Streep has more than 20 Academy Award nominations and three wins.'
  },
  {
    id: 'cel-20',
    avatar: '👒',
    question: 'Star of \u201cBreakfast at Tiffany\u2019s\u201d and a lifelong humanitarian with UNICEF.',
    options: ['Grace Kelly', 'Audrey Hepburn', 'Elizabeth Taylor', 'Vivien Leigh'],
    answer: 1,
    fact: 'Audrey Hepburn received a posthumous EGOT — Emmy, Grammy, Oscar and Tony.'
  },
  {
    id: 'cel-21',
    avatar: '🎩',
    question: 'Silent-film icon whose \u201cLittle Tramp\u201d wore a bowler hat and cane.',
    options: ['Buster Keaton', 'Charlie Chaplin', 'Harold Lloyd', 'Stan Laurel'],
    answer: 1,
    fact: 'Chaplin\u2019s The Gold Rush and City Lights are landmarks of silent cinema.'
  },
  {
    id: 'cel-22',
    avatar: '💋',
    question: 'Hollywood icon of \u201cSome Like It Hot\u201d and \u201cGentlemen Prefer Blondes\u201d.',
    options: ['Marilyn Monroe', 'Rita Hayworth', 'Jane Mansfield', 'Brigitte Bardot'],
    answer: 0,
    fact: 'Marilyn Monroe\u2019s white-dress scene over a subway grate is one of film\u2019s most famous images.'
  },
  {
    id: 'cel-23',
    avatar: '🥅',
    question: 'English footballer famed for free kicks, later a club owner in Miami.',
    options: ['Wayne Rooney', 'David Beckham', 'Steven Gerrard', 'Frank Lampard'],
    answer: 1,
    fact: 'David Beckham is a co-founder of Inter Miami CF.'
  },
  {
    id: 'cel-24',
    avatar: '🎾',
    question: 'Winner of 23 Grand Slam singles titles, more than any other player in the Open Era.',
    options: ['Venus Williams', 'Serena Williams', 'Martina Navratilova', 'Steffi Graf'],
    answer: 1,
    fact: 'Serena Williams won Grand Slams across three different decades.'
  },
  {
    id: 'cel-25',
    avatar: '⚡',
    question: 'Jamaican sprinter, the fastest human on record over 100m and 200m.',
    options: ['Usain Bolt', 'Carl Lewis', 'Tyson Gay', 'Yohan Blake'],
    answer: 0,
    fact: 'Usain Bolt\u2019s 9.58s 100m world record from 2009 still stands.'
  }
];

const lebanon = [
  {
    id: 'leb-01',
    question: 'What is the capital city of Lebanon?',
    options: ['Tripoli', 'Beirut', 'Sidon', 'Zahle'],
    answer: 1,
    fact: 'Beirut has been inhabited for more than 5,000 years.'
  },
  {
    id: 'leb-02',
    question: 'Which tree appears at the centre of the Lebanese flag?',
    options: ['Olive', 'Pine', 'Cedar', 'Cypress'],
    answer: 2,
    fact: 'The Lebanon cedar is an ancient symbol of the country, mentioned in the Epic of Gilgamesh.'
  },
  {
    id: 'leb-03',
    question: 'The monumental Roman temples in the Beqaa Valley are at which site?',
    options: ['Baalbek', 'Byblos', 'Tyre', 'Anjar'],
    answer: 0,
    fact: 'Baalbek\u2019s Temple of Bacchus is among the best-preserved Roman temples anywhere.'
  },
  {
    id: 'leb-04',
    question: 'Which Lebanese town, also called Jbeil, is among the oldest continuously inhabited in the world?',
    options: ['Tyre', 'Byblos', 'Batroun', 'Sidon'],
    answer: 1,
    fact: 'Byblos gave its name to the Bible and to the word \u201cpaper\u201d via papyrus trade.'
  },
  {
    id: 'leb-05',
    question: 'Which ancient seafaring people, credited with the alphabet, originated on the Lebanese coast?',
    options: ['Minoans', 'Philistines', 'Phoenicians', 'Arameans'],
    answer: 2,
    fact: 'The Phoenician alphabet is the ancestor of Greek, Latin and Arabic scripts.'
  },
  {
    id: 'leb-06',
    question: 'What is considered the national dish of Lebanon?',
    options: ['Kibbeh', 'Hummus', 'Falafel', 'Shawarma'],
    answer: 0,
    fact: 'Kibbeh is bulgur and minced meat, often shaped into a torpedo and fried or baked.'
  },
  {
    id: 'leb-07',
    question: 'The spectacular limestone caves that were a New7Wonders finalist are?',
    options: ['Qadisha', 'Jeita Grotto', 'Afqa', 'Tannourine'],
    answer: 1,
    fact: 'Jeita Grotto\u2019s lower gallery is only accessible by boat.'
  },
  {
    id: 'leb-08',
    question: 'The famous rock formations off the Beirut coast at Raouche are known as?',
    options: ['The Pigeon Rocks', 'The Monk\u2019s Rock', 'The Lion\u2019s Head', 'The Palm Islands'],
    answer: 0,
    fact: 'The Pigeon Rocks are Beirut\u2019s most photographed natural landmark.'
  },
  {
    id: 'leb-09',
    question: 'What is the highest peak in Lebanon?',
    options: ['Mount Sannine', 'Qurnat as-Sawda', 'Mount Hermon', 'The Cedars'],
    answer: 1,
    fact: 'Qurnat as-Sawda reaches about 3,088 metres.'
  },
  {
    id: 'leb-10',
    question: 'Which sea lies along Lebanon\u2019s western coast?',
    options: ['Red Sea', 'Mediterranean Sea', 'Black Sea', 'Caspian Sea'],
    answer: 1,
    fact: 'Lebanon\u2019s coastline runs about 225 km along the eastern Mediterranean.'
  },
  {
    id: 'leb-11',
    question: 'Before the civil war, Beirut was famously nicknamed what?',
    options: ['Paris of the Middle East', 'Rome of the East', 'Venice of the Levant', 'Athens of Asia'],
    answer: 0,
    fact: 'The nickname reflected Beirut\u2019s caf\u00e9 culture and French-influenced architecture before the civil war.'
  },
  {
    id: 'leb-12',
    question: 'Which legendary Lebanese singer is beloved across the Arab world for songs like \u201cKifak Inta\u201d?',
    options: ['Fairuz', 'Umm Kulthum', 'Najwa Karam', 'Sabah'],
    answer: 0,
    fact: 'Fairuz\u2019s morning songs are a daily ritual in homes across Lebanon.'
  },
  {
    id: 'leb-13',
    question: 'The ancient port city also known as Saida is?',
    options: ['Tyre', 'Sidon', 'Batroun', 'Jounieh'],
    answer: 1,
    fact: 'Sidon\u2019s Sea Castle was built by the Crusaders in the 13th century.'
  },
  {
    id: 'leb-14',
    question: 'The coastal city also called Sour, home to a famous Roman hippodrome, is?',
    options: ['Tyre', 'Tripoli', 'Byblos', 'Akkar'],
    answer: 0,
    fact: 'Tyre\u2019s hippodrome is one of the largest ever built in the Roman world.'
  },
  {
    id: 'leb-15',
    question: 'Which valley is famous for vineyards and the historic Ch\u00e2teau Ksara winery?',
    options: ['Qadisha Valley', 'Beqaa Valley', 'Nahr Ibrahim', 'Wadi Khaled'],
    answer: 1,
    fact: 'Ksara, founded by Jesuits in 1857, is Lebanon\u2019s oldest winery.'
  },
  {
    id: 'leb-16',
    question: 'The \u201cHoly Valley\u201d, a UNESCO site of ancient monasteries, is?',
    options: ['Wadi Qadisha', 'Wadi Hammana', 'Nahr el-Kalb', 'Wadi Channine'],
    answer: 0,
    fact: 'Qadisha sheltered Maronite Christian communities for centuries.'
  },
  {
    id: 'leb-17',
    question: 'The ancient Cedars of God forest is closest to which town?',
    options: ['Zgharta', 'Bsharri', 'Ehden', 'Douma'],
    answer: 1,
    fact: 'Some trees in the Arz el-Rab forest are believed to be over a thousand years old.'
  },
  {
    id: 'leb-18',
    question: 'Lebanon shares land borders with Syria and which other country?',
    options: ['Jordan', 'Iraq', 'Israel', 'Cyprus'],
    answer: 2,
    fact: 'Cyprus lies about 160 km offshore but is separated by sea, not land.'
  },
  {
    id: 'leb-19',
    question: 'The Lebanese flag is red and white with the cedar in which colour?',
    options: ['Green', 'Black', 'Gold', 'Blue'],
    answer: 0,
    fact: 'The green cedar sits between two red bands on a white field.'
  },
  {
    id: 'leb-20',
    question: 'Tabbouleh, the national salad, is based on which herb?',
    options: ['Mint', 'Parsley', 'Coriander', 'Basil'],
    answer: 1,
    fact: 'Tabbouleh is parsley with bulgur, tomato, onion, lemon and olive oil.'
  },
  {
    id: 'leb-21',
    question: 'The Phoenicians were famed for producing which precious dye?',
    options: ['Indigo', 'Tyrian purple', 'Cochineal red', 'Saffron yellow'],
    answer: 1,
    fact: 'Tyrian purple was so costly it became the colour of royalty.'
  },
  {
    id: 'leb-22',
    question: 'The mountain range that gives the country much of its name is?',
    options: ['Mount Lebanon range', 'Anti-Lebanon', 'Chouf highlands', 'Amanus'],
    answer: 0,
    fact: 'The Mount Lebanon range runs the length of the country, with the Anti-Lebanon on the Syrian border.'
  },
  {
    id: 'leb-23',
    question: 'The popular Lebanese anise-flavoured spirit, usually served with mezze, is?',
    options: ['Arak', 'Ouzo', 'Raki', 'Sambuca'],
    answer: 0,
    fact: 'Arak turns milky when water is added and is nicknamed \u201cmilk of lions\u201d.'
  },
  {
    id: 'leb-24',
    question: 'Which Lebanese-American writer wrote \u201cThe Prophet\u201d?',
    options: ['Amin Maalouf', 'Kahlil Gibran', 'Elias Khoury', 'Hassan Daoud'],
    answer: 1,
    fact: 'The Prophet (1923) has been translated into more than 100 languages.'
  },
  {
    id: 'leb-25',
    question: 'Which university, founded in Beirut in 1866, is among the oldest in the region?',
    options: ['Universit\u00e9 Saint-Joseph', 'American University of Beirut', 'Lebanese University', 'Notre Dame University'],
    answer: 1,
    fact: 'The American University of Beirut opened as the Syrian Protestant College in 1866.'
  }
];

const CATEGORIES = {
  geography: { name: 'Geography', accent: '#38c9a4' },
  history: { name: 'History', accent: '#f0b357' },
  general: { name: 'General Knowledge', accent: '#7c96ff' },
  celebrities: { name: 'Celebrities', accent: '#ef6ea8' },
  lebanon: { name: 'Lebanon', accent: '#58b368' }
};

const BANK = {
  geography: geography.map((q) => ({ ...q, category: 'geography' })),
  history: history.map((q) => ({ ...q, category: 'history' })),
  general: general.map((q) => ({ ...q, category: 'general' })),
  celebrities: celebrities.map((q) => ({ ...q, category: 'celebrities' })),
  lebanon: lebanon.map((q) => ({ ...q, category: 'lebanon' }))
};

module.exports = { BANK, CATEGORIES };
