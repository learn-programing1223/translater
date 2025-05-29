export function detectLanguage(text: string): string {
  // Clean the text and convert to lowercase for Latin script detection
  const cleanText = text.toLowerCase().trim();
  
  // Enhanced Unicode script detection (check these first - most reliable)
  const scriptPatterns = {
    // East Asian Scripts
    'zh': /[\u4e00-\u9fff]/,          // Chinese (CJK Unified Ideographs)
    'ja': /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/, // Japanese (Hiragana + Katakana + Kanji)
    'ko': /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/, // Korean (Hangul)
    
    // Middle Eastern Scripts  
    'ar': /[\u0600-\u06ff\u0750-\u077f]/,  // Arabic + Arabic Supplement
    'fa': /[\u0600-\u06ff\u0750-\u077f]/,  // Persian (uses Arabic script)
    'ur': /[\u0600-\u06ff\u0750-\u077f]/,  // Urdu (uses Arabic script)
    'he': /[\u0590-\u05ff]/,              // Hebrew
    
    // Indian Subcontinent Scripts
    'hi': /[\u0900-\u097f]/,              // Hindi (Devanagari)
    'bn': /[\u0980-\u09ff]/,              // Bengali
    'gu': /[\u0a80-\u0aff]/,              // Gujarati
    'pa': /[\u0a00-\u0a7f]/,              // Punjabi (Gurmukhi)
    'ta': /[\u0b80-\u0bff]/,              // Tamil
    'te': /[\u0c00-\u0c7f]/,              // Telugu
    'kn': /[\u0c80-\u0cff]/,              // Kannada
    'ml': /[\u0d00-\u0d7f]/,              // Malayalam
    
    // Southeast Asian Scripts
    'th': /[\u0e00-\u0e7f]/,              // Thai
    'lo': /[\u0e80-\u0eff]/,              // Lao
    'my': /[\u1000-\u109f]/,              // Myanmar (Burmese)
    'km': /[\u1780-\u17ff]/,              // Khmer (Cambodian)
    
    // Other Scripts
    'ru': /[\u0400-\u04ff]/,              // Cyrillic (Russian, etc.)
    'uk': /[\u0400-\u04ff]/,              // Ukrainian (Cyrillic)
    'bg': /[\u0400-\u04ff]/,              // Bulgarian (Cyrillic)
    'sr': /[\u0400-\u04ff]/,              // Serbian (Cyrillic)
    'mk': /[\u0400-\u04ff]/,              // Macedonian (Cyrillic)
    'el': /[\u0370-\u03ff]/,              // Greek
    'am': /[\u1200-\u137f]/,              // Amharic (Ethiopic)
    'ka': /[\u10a0-\u10ff]/,              // Georgian
    'hy': /[\u0530-\u058f]/,              // Armenian
  };
  
  // Check script patterns first (most reliable for non-Latin)
  for (const [lang, pattern] of Object.entries(scriptPatterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  // Enhanced Latin script detection with better patterns
  const latinPatterns = {
    // Romance Languages
    'es': /\b(dónde|está|cuánto|cuesta|precio|ubicación|pasillo|¿|¡|el|la|los|las|qué|cómo|cuándo|por|para|con|sin|muy|más|menos|bien|mal|sí|no|gracias|hola|adiós)\b/i,
    'fr': /\b(où|est|combien|coûte|prix|emplacement|allée|le|la|les|que|comment|quand|pour|avec|sans|très|plus|moins|bien|mal|oui|non|merci|bonjour|au revoir|ç|à|è|é|ê)\b/i,
    'pt': /\b(onde|está|quanto|custa|preço|localização|corredor|o|a|os|as|que|como|quando|para|com|sem|muito|mais|menos|bem|mal|sim|não|obrigado|olá|tchau|ã|õ|ç)\b/i,
    'it': /\b(dove|è|quanto|costa|prezzo|posizione|corridoio|il|la|i|le|che|come|quando|per|con|senza|molto|più|meno|bene|male|sì|no|grazie|ciao|perché)\b/i,
    'ro': /\b(unde|este|cât|costă|preț|locație|culoar|că|cum|când|pentru|cu|fără|foarte|mai|puțin|bine|rău|da|nu|mulțumesc|salut|la revedere)\b/i,
    
    // Germanic Languages  
    'de': /\b(wo|ist|wieviel|kostet|preis|standort|gang|der|die|das|wie|wann|was|für|mit|ohne|sehr|mehr|weniger|gut|schlecht|ja|nein|danke|hallo|auf wiedersehen|ä|ö|ü|ß)\b/i,
    'nl': /\b(waar|is|hoeveel|kost|prijs|locatie|gang|de|het|een|hoe|wanneer|wat|voor|met|zonder|zeer|meer|minder|goed|slecht|ja|nee|dank je|hallo|tot ziens)\b/i,
    'sv': /\b(var|är|hur mycket|kostar|pris|plats|gång|den|det|ett|hur|när|vad|för|med|utan|mycket|mer|mindre|bra|dålig|ja|nej|tack|hej|hej då|å|ä|ö)\b/i,
    'no': /\b(hvor|er|hvor mye|koster|pris|sted|gang|den|det|en|et|hvordan|når|hva|for|med|uten|meget|mer|mindre|bra|dårlig|ja|nei|takk|hei|ha det|å|ø)\b/i,
    'da': /\b(hvor|er|hvor meget|koster|pris|sted|gang|den|det|en|et|hvordan|hvornår|hvad|til|med|uden|meget|mere|mindre|godt|dårligt|ja|nej|tak|hej|farvel|å|ø)\b/i,
    
    // Slavic Languages (Latin script)
    'pl': /\b(gdzie|jest|ile|kosztuje|cena|lokalizacja|korytarz|jak|kiedy|co|dla|z|bez|bardzo|więcej|mniej|dobrze|źle|tak|nie|dziękuję|cześć|do widzenia|ą|ć|ę|ł|ń|ó|ś|ź|ż)\b/i,
    'cs': /\b(kde|je|kolik|stojí|cena|místo|chodba|jak|kdy|co|pro|s|bez|velmi|více|méně|dobře|špatně|ano|ne|děkuji|ahoj|na shledanou|á|č|ď|é|ě|í|ň|ó|ř|š|ť|ú|ů|ý|ž)\b/i,
    'sk': /\b(kde|je|koľko|stojí|cena|miesto|chodba|ako|kedy|čo|pre|s|bez|veľmi|viac|menej|dobre|zle|áno|nie|ďakujem|ahoj|dovidenia|á|ä|č|ď|é|í|ĺ|ľ|ň|ó|ô|ŕ|š|ť|ú|ý|ž)\b/i,
    'hr': /\b(gdje|je|koliko|košta|cijena|lokacija|hodnik|kako|kada|što|za|s|bez|vrlo|više|manje|dobro|loše|da|ne|hvala|bok|doviđenja|č|ć|đ|š|ž)\b/i,
    
    // Other European Languages
    'fi': /\b(missä|on|paljonko|maksaa|hinta|sijainti|käytävä|miten|milloin|mitä|varten|kanssa|ilman|hyvin|enemmän|vähemmän|hyvä|huono|kyllä|ei|kiitos|hei|näkemiin|ä|ö|å)\b/i,
    'hu': /\b(hol|van|mennyibe|kerül|ár|helyszín|folyosó|hogyan|mikor|mit|számára|val|nélkül|nagyon|több|kevesebb|jó|rossz|igen|nem|köszönöm|szia|viszlát|á|é|í|ó|ö|ő|ú|ü|ű)\b/i,
    'et': /\b(kus|on|kui palju|maksab|hind|asukoht|koridor|kuidas|millal|mida|jaoks|koos|ilma|väga|rohkem|vähem|hea|halb|jah|ei|aitäh|tere|nägemist|ä|ö|ü|õ)\b/i,
    'lv': /\b(kur|ir|cik|maksā|cena|atrašanās vieta|koridors|kā|kad|ko|priekš|ar|bez|ļoti|vairāk|mazāk|labi|slikti|jā|nē|paldies|sveiki|uz redzēšanos|ā|č|ē|ģ|ī|ķ|ļ|ņ|š|ū|ž)\b/i,
    'lt': /\b(kur|yra|kiek|kainuoja|kaina|vieta|koridorius|kaip|kada|ką|dėl|su|be|labai|daugiau|mažiau|gerai|blogai|taip|ne|ačiū|labas|iki|ą|č|ę|ė|į|š|ų|ū|ž)\b/i,
    'sl': /\b(kje|je|koliko|stane|cena|lokacija|hodnik|kako|kdaj|kaj|za|z|brez|zelo|več|manj|dobro|slabo|da|ne|hvala|pozdravljeni|nasvidenje|č|š|ž)\b/i,
  };
  
  // Check Latin script patterns
  for (const [lang, pattern] of Object.entries(latinPatterns)) {
    if (pattern.test(cleanText)) {
      return lang;
    }
  }
  
  // Fallback: detect based on character frequency for scripts we might have missed
  const scriptCounts = {
    latin: (text.match(/[a-zA-Z]/g) || []).length,
    cyrillic: (text.match(/[\u0400-\u04ff]/g) || []).length,
    arabic: (text.match(/[\u0600-\u06ff]/g) || []).length,
    cjk: (text.match(/[\u4e00-\u9fff]/g) || []).length,
    devanagari: (text.match(/[\u0900-\u097f]/g) || []).length,
  };
  
  const maxScript = Object.entries(scriptCounts).reduce((a, b) => scriptCounts[a[0] as keyof typeof scriptCounts] > scriptCounts[b[0] as keyof typeof scriptCounts] ? a : b);
  
  if (maxScript[1] > 0) {
    switch (maxScript[0]) {
      case 'cyrillic': return 'ru';
      case 'arabic': return 'ar';  
      case 'cjk': return 'zh';
      case 'devanagari': return 'hi';
    }
  }
  
  return 'en'; // Default to English
}