import fs from 'node:fs';
import { visualPolicy } from '../src/data/policyData.js';
const source=fs.readFileSync(new URL('../src/AudioPresentation.jsx',import.meta.url),'utf8');
const start=source.indexOf('function clean('), end=source.indexOf('function chooseVoices(');
const makeConversation=new Function(source.slice(start,end)+'\nreturn makeConversation;')();
fs.writeFileSync(new URL('./audio-script.json',import.meta.url),JSON.stringify(visualPolicy.categories.map(makeConversation),null,2));
