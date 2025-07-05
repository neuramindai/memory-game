import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  outputFile: 'repository_contents.txt',
  ignoreDirs: [
    'node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 
    'coverage', '.cache', 'tmp', 'temp', '.vscode', '.idea',
    'vendor', 'bower_components', '__pycache__', '.pytest_cache',
    'venv', 'env', '.env', 'logs', '.DS_Store',
    'data'
  ],
  ignoreFiles: [
    '.DS_Store', 'Thumbs.db', '*.log', '*.lock', '.env*',
    '*.min.js', '*.min.css', '*.map', 
    'repo-script.cjs', 'repo-to-text.cjs', 'repo-to-text.js', 'repository_contents.txt'
  ],
  binaryExtensions: [
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
    '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
    '.mp3', '.mp4', '.avi', '.mov', '.wmv',
    '.exe', '.dll', '.so', '.dylib',
    '.woff', '.woff2', '.ttf', '.eot'
  ],
  maxFileSize: 1024 * 1024, // 1MB - skip files larger than this
  encoding: 'utf8'
};

// Tree structure for organizing folders
class FileTree {
  constructor() {
    this.root = { name: '.', type: 'dir', children: [], path: '.' };
  }

  addPath(filePath, type) {
    const parts = filePath.split(path.sep);
    let current = this.root;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;
      
      if (!isLastPart || type === 'dir') {
        let child = current.children.find(c => c.name === part && c.type === 'dir');
        if (!child) {
          child = { name: part, type: 'dir', children: [], path: parts.slice(0, i + 1).join(path.sep) };
          current.children.push(child);
        }
        current = child;
      } else {
        current.children.push({ 
          name: part, 
          type: 'file', 
          extension: path.extname(part),
          path: filePath 
        });
      }
    }
  }

  toString(node = this.root, prefix = '', isLast = true) {
    let result = '';
    
    if (node.name !== '.') {
      result += prefix + (isLast ? '└── ' : '├── ') + node.name;
      if (node.type === 'file' && node.extension) {
        result += ` (${node.extension})`;
      }
      result += '\n';
    }
    
    if (node.children) {
      const sorted = [...node.children].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      
      sorted.forEach((child, index) => {
        const childPrefix = node.name === '.' ? '' : prefix + (isLast ? '    ' : '│   ');
        const childIsLast = index === sorted.length - 1;
        result += this.toString(child, childPrefix, childIsLast);
      });
    }
    
    return result;
  }
}

// Helper functions
function shouldIgnore(filePath, stats) {
  const basename = path.basename(filePath);
  
  // Check if it's a directory that should be ignored
  if (stats.isDirectory() && CONFIG.ignoreDirs.some(dir => basename === dir)) {
    return true;
  }
  
  // Check if it's a file that should be ignored
  if (stats.isFile()) {
    // Check ignore patterns
    if (CONFIG.ignoreFiles.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(basename);
      }
      return basename === pattern;
    })) {
      return true;
    }
    
    // Check binary extensions
    const ext = path.extname(filePath).toLowerCase();
    if (CONFIG.binaryExtensions.includes(ext)) {
      return true;
    }
    
    // Check file size
    if (stats.size > CONFIG.maxFileSize) {
      return true;
    }
  }
  
  return false;
}

async function scanDirectory(dirPath, fileTree, basePath) {
  try {
    const entries = await fs.readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const relativePath = path.relative(basePath, fullPath);
      
      try {
        const stats = await fs.stat(fullPath);
        
        if (shouldIgnore(fullPath, stats)) {
          continue;
        }
        
        if (stats.isDirectory()) {
          fileTree.addPath(relativePath, 'dir');
          await scanDirectory(fullPath, fileTree, basePath);
        } else if (stats.isFile()) {
          fileTree.addPath(relativePath, 'file');
        }
      } catch (err) {
        console.error(`Error accessing ${fullPath}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dirPath}: ${err.message}`);
  }
}

async function writeFileContents(stream, dirPath, fileTree, basePath) {
  const processFile = async (filePath) => {
    try {
      const content = await fs.readFile(filePath, CONFIG.encoding);
      const relativePath = path.relative(basePath, filePath);
      
      // Write file header
      stream.write('\n');
      stream.write('═'.repeat(80) + '\n');
      stream.write(`FILE: ${relativePath}\n`);
      stream.write('═'.repeat(80) + '\n');
      stream.write('\n');
      
      // Write content
      stream.write(content);
      stream.write('\n');
      
      return true;
    } catch (err) {
      console.error(`Error reading file ${filePath}: ${err.message}`);
      return false;
    }
  };

  const processDirectory = async (node, currentPath = basePath) => {
    if (node.children) {
      for (const child of node.children) {
        const childPath = path.join(currentPath, child.name);
        
        if (child.type === 'file') {
          await processFile(childPath);
        } else if (child.type === 'dir') {
          await processDirectory(child, childPath);
        }
      }
    }
  };

  await processDirectory(fileTree.root);
}

async function main() {
  const startTime = Date.now();
  const basePath = process.cwd();
  
  console.log('🔍 Scanning repository structure...');
  
  // Create file tree
  const fileTree = new FileTree();
  await scanDirectory(basePath, fileTree, basePath);
  
  // Count files
  let fileCount = 0;
  const countFiles = (node) => {
    if (node.type === 'file') fileCount++;
    if (node.children) node.children.forEach(countFiles);
  };
  countFiles(fileTree.root);
  
  console.log(`📁 Found ${fileCount} files to process`);
  console.log(`📝 Writing to ${CONFIG.outputFile}...`);
  
  // Create write stream
  const outputPath = path.join(basePath, CONFIG.outputFile);
  const stream = createWriteStream(outputPath);
  
  // Write header
  stream.write('REPOSITORY STRUCTURE AND CONTENTS\n');
  stream.write('Generated on: ' + new Date().toISOString() + '\n');
  stream.write('Total files: ' + fileCount + '\n');
  stream.write('=' .repeat(80) + '\n\n');
  
  // Write structure summary
  stream.write('FOLDER STRUCTURE:\n');
  stream.write('-'.repeat(80) + '\n');
  stream.write(fileTree.toString());
  stream.write('\n');
  
  // Write file contents
  stream.write('FILE CONTENTS:\n');
  stream.write('='.repeat(80) + '\n');
  
  await writeFileContents(stream, basePath, fileTree, basePath);
  
  // Close stream
  stream.end();
  
  return new Promise((resolve) => {
    stream.on('finish', () => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const stats = fs.stat(outputPath);
      
      console.log(`✅ Repository packaged successfully!`);
      console.log(`📄 Output file: ${CONFIG.outputFile}`);
      console.log(`⏱️  Time taken: ${duration} seconds`);
      console.log(`📊 Files processed: ${fileCount}`);
      
      resolve();
    });
  });
}

// Run the script
main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});