/**
 * Lightweight story generator for memory-assisted graphical passwords.
 * Converts a sequence of image names into a humorous sentence.
 * 
 * @param {string[]} sequenceNames - Array of image names in order (e.g., ["Tiger", "Moon", "Cookie", "Taxi"])
 * @returns {string} - A short, generated story sentence.
 */
export const generateStory = (sequenceNames) => {
  if (!sequenceNames || sequenceNames.length < 3) return "";

  const startTemplates = [
    "I saw a {image1}",
    "A {image1} appeared",
    "Once upon a time, a {image1}",
    "Legend says a {image1}"
  ];

  const middleTemplates = [
    "then it found a {image2}",
    "and suddenly a {image2} appeared",
    "next it grabbed a {image2}",
    "while holding a {image2}",
    "dancing with a {image2}"
  ];

  const genericConnectors = [
    "which led to a {image}",
    "passing by a {image}",
    "under the {image}",
    "near a {image}",
    "while watching a {image}"
  ];

  const endTemplates = [
    "before jumping into a {imageN}",
    "and finally reached a {imageN}",
    "before riding a {imageN}",
    "and lived happily with a {imageN}",
    "as it escaped on a {imageN}"
  ];

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const first = sequenceNames[0].toLowerCase();
  const last = sequenceNames[sequenceNames.length - 1].toLowerCase();
  const middleOnes = sequenceNames.slice(1, -1);

  let story = getRandom(startTemplates).replace("{image1}", first);

  // If we have more than 2 images, handle the middle ones
  if (middleOnes.length > 0) {
    // Treat the first middle one specially with middleTemplates
    story += " " + getRandom(middleTemplates).replace("{image2}", middleOnes[0].toLowerCase());

    // If there are more middle ones (for 4 or 5 image sequences)
    for (let i = 1; i < middleOnes.length; i++) {
        story += " " + getRandom(genericConnectors).replace("{image}", middleOnes[i].toLowerCase());
    }
  }

  story += " " + getRandom(endTemplates).replace("{imageN}", last) + ".";

  return story;
};
