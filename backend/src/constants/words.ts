import { GameMode } from '../types/index.js';

export const LANGUAGE_WORD_BANKS: Record<string, string[]> = {
  en: [
    'apple', 'banana', 'orange', 'guitar', 'piano', 'violin', 'pizza', 'burger',
    'cookie', 'coffee', 'laptop', 'camera', 'rocket', 'bicycle', 'airplane', 'subway',
    'castle', 'bridge', 'mountain', 'rainbow', 'volcano', 'island', 'cactus', 'flower',
    'elephant', 'giraffe', 'penguin', 'dolphin', 'kangaroo', 'butterfly', 'octopus', 'spider',
    'diamond', 'helmet', 'umbrella', 'sunglasses', 'backpack', 'flashlight', 'telescope', 'compass',
    'campfire', 'waterfall', 'pyramid', 'lighthouse', 'skyscraper', 'windmill', 'submarine', 'helicopter',
    'astronaut', 'superhero', 'detective', 'wizard', 'dinosaur', 'robot', 'monster', 'alien',
    'sandwich', 'pancake', 'ice cream', 'cupcake', 'popcorn', 'lollipop', 'doughnut', 'strawberry',
    'football', 'basketball', 'tennis', 'baseball', 'skateboard', 'snowboard', 'surfboard', 'rollercoaster',
    'candle', 'clock', 'mirror', 'trophy', 'ladder', 'anchor', 'magnet', 'battery',
    'puzzle', 'dice', 'balloon', 'kite', 'swing', 'trampoline', 'treasure', 'feather',
    'lion', 'tiger', 'zebra', 'panda', 'monkey', 'snake', 'turtle', 'shark', 'whale',
    'crown', 'sword', 'shield', 'door', 'window', 'chair', 'table', 'lamp'
  ],
  es: [
    'manzana', 'platano', 'naranja', 'guitarra', 'piano', 'violin', 'pizza', 'hamburguesa',
    'galleta', 'cafe', 'laptop', 'camara', 'cohete', 'bicicleta', 'avion', 'metro',
    'castillo', 'puente', 'montana', 'arcoiris', 'volcan', 'isla', 'cactus', 'flor',
    'elefante', 'jirafa', 'pinguino', 'delfin', 'canguro', 'mariposa', 'pulpo', 'arana',
    'diamante', 'casco', 'sombrilla', 'gafas', 'mochila', 'linterna', 'telescopio', 'brujula',
    'fogata', 'cascada', 'piramide', 'faro', 'rascacielos', 'molino', 'submarino', 'helicoptero',
    'astronauta', 'superheroe', 'detective', 'mago', 'dinosaurio', 'robot', 'monstruo', 'alien',
    'sandwich', 'panqueque', 'helado', 'pastelito', 'palomitas', 'piruleta', 'dona', 'fresa',
    'futbol', 'baloncesto', 'tenis', 'beisbol', 'patineta', 'tabla de nieve', 'tabla de surf', 'montana rusa',
    'vela', 'reloj', 'espejo', 'trofeo', 'escalera', 'ancla', 'iman', 'bateria',
    'rompecabezas', 'dado', 'globo', 'cometa', 'columpio', 'trampolin', 'tesoro', 'pluma',
    'leon', 'tigre', 'cebra', 'oso panda', 'mono', 'serpiente', 'tortuga', 'tiburon', 'ballena',
    'corona', 'espada', 'escudo', 'puerta', 'ventana', 'silla', 'mesa', 'lampara'
  ],
  de: [
    'apfel', 'banane', 'orange', 'gitarre', 'klavier', 'geige', 'pizza', 'burger',
    'keks', 'kaffee', 'laptop', 'kamera', 'rakete', 'fahrrad', 'flugzeug', 'u-bahn',
    'schloss', 'bruecke', 'berg', 'regenbogen', 'vulkan', 'insel', 'kaktus', 'blume',
    'elefant', 'giraffe', 'pinguin', 'delfin', 'kaenguru', 'schmetterling', 'krake', 'spinne',
    'diamant', 'helm', 'schirm', 'sonnenbrille', 'rucksack', 'taschenlampe', 'teleskop', 'kompass',
    'lagerfeuer', 'wasserfall', 'pyramide', 'leuchtturm', 'wolkenkratzer', 'windmuehle', 'u-boot', 'hubschrauber',
    'astronaut', 'superheld', 'detektiv', 'zauberer', 'dinosaurier', 'roboter', 'monster', 'ausserirdischer',
    'sandwich', 'pfannkuchen', 'eiscreme', 'cupcake', 'popcorn', 'lutscher', 'donut', 'erdbeere',
    'fussball', 'basketball', 'tennis', 'baseball', 'skateboard', 'snowboard', 'surfbrett', 'achterbahn',
    'kerze', 'uhr', 'spiegel', 'pokal', 'leiter', 'anker', 'magnet', 'batterie',
    'puzzle', 'wuerfel', 'ballon', 'drachen', 'schaukel', 'trampolin', 'schatz', 'feder',
    'loewe', 'tiger', 'zebra', 'panda', 'affe', 'schlange', 'schildkroete', 'hai', 'wal',
    'krone', 'schwert', 'schild', 'tuer', 'fenster', 'stuhl', 'tisch', 'lampe'
  ],
  fr: [
    'pomme', 'banane', 'orange', 'guitare', 'piano', 'violon', 'pizza', 'burger',
    'biscuit', 'cafe', 'ordinateur', 'camera', 'fusee', 'velo', 'avion', 'metro',
    'chateau', 'pont', 'montagne', 'arc-en-ciel', 'volcan', 'ile', 'cactus', 'fleur',
    'elephant', 'girafe', 'manchot', 'dauphin', 'kangourou', 'papillon', 'pieuvre', 'araignee',
    'diamant', 'casque', 'parapluie', 'lunettes', 'sac a dos', 'lampe de poche', 'telescope', 'boussole',
    'feu de camp', 'cascade', 'pyramide', 'phare', 'gratte-ciel', 'moulin', 'sous-marin', 'helicoptere',
    'astronaute', 'super-heros', 'detective', 'magicien', 'dinosaure', 'robot', 'monstre', 'extraterrestre',
    'sandwich', 'crepe', 'glace', 'cupcake', 'pop-corn', 'sucette', 'beignet', 'fraise',
    'football', 'basket', 'tennis', 'baseball', 'skateboard', 'snowboard', 'planche de surf', 'montagnes russes',
    'bougie', 'horloge', 'miroir', 'trophee', 'echelle', 'ancre', 'aimant', 'pile',
    'puzzle', 'de', 'ballon', 'cerf-volant', 'balancoire', 'trampoline', 'tresor', 'plume',
    'lion', 'tigre', 'zebre', 'panda', 'singe', 'serpent', 'tortue', 'requin', 'baleine',
    'couronne', 'epee', 'bouclier', 'porte', 'fenetre', 'chaise', 'table', 'lampe'
  ],
  it: [
    'mela', 'banana', 'arancia', 'chitarra', 'pianoforte', 'violino', 'pizza', 'burger',
    'biscotto', 'caffe', 'portatile', 'fotocamera', 'razzo', 'bicicletta', 'aereo', 'metropolitana',
    'castello', 'ponte', 'montagna', 'arcobaleno', 'vulcano', 'isola', 'cactus', 'fiore',
    'elefante', 'giraffa', 'pinguino', 'delfino', 'canguro', 'farfalla', 'polpo', 'ragno',
    'diamante', 'casco', 'ombrello', 'occhiali', 'zaino', 'torcia', 'telescopio', 'bussola',
    'falo', 'cascata', 'piramide', 'faro', 'grattacielo', 'mulino', 'sottomarino', 'elicottero',
    'astronauta', 'supereroe', 'detective', 'mago', 'dinosauro', 'robot', 'mostro', 'alieno',
    'panino', 'pancake', 'gelato', 'cupcake', 'popcorn', 'lecca-lecca', 'ciambella', 'fragola',
    'calcio', 'pallacanestro', 'tennis', 'baseball', 'skateboard', 'snowboard', 'tavola da surf', 'montagne russe',
    'candela', 'orologio', 'specchio', 'trofeo', 'scala', 'ancora', 'magnete', 'batteria',
    'puzzle', 'dado', 'palloncino', 'aquilone', 'altalena', 'trampolino', 'tesoro', 'piuma',
    'leone', 'tigre', 'zebra', 'panda', 'scimmia', 'serpente', 'tartaruga', 'squalo', 'balena',
    'corona', 'spada', 'scudo', 'porta', 'finestra', 'sedia', 'tavolo', 'lampada'
  ],
  pt: [
    'maca', 'banana', 'laranja', 'guitarra', 'piano', 'violino', 'pizza', 'hamburguer',
    'biscoito', 'cafe', 'laptop', 'camera', 'foguete', 'bicicleta', 'aviao', 'metro',
    'castelo', 'ponte', 'montanha', 'arco-iris', 'vulcao', 'ilha', 'cacto', 'flor',
    'elefante', 'girafa', 'pinguim', 'golfinho', 'canguru', 'borboleta', 'polvo', 'aranha',
    'diamante', 'capacete', 'guarda-chuva', 'oculos', 'mochila', 'lanterna', 'telescopio', 'bussola',
    'fogueira', 'cachoeira', 'piramide', 'farol', 'arranha-ceu', 'moinho', 'submarino', 'helicoptero',
    'astronauta', 'super-heroi', 'detetive', 'mago', 'dinossauro', 'robo', 'monstro', 'alienigena',
    'sanduiche', 'panqueca', 'sorvete', 'cupcake', 'pipoca', 'pirulito', 'rosquinha', 'morango',
    'futebol', 'basquete', 'tenis', 'beisebol', 'skate', 'snowboard', 'prancha de surfe', 'montanha-russa',
    'vela', 'relogio', 'espelho', 'trofeu', 'escada', 'ancora', 'ima', 'bateria',
    'quebra-cabeca', 'dado', 'balao', 'pipa', 'balanco', 'trampolim', 'tesouro', 'pena',
    'leao', 'tigre', 'zebra', 'panda', 'macaco', 'cobra', 'tartaruga', 'tubarao', 'baleia',
    'coroa', 'espada', 'escudo', 'porta', 'janela', 'cadeira', 'mesa', 'lampada'
  ],
  hi: [
    'सेब', 'केला', 'संतरा', 'गिटार', 'पियानो', 'सारंगी', 'पिज़्ज़ा', 'बर्गर',
    'बिस्कुट', 'कॉफ़ी', 'लैपटॉप', 'कैमरा', 'रॉकेट', 'साइकिल', 'हवाई जहाज', 'मेट्रो',
    'किला', 'पुल', 'पहाड़', 'इंद्रधनुष', 'ज्वालामुखी', 'द्वीप', 'कैक्टस', 'फूल',
    'हाथी', 'जिराफ़', 'पेंगुइन', 'डॉल्फ़िन', 'कंगारू', 'तितली', 'ऑक्टोपस', 'मकड़ी',
    'हीरा', 'हेलमेट', 'छाता', 'चश्मा', 'बस्ता', 'टॉर्च', 'दूरबीन', 'दिशा सूचक',
    'अलाव', 'झरना', 'पिरामिड', 'प्रकाश स्तंभ', 'गगनचुंबी इमारत', 'पवनचक्की', 'पनडुब्बी', 'हेलीकॉप्टर',
    'अंतरिक्ष यात्री', 'सुपरहीरो', 'जासूस', 'जादूगर', 'डायनासोर', 'रोबोट', 'राक्षस', 'एलियन',
    'सैंडविच', 'चीला', 'आइसक्रीम', 'कपकेक', 'पॉपकॉर्न', 'लॉलीपॉप', 'डोनट', 'स्ट्रॉबेरी',
    'फ़ुटबॉल', 'बास्केटबॉल', 'टेनिस', 'क्रिकेट', 'स्केटबोर्ड', 'पतंग', 'नाव', 'झूला',
    'मोमबत्ती', 'घड़ी', 'आईना', 'ट्रॉफ़ी', 'सीढ़ी', 'लंगर', 'चुंबक', 'बैटरी',
    'पहेली', 'पासा', 'गुब्बारा', 'धनुष', 'तीर', 'कुर्सी', 'मेज़', 'दरवाजा',
    'शेर', 'बाघ', 'ज़ेबरा', 'पांडा', 'बंदर', 'सांप', 'कछुआ', 'शार्क', 'व्हेल',
    'मुकुट', 'तलवार', 'ढाल', 'खिड़की', 'पंखा', 'दीवार', 'किताब', 'दीपक'
  ],
  el: [
    'μήλο', 'μπανάνα', 'πορτοκάλι', 'κιθάρα', 'πιάνο', 'βιολί', 'πίτσα', 'μπέργκερ',
    'μπισκότο', 'καφές', 'φορητός υπολογιστής', 'κάμερα', 'πύραυλος', 'ποδήλατο', 'αεροπλάνο', 'μετρό',
    'κάστρο', 'γέφυρα', 'βουνό', 'ουράνιο τόξο', 'ηφαίστειο', 'νησί', 'κάκτος', 'λουλούδι',
    'ελέφαντας', 'καμηλοπάρδαλη', 'πιγκουίνος', 'δελφίνι', 'καγκουρό', 'πεταλούδα', 'χταπόδι', 'αράχνη',
    'διαμάντι', 'κράνος', 'ομπρέλα', 'γυαλιά ηλίου', 'σακίδιο', 'φακός', 'τηλεσκόπιο', 'πυξίδα',
    'φωτιά', 'καταρράκτης', 'πυραμίδα', 'φάρος', 'ουρανοξύστης', 'ανεμόμυλος', 'υποβρύχιο', 'ελικόπτερο',
    'αστροναύτης', 'υπερήρωας', 'ντετέκτιβ', 'μάγος', 'δεινόσαυρος', 'ρομπότ', 'τέρας', 'εξωγήινος',
    'σάντουιτς', 'τηγανίτα', 'παγωτό', 'κεκάκι', 'ποπ κορν', 'γλειφιτζούρι', 'ντόνατ', 'φράουλα',
    'ποδόσφαιρο', 'μπάσκετ', 'τένις', 'μπέιζμπολ', 'σκέιτμπορντ', 'σανίδα του σερφ', 'ρόλερ κόστερ',
    'κερί', 'ρολόι', 'καθρέφτης', 'τρόπαιο', 'σκάλα', 'άγκυρα', 'μαγνήτης', 'μπαταρία',
    'παζλ', 'ζάρι', 'μπαλόνι', 'χαρταετός', 'κούνια', 'τραμπολίνο', 'θησαυρός', 'φτερό',
    'λιοντάρι', 'τίγρης', 'ζέβρα', 'πάντα', 'μαϊμού', 'φίδι', 'χελώνα', 'καρχαρίας', 'φάλαινα',
    'στέμμα', 'σπαθί', 'ασπίδα', 'πόρτα', 'παράθυρο', 'καρέκλα', 'τραπέζι', 'λάμπα'
  ],
  nl: [
    'appel', 'banaan', 'sinaasappel', 'gitaar', 'piano', 'viool', 'pizza', 'burger',
    'koekje', 'koffie', 'laptop', 'camera', 'raket', 'fiets', 'vliegtuig', 'metro',
    'kasteel', 'brug', 'berg', 'regenboog', 'vulkaan', 'eiland', 'cactus', 'bloem',
    'olifant', 'giraf', 'pinguïn', 'dolfijn', 'kangoeroe', 'vlinder', 'octopus', 'spin',
    'diamant', 'helm', 'paraplu', 'zonnebril', 'rugzak', 'zaklamp', 'telescoop', 'kompas',
    'kampvuur', 'waterval', 'piramide', 'vuurtoren', 'wolkenkrabber', 'windmolen', 'onderzeeër', 'helikopter',
    'astronaut', 'superheld', 'detective', 'tovenaar', 'dinosaurus', 'robot', 'monster', 'buitenaards wezen',
    'sandwich', 'pannenkoek', 'ijsje', 'cupcake', 'popcorn', 'lolly', 'donut', 'aardbei',
    'voetbal', 'basketbal', 'tennis', 'honkbal', 'skateboard', 'snowboard', 'surfplank', 'achtbaan',
    'kaars', 'klok', 'spiegel', 'trofee', 'ladder', 'anker', 'magneet', 'batterij',
    'puzzel', 'dobbelsteen', 'ballon', 'vlieger', 'schommel', 'trampoline', 'schat', 'veer',
    'leeuw', 'tijger', 'zebra', 'panda', 'aap', 'slang', 'schildpad', 'haai', 'walvis',
    'kroon', 'zwaard', 'schild', 'deur', 'raam', 'stoel', 'tafel', 'lamp'
  ],
  pl: [
    'jabłko', 'banan', 'pomarańcza', 'gitara', 'fortepian', 'skrzypce', 'pizza', 'burger',
    'ciastko', 'kawa', 'laptop', 'aparat', 'rakieta', 'rower', 'samolot', 'metro',
    'zamek', 'most', 'góra', 'tęcza', 'wulkan', 'wyspa', 'kaktus', 'kwiat',
    'słoń', 'żyrafa', 'pingwin', 'delfin', 'kangur', 'motyl', 'ośmiornica', 'pająk',
    'diament', 'kask', 'parasol', 'okulary przeciwsłoneczne', 'plecak', 'latarka', 'teleskop', 'kompas',
    'ognisko', 'wodospad', 'piramida', 'latarnia morska', 'drapacz chmur', 'wiatrak', 'łódź podwodna', 'helikopter',
    'astronauta', 'superbohater', 'detektyw', 'czarodziej', 'dinozaur', 'robot', 'potwór', 'kosmita',
    'kanapka', 'naleśnik', 'lody', 'babeczka', 'popcorn', 'lizak', 'pączek', 'truskawka',
    'piłka nożna', 'koszykówka', 'tenis', 'baseball', 'deskorolka', 'deska snowboardowa', 'deska surfingowa', 'kolejka górska',
    'świeca', 'zegar', 'lustro', 'puchar', 'drabina', 'kotwica', 'magnes', 'bateria',
    'puzzle', 'kostka', 'balon', 'latawiec', 'huśtawka', 'trampolina', 'skarb', 'pióro',
    'lew', 'tygrys', 'zebra', 'panda', 'małpa', 'wąż', 'żółw', 'rekin', 'wieloryb',
    'korona', 'miecz', 'tarcza', 'drzwi', 'okno', 'krzesło', 'stół', 'lampa'
  ],
};

export const DEFAULT_WORDS = LANGUAGE_WORD_BANKS.en;

/**
 * Normalizes language codes or country identifiers into supported language keys.
 * Supports all 10 languages: en, hi, el, de, fr, es, it, pt, nl, pl.
 */
export function resolveLanguageKey(langInput?: string): string {
  if (!langInput) return 'en';
  const clean = langInput.trim().toLowerCase();

  // Spanish (es)
  if (['es', 'espanol', 'español', 'spanish', 'ar', 'cl', 'co', 'cr', 'do', 'ec', 'gt', 'hn', 'mx', 'ni', 'pa', 'pe', 'pr', 'py', 'sv', 'uy', 've'].includes(clean)) {
    return 'es';
  }
  // French (fr)
  if (['fr', 'french', 'francais', 'français', 'be', 'ca', 'ci', 'cm', 'sn', 'cd', 'mg', 'ml'].includes(clean)) {
    return 'fr';
  }
  // German (de)
  if (['de', 'german', 'deutsch', 'at', 'li', 'lu', 'ch'].includes(clean)) {
    return 'de';
  }
  // Italian (it)
  if (['it', 'italian', 'italiano', 'sm', 'va'].includes(clean)) {
    return 'it';
  }
  // Portuguese (pt)
  if (['pt', 'portuguese', 'portugues', 'português', 'br', 'ao', 'mz', 'cv', 'gw', 'st', 'tl'].includes(clean)) {
    return 'pt';
  }
  // Hindi (hi)
  if (['hi', 'hindi', 'हिन्दी', 'हिंदी', 'in'].includes(clean)) {
    return 'hi';
  }
  // Greek (el)
  if (['el', 'greek', 'ελληνικά', 'ελληνικα', 'gr', 'cy'].includes(clean)) {
    return 'el';
  }
  // Dutch (nl)
  if (['nl', 'dutch', 'nederlands', 'holland'].includes(clean)) {
    return 'nl';
  }
  // Polish (pl)
  if (['pl', 'polish', 'polski'].includes(clean)) {
    return 'pl';
  }
  // English (en)
  if (['en', 'english', 'us', 'gb', 'uk', 'au', 'nz', 'ie'].includes(clean)) {
    return 'en';
  }

  if (LANGUAGE_WORD_BANKS[clean]) {
    return clean;
  }
  return 'en';
}

/**
 * Returns distinct word choices for the drawer based on wordCount, gameMode, language, and custom words.
 */
export function generateWordChoices(
  wordCount: number = 3,
  gameMode: GameMode = 'normal',
  customWords: string[] = [],
  onlyCustom: boolean = false,
  language: string = 'en'
): string[] {
  const count = Math.min(5, Math.max(1, Math.floor(wordCount) || 3));
  const langKey = resolveLanguageKey(language);
  const baseWords = LANGUAGE_WORD_BANKS[langKey] || DEFAULT_WORDS;

  const seenCustom = new Set<string>();
  const cleanedCustom: string[] = [];
  for (const raw of (customWords || [])) {
    const trimmed = String(raw).trim().replace(/\s+/g, ' ');
    if (trimmed.length >= 1 && trimmed.length <= 32) {
      const lower = trimmed.toLowerCase();
      if (!seenCustom.has(lower)) {
        seenCustom.add(lower);
        cleanedCustom.push(trimmed);
        if (cleanedCustom.length >= 100) break;
      }
    }
  }

  let pool: string[];

  if (onlyCustom && cleanedCustom.length > 0) {
    // Exclusively custom words
    pool = cleanedCustom;
  } else if (cleanedCustom.length > 0) {
    // Mix custom words with selected language word bank
    const customLower = new Set(cleanedCustom.map((w) => w.toLowerCase()));
    const remainingBase = baseWords.filter((w) => !customLower.has(w.toLowerCase()));
    pool = [...cleanedCustom, ...remainingBase];
  } else {
    // Pure language word bank
    pool = baseWords;
  }

  // Combination Mode: Generate pairs of different words e.g. "APPLE + TREE"
  if (gameMode === 'combination') {
    const combinations: string[] = [];
    const usedCombos = new Set<string>();
    const poolCopy = [...pool].sort(() => 0.5 - Math.random());

    let attempts = 0;
    while (combinations.length < count && attempts < 100) {
      attempts++;
      const idx1 = Math.floor(Math.random() * poolCopy.length);
      let idx2 = Math.floor(Math.random() * poolCopy.length);

      // Ensure distinct words in combination
      if (idx1 === idx2 && poolCopy.length > 1) {
        idx2 = (idx1 + 1) % poolCopy.length;
      }

      const w1 = poolCopy[idx1].toUpperCase();
      const w2 = poolCopy[idx2].toUpperCase();

      if (w1 === w2 && poolCopy.length > 1) continue;

      const comboKey = [w1, w2].sort().join('+');
      if (usedCombos.has(comboKey) && attempts < 80) continue;

      usedCombos.add(comboKey);
      combinations.push(`${w1} + ${w2}`);
    }

    // Fallback if small custom pool
    while (combinations.length < count) {
      const fallbackW1 = (pool[combinations.length % pool.length] || baseWords[0]).toUpperCase();
      const fallbackW2 = (pool[(combinations.length + 1) % pool.length] || baseWords[1] || 'STAR').toUpperCase();
      combinations.push(`${fallbackW1} + ${fallbackW2}`);
    }

    return combinations.slice(0, count);
  }

  // Normal & Hidden Mode: Pick unique single words
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected: string[] = [];
  const selectedUpper = new Set<string>();

  for (const word of shuffled) {
    const upper = word.toUpperCase();
    if (!selectedUpper.has(upper)) {
      selectedUpper.add(upper);
      selected.push(upper);
    }
    if (selected.length >= count) break;
  }

  // Ensure count is satisfied even if pool was very small
  let fallbackIndex = 0;
  while (selected.length < count) {
    const fallback = (pool[fallbackIndex % pool.length] || baseWords[fallbackIndex % baseWords.length]).toUpperCase();
    if (!selected.includes(fallback)) {
      selected.push(fallback);
    } else {
      selected.push(`${fallback} #${selected.length + 1}`);
    }
    fallbackIndex++;
  }

  return selected.slice(0, count);
}

/**
 * Backward compatibility helper for 3 word choices.
 */
export function getThreeWordChoices(
  customWords: string[] = [],
  onlyCustom: boolean = false,
  language: string = 'en'
): string[] {
  return generateWordChoices(3, 'normal', customWords, onlyCustom, language);
}
