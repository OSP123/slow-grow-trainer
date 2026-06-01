import * as fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import path from 'path';

async function testParse() {
  const dataBuffer = fs.readFileSync(path.join(__dirname, '../public/munitorum_manual.pdf'));
  const data = await pdf(dataBuffer);
  
  const lines = data.text.split('\n');
  console.log('Total lines:', lines.length);
  console.log('First 200 lines:');
  console.log(lines.slice(0, 200).join('\n'));
}

testParse().catch(console.error);
