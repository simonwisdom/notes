const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Copy your existing slugify and generateSlug functions
function slugify(text) {
  /* Your existing slugify implementation */
}

function generateSlug(content) {
  if (!content) return 'post';
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/);
  const firstWords = words.slice(0, 12).join(' ');
  const truncated = firstWords.length > 100 ? firstWords.slice(0, 100) : firstWords;
  const baseSlug = slugify(truncated);
  if (baseSlug.length < 5) {
    const timestamp = new Date().toISOString().slice(0, 10);
    return `post-${timestamp}`;
  }
  const timestamp = Date.now().toString(36).slice(-6);
  return `${baseSlug}-${timestamp}`;
}

const filePath = process.argv[2];
const postsDir = path.join(process.cwd(), 'src/posts');

if (!filePath.startsWith(postsDir)) {
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');
const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

if (!frontmatterMatch) process.exit(0);

const frontmatter = yaml.load(frontmatterMatch[1]);
const { title, date } = frontmatter;

const dateStr = new Date(date || new Date()).toISOString().split('T')[0];
const slug = title ? slugify(title) : generateSlug(content.split('---')[2]);

const newFileName = `${dateStr}-${slug}.md`;
const newPath = path.join(postsDir, newFileName);

if (filePath !== newPath) {
  fs.renameSync(filePath, newPath);
  console.log(`Renamed: ${path.basename(filePath)} -> ${newFileName}`);
}