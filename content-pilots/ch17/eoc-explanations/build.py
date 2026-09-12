from pathlib import Path
import re,json,html
p=Path(__file__).parent
s=(p/'ch17-eoc-friendly-explanations.md').read_text()
chunks=re.split(r'^## (17\.\d+) — (.+)\n',s,flags=re.M)
questions=[]
for i in range(1,len(chunks),3):
    n,title,body=chunks[i:i+3]
    body=body.split('\n---\n')[0].strip()
    questions.append({'number':n,'title':title,'explanation_markdown':body})
assert [q['number'] for q in questions]==['17.'+str(n) for n in range(35,80)]
expected={35:['A('+x+')' for x in 'abcde']+['B('+x+')' for x in 'abcde'],36:list('abcd'),37:list('abcdefghijkl'),38:list('abcd'),39:list('abc'),40:list('abcdef'),41:list('abcd'),42:list('abcde'),43:list('abcdef'),45:list('abcd'),49:list('ABCDEFGHIJK'),50:list('ABC'),56:list('abc'),57:list('abc'),59:list('ab'),60:['a','b'],61:list('abc'),63:list('abcd'),64:list('abc'),65:list('abc'),66:list('ab'),67:list('ab'),69:list('AB'),70:list('EF'),76:list('XY'),77:list('NP')}
for n,labels in expected.items():
    b=questions[n-35]['explanation_markdown']
    for label in labels:
        needle=label if n==35 else '('+label+')' if label.islower() else label
        assert '**'+needle in b,(n,label)
(p/'ch17-eoc-friendly-explanations.json').write_text(json.dumps({'chapter':17,'status':'editing draft','primary_source':'Uploaded Smith chapter 17 solutions manual','scope':'EOC 17.35–17.79; explanations to accompany question drawings','questions':questions},ensure_ascii=False,indent=2))
def inline(t):
    t=html.escape(t)
    t=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',t)
    t=re.sub(r'\*(.+?)\*',r'<em>\1</em>',t)
    return t
out=[];ul=False
for line in s.splitlines():
    if not line.strip():
        if ul:out.append('</ul>');ul=False
        continue
    if line.startswith('- ') or re.match(r'^\d\. ',line):
        if not ul:out.append('<ul>');ul=True
        out.append('<li>'+inline(re.sub(r'^(?:- |\d\. )','',line))+'</li>');continue
    if ul:out.append('</ul>');ul=False
    if line=='---':out.append('<hr>');continue
    m=re.match(r'^(#{1,3}) (.*)',line)
    if m:
        level=len(m[1]);txt=m[2];ident=''
        if level==2:ident=' id="q'+txt.split(' ')[0]+'"'
        out.append(f'<h{level}{ident}>{inline(txt)}</h{level}>')
    else:out.append('<p>'+inline(line)+'</p>')
nav=' '.join(f'<a href="#q{q["number"]}">{q["number"]}</a>' for q in questions)
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Smith Chapter 17 — Friendly EOC explanations</title><style>
body{margin:0;background:#f5f6f4;color:#202c31;font:18px/1.65 system-ui,sans-serif}main{max-width:850px;margin:auto;padding:36px 28px 80px;background:white}h1{font-size:2rem;line-height:1.2;color:#125957}h2{font-size:1.4rem;line-height:1.35;margin-top:2.4em;border-top:2px solid #d9e6e3;padding-top:1em;color:#125957;scroll-margin-top:20px}h3{font-size:1.1rem}li{margin:.7em 0;padding-left:.2em}ul{padding-left:1.25em}strong{font-weight:700}hr{border:0;border-top:1px solid #d9e6e3;margin:2em 0}nav{max-width:850px;margin:auto;padding:20px 28px;background:#e9f1ee;font-size:14px;line-height:2.5}nav a{display:inline-block;margin-right:12px;color:#155957}p:has(>em:only-child){font-size:13px;color:#586b70}@media print{body{background:white;font-size:11pt}main{padding:0;max-width:none}nav{display:none}h2{break-after:avoid}li{break-inside:avoid}p{orphans:3;widows:3}}
</style><nav aria-label="Jump to question">'''+nav+'</nav><main>'+''.join(out)+'</main></html>'
(p/'ch17-eoc-friendly-explanations.html').write_text(page)
(p/'review-notes.md').write_text('''# Chapter 17 EOC draft checks

- Scope: all 45 parent questions, 17.35–17.79.
- Sources: uploaded chapter/questions PDF pages 75–88 and solutions manual printed pages 17–14 through 17–30.
- Original question and solution drawings were visually inspected during drafting; extracted text alone was insufficient for structures.
- Automated coverage check confirms contiguous parent questions and explicitly lettered subparts listed in the build script, including the A/B matrix in 17.35 and A–K in 17.49.
- Text uses original paraphrases, not copied solution paragraphs.
- Wording distinguishes ketone/aldehyde reduction, ester cleavage and double addition, conjugate addition, and the special cyclic-amide product in 17.79.
- CBS outcomes are limited to the illustrated substrate and orientation; no universal reagent-label/product-label inversion rule is asserted.
- No numerical success rate is claimed for drawing shortcuts.
- Complete structures, stereochemical drawings and curved-arrow mechanisms are still to be drawn by the student; these are companion explanations, not a graphical answer key.
- The No Fear rewrite remains paused for the user's edits.
- Long synthesis routes follow the manual. These are textbook routes, not independently validated laboratory procedures.
''')
print(json.dumps({'questions':len(questions),'words':len(s.split()),'bulleted_entries':len(re.findall(r'^- \*\*',s,re.M)),'coverage':'pass'}))
