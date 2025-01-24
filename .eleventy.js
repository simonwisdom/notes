const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

// Robust slugify function
function slugify(text) {
  if (!text) return '';
  
  return text
    // Convert to lowercase
    .toLowerCase()
    // Normalize unicode characters
    .normalize('NFKD')
    // Remove diacritics/accents
    .replace(/[\u0300-\u036f]/g, '')
    // Replace smart quotes and other special quotes
    .replace(/['']/g, '')
    .replace(/[""]/g, '')
    // Replace ampersands, slashes, and other common characters
    .replace(/&/g, ' and ')
    .replace(/\//g, ' ')
    .replace(/\\/g, ' ')
    // Remove all other punctuation and symbols
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g, ' ')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim()
    // Replace spaces with hyphens
    .replace(/\s/g, '-')
    // Remove any non-alphanumeric characters (except hyphens)
    .replace(/[^\w-]+/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove trailing hyphens
    .replace(/^-+|-+$/g, '');
}

module.exports = function(eleventyConfig) {
  // Markdown configuration
  const markdownOptions = {
    html: true,
    breaks: true,
    linkify: true
  };
  const markdownLib = markdownIt(markdownOptions).use(markdownItAnchor);
  eleventyConfig.setLibrary("md", markdownLib);

  // Pass through files
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // Get first paragraph for excerpts
  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return '';
    const firstParagraph = content.split('\n\n')[0];
    return firstParagraph;
  });

  // Generate slug from content
  eleventyConfig.addFilter("generateSlug", (content) => {
    if (!content) return 'post';

    // Strip HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');

    // Get first ~12 words or 100 characters, whichever is shorter
    const words = plainText.trim().split(/\s+/);
    const firstWords = words.slice(0, 12).join(' ');
    const truncated = firstWords.length > 100 ? firstWords.slice(0, 100) : firstWords;
    
    // Generate base slug
    const baseSlug = slugify(truncated);
    
    // If slug is too short, use a fallback
    if (baseSlug.length < 5) {
      const timestamp = new Date().toISOString().slice(0, 10);
      return `post-${timestamp}`;
    }
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36).slice(-6);
    return `${baseSlug}-${timestamp}`;
  });

  // Format date as "Jan. 18, 2025"
  eleventyConfig.addFilter("formatDate", (date) => {
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  });

  // Format time as "6:24 pm"
  eleventyConfig.addFilter("formatTime", (date) => {
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  });

  // Format tags as comma-separated list
  eleventyConfig.addFilter("formatTags", (tags) => {
    if (!tags) return '';
    return tags.join(', ');
  });

  // Collection: All posts sorted by date
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Collection: Tags
  eleventyConfig.addCollection("tagList", function(collection) {
    const tags = new Set();
    collection.getAll().forEach(item => {
      if (!item.data.tags) return;
      item.data.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  // Create a nojekyll file to prevent GitHub Pages from trying to build with Jekyll
  eleventyConfig.addPassthroughCopy({
    ".nojekyll": ".nojekyll"
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
}; 