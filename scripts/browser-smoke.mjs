import assert from 'node:assert/strict';import fs from 'node:fs';import {chromium} from 'playwright';import AxeBuilder from '@axe-core/playwright';
const base=process.env.SITE_URL||'http://127.0.0.1:8765';fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--renderer-process-limit=2']}),fail=[];
try{
for(const width of [320,390,768,1440]){
const context=await browser.newContext({viewport:{width,height:850},acceptDownloads:true});const page=await context.newPage();
const urls=width===390?['/','/tablet/','/assembly/','/library/','/library/book-001/','/library/book-002/','/library/book-003/','/library/book-004/','/doubt/book-001/','/doubt/book-002/','/doubt/book-003/','/trials/','/trials/trial-002/','/trials/trial-003/','/invite/','/submit/','/contribute/','/challenge/','/about/','/history/','/404.html']:['/','/assembly/','/submit/','/library/','/library/book-004/','/contribute/'];
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const url of urls){errors.length=0;
const response=await page.goto(base+url,{waitUntil:'domcontentloaded'});try{
assert.equal(response.status(),200,url+' HTTP code');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,url+' horizontal overflow @'+width);
assert.equal(errors.length,0,url+' JS errors: '+errors.join(';'));
}catch(e){fail.push(e.message)}
if(width===390&&['/','/assembly/','/submit/','/contribute/','/library/book-004/'].includes(url)){const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();if(results.violations.length)fail.push(url+' axe: '+results.violations.map(x=>x.id+' ('+x.nodes.length+')').join(', '));}
if(url==='/'||url==='/submit/')await page.screenshot({path:'test-results/'+url.replace(/\W/g,'-')+'-'+width+'.png',fullPage:true});
}
if(width===390){await page.goto(base+'/');await page.keyboard.press('Tab');if(!await page.locator('.skip').evaluate(el=>el===document.activeElement))fail.push('Skip link not first keyboard stop');
await page.goto(base+'/submit/');if(!await page.locator('#send-intake').isDisabled())fail.push('Direct intake enabled without configured backend');
await page.locator('[name="title"]').fill('Test philosophy');await page.locator('[name="author"]').fill('Test operator');await page.locator('[name="body"]').fill('An example philosophical submission with sufficient explanatory text and careful uncertainty.');await page.locator('[name="consent"]').check();
const download=page.waitForEvent('download');await page.locator('#export-json').click();if((await download).suggestedFilename()!=='tabletzero-contribution.json')fail.push('JSON export missing');
await page.goto(base+'/library/ethics-without-a-tomorrow/');await page.waitForURL(base+'/library/book-004/');
const oldSource=await page.request.get(base+'/library/ethics-without-a-tomorrow.md');if(!oldSource.ok()||!(await oldSource.text()).includes('https://tabletzero.org/books/book-004.md'))fail.push('Previous Book Markdown URL missing');
for(const file of ['llms.txt','llms-full.txt','AGENTS.md','CLAUDE.md']){const response=await page.request.get(base+'/'+file);if(!response.ok())fail.push(file+' not readable');const text=await response.text();if(file==='llms-full.txt'&&!text.trimEnd().endsWith('END OF TABLET ZERO FULL TEXT'))fail.push('Full-text edition incomplete')}
}
await context.close();
}
}finally{await browser.close()}
if(fail.length){console.error(fail.join('\n'));process.exitCode=1}else console.log('PASS: browser smoke, responsiveness, a11y, keyboard, export');
