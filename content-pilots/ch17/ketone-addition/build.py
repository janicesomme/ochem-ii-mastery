from pathlib import Path
import json,re,html,fitz
from drawings import mol,line,text,INK
from reagents import incoming
P=Path(__file__).parent
AMBER='#b87800'
def product(kind,n,size,cue=False,neighbors=False):
 if kind=='aldehyde':
  cx,cy=205+(n-1)*21,117
  s=mol(kind,n,True,cue)
  new=(cx+42,cy+23);s+=line((cx,cy),new,3.5,AMBER if cue else INK)
  if size==2:s+=line(new,(cx+84,cy))
  return s
 # Same ketone skeleton, with both existing carbon connections retained.
 idx=(n-1)//2;start=205-((n-1)*42)/2
 chain=[(start+i*42,117 if i%2==idx%2 else 140) for i in range(n)]
 cx,cy=chain[idx];assert chain[idx-1][1]>cy and chain[idx+1][1]>cy
 s=''.join(line(a,b) for a,b in zip(chain,chain[1:]))
 # Spread HO and the incoming group outward above the peak; no overlap with the old chain.
 s+=line((cx,cy),(cx-25,cy-25))+text(cx-41,cy-31,'HO',23)
 new=(cx+25,cy-42);assert new[1]<cy
 s+=line((cx,cy),new,3.5,AMBER if cue else INK)
 if size==2:s+=line(new,(new[0]+48,new[1]))
 if cue:s+=f'<circle cx="{cx}" cy="{cy}" r="8" fill="none" stroke="{AMBER}" stroke-width="2"/>'
 if neighbors:
  for j,point in enumerate([chain[idx-1],chain[idx+1],new],1):
   x,y=point
   s+=f'<circle cx="{x}" cy="{y}" r="9" fill="none" stroke="{AMBER if j==3 else "#737e77"}" stroke-width="1.6"/>'
   s+=text(x+(0 if j<3 else 12),y+(29 if j<3 else -15),str(j),17)
 return s

def rxn(kind,n,size,missing=None,cue=False):
 left=mol(kind,n,False,cue)
 reagent=text(115,126,'?',47) if missing=='reagent' else incoming(size,cue)
 right=text(205,131,'?',47) if missing=='product' else product(kind,n,size,cue)
 arrow=line((610,125),(690,125))+f'<path d="M690 125 l-13 -7 v14 z" fill="{INK}"/>'
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1130 230" role="img" aria-label="{kind}, {"methyl" if size==1 else "ethyl"} Grignard; {missing or "complete answer"}"><rect width="1130" height="230" fill="white"/>{left}{text(366,123,"+",27)}<g transform="translate(380 0)">{reagent}</g>{arrow}{text(650,92,"dry ether",16)}{text(650,163,"then H₂O",17)}<g transform="translate(700 0)">{right}</g></svg>'
qs=[
 dict(id='1',group='1 · Two familiar aldehydes',kind='aldehyde',n=2,size=1,prompt='Add methyl. Draw the product connections.',hint='Find the aldehyde carbon and add the carbon supplied by CH₃MgBr.',answer='Add methyl at the aldehyde carbon and finish with OH there. That carbon now has two carbon neighbors, so the product is a secondary alcohol.'),
 dict(id='2',group='1 · Two familiar aldehydes',kind='aldehyde',n=3,size=2,prompt='Add ethyl. Keep its two carbons together.',hint='The carbon holding MgBr makes the new bond. Its partner carbon comes with it.',answer='The ethyl group joins at the aldehyde carbon. After water, you have a secondary alcohol. The OH carbon has two carbon neighbors.'),
 dict(id='3',group='3 · Repeat the ketone move',kind='ketone',n=3,size=1,prompt='Add methyl to this ketone.',hint='Keep the carbon group on each side of the carbon double-bonded to O. Add one new methyl group at that same carbon.',answer='Keep both original methyl groups. Add the third methyl group and finish with OH. The OH carbon has three carbon neighbors: this is a tertiary alcohol.'),
 dict(id='4',group='3 · Repeat the ketone move',kind='ketone',n=5,size=1,prompt='Same addition, longer groups on the ketone.',hint='The groups on the left and right are longer, but both stay attached. Where does the new methyl go?',answer='Put methyl on the carbon that was double-bonded to O. Keep both existing ethyl groups and finish with OH. The product is still a tertiary alcohol.'),
 dict(id='5',group='3 · Repeat the ketone move',kind='ketone',n=7,size=1,prompt='Repeat it once more.',hint='Do not count the whole chain to classify the alcohol. Look only at the carbon carrying OH and its direct carbon neighbors.',answer='The original two propyl groups stay attached. Add methyl at the same carbon and finish with OH. There are three direct carbon neighbors, so this is a tertiary alcohol.'),
 dict(id='6A',group='4 · Same reagent, aldehyde or ketone?',kind='aldehyde',n=3,size=2,prompt='A: add ethyl to the aldehyde.',hint='Before the addition, the aldehyde carbon has one carbon neighbor and one H.',answer='Add the ethyl group and finish with OH. The OH carbon now has two carbon neighbors: secondary alcohol.'),
 dict(id='6B',group='4 · Same reagent, aldehyde or ketone?',kind='ketone',n=5,size=2,prompt='B: add ethyl to the ketone.',hint='Before the addition, the ketone carbon already has two carbon neighbors.',answer='Add the same ethyl group and finish with OH. Keep both carbon groups that were already there. The OH carbon now has three carbon neighbors: tertiary alcohol.'),
 dict(id='7',group='5 · Change the question format',kind='ketone',n=3,size=2,prompt='Draw the product connections.',hint='Ethyl is one connected two-carbon piece. Add it to the ketone carbon without removing either existing methyl group.',answer='The OH carbon ends with two methyl groups and one ethyl group. It has three direct carbon neighbors, even though the ethyl branch contains two carbons.'),
 dict(id='8',group='5 · Change the question format',kind='ketone',n=5,size=1,missing='reagent',prompt='Draw the methyl or ethyl Grignard reagent that makes this product.',hint='Compare the starting ketone with the product. The two existing ethyl groups stay. How many carbons are in the newly added group?',answer='Choose CH₃MgBr. The new group is methyl: one added carbon. Keep the water step after the addition.'),
 dict(id='9',group='6 · Mixed practice: identify the starting group yourself',kind='aldehyde',n=2,size=1,prompt='Draw the product connections and name the alcohol type.',hint='Is the carbon double-bonded to O attached to H, or to a carbon group on both sides?',answer='It is an aldehyde. Methyl addition gives a secondary alcohol: the OH carbon has two carbon neighbors.'),
 dict(id='10',group='6 · Mixed practice: identify the starting group yourself',kind='ketone',n=5,size=2,prompt='Draw the product connections and name the alcohol type.',hint='Identify the starting group first. Keep its original carbon connections while adding the incoming piece.',answer='It is a ketone. Ethyl addition gives a tertiary alcohol: the OH carbon has three carbon neighbors.')
]
body='''<header><p class="eyebrow">NO FEAR OCHEM · CHAPTER 17 · V1</p><h1>Same joining move.<br>Now start with a ketone.</h1><p>Keep what is already attached. Add the incoming carbon group at the same site.</p></header><section><h2>One new starting pattern</h2><p>You already know how methyl and ethyl join an aldehyde. Now we will use those same reagents with a ketone.</p><p>Draw the product connections on paper before revealing each answer. The new information comes after two familiar questions.</p></section>'''
last=None
for q in qs:
 if q['id']=='3':
  close='<svg xmlns="http://www.w3.org/2000/svg" viewBox="90 25 240 190" role="img" aria-label="Tertiary alcohol: three carbon neighbors numbered"><rect x="90" y="25" width="240" height="190" fill="white"/>'+product('ketone',3,1,True,True)+'</svg>'
  body+='''<section><h2>2 · The ketone already has two carbon groups</h2><p>Find the carbon double-bonded to O. This time it has a carbon group on <strong>each side</strong>. That makes it a ketone.</p><p><strong>Keep both groups. Add the incoming group at that same carbon. After water, finish with OH there.</strong></p><div class="scroll">'''+rxn('ketone',3,1,cue=True)+'''</div><p>The black carbon–carbon bonds were already there. The amber bond joins the new methyl group.</p><h3>Count only the carbon neighbors of the OH carbon</h3><div class="close">'''+close+'''</div><p><strong>Two existing carbon neighbors + one new carbon neighbor = three.</strong> An alcohol whose OH carbon has three carbon neighbors is a <strong>tertiary alcohol</strong>.</p><div class="note">Do not replace either original group. You are adding a third carbon group, not swapping one for another.</div><p class="small">HO and OH show the same alcohol group. Here the label is turned around so the O sits next to its bond.</p></section>'''
 if q['group']!=last:body+=f'<h2 class="divider">{q["group"]}</h2>';last=q['group']
 body+=f'<section><p class="eyebrow">QUESTION {q["id"]}</p><h3>{q["prompt"]}</h3><div class="scroll">{rxn(q["kind"],q["n"],q["size"],q.get("missing","product"))}</div><details><summary>Help me find the move</summary><p>{q["hint"]}</p></details><details class="answer"><summary>Show the skeletal answer</summary><div class="scroll">{rxn(q["kind"],q["n"],q["size"],cue=True)}</div><p>{q["answer"]}</p></details></section>'
body+='''<section><h2>Same move. One extra group already there.</h2><p><strong>These aldehydes:</strong> one carbon neighbor before addition, two after → secondary alcohol.</p><p><strong>These ketones:</strong> two carbon neighbors before addition, three after → tertiary alcohol.</p><p>Count the carbons directly attached to the OH carbon, not every carbon in the molecule.</p><details><summary>Keep the scope clear</summary><p>These are Grignard additions, not NaBH₄ reductions. NaBH₄ adds H at this site; a Grignard reagent adds a carbon group.</p><p>The ketones here have matching groups on both sides, so the new alcohol carbon is not a stereocenter. The aldehyde recap examples also give matching carbon groups. Other examples may require a stereochemistry decision.</p><p>Use dry ether for the Grignard step, then water afterward. Competing groups and protecting groups belong to a later worksheet.</p></details></section><footer>Original teaching questions for Janice’s review. Reagent drawings use explicit CH₃–MgBr for methyl and a skeletal ethyl group ending in MgBr. O-containing substituents point outward from the zigzag. Amber marks the new bond and the carbon being examined; it does not indicate charge.</footer>'''
css='''*{box-sizing:border-box}body{margin:0;background:#f2f5f2;color:#23382f;font:18px/1.65 Arial,sans-serif}main{max-width:1150px;margin:auto;padding:28px}header{background:#193f33;color:white;padding:34px;border-radius:14px}h1{font-size:42px;line-height:1.15}h2{font-size:27px;line-height:1.3}h3{font-size:22px}section{background:white;border:1px solid #dce4dd;border-radius:12px;padding:27px;margin:24px 0}.divider{margin-top:40px}.eyebrow,.small,footer{font-size:14px}.eyebrow{font-weight:bold}.scroll{overflow-x:auto}.scroll svg{width:100%;min-width:950px;height:auto;display:block}.close{width:360px;max-width:100%}.close svg{width:100%;height:auto}details{border:1px solid #c9d8ca;border-radius:8px;padding:14px;margin:12px 0}.answer{background:#f1f7f2}summary{cursor:pointer;font-weight:bold}summary:focus-visible{outline:3px solid #b87800}.note{padding:16px;background:#fff7e4;border-left:4px solid #b87800}@media(max-width:650px){main{padding:12px}section,header{padding:18px}h1{font-size:32px}}'''
(P/'ketone-addition-v1.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Same move, now a ketone — v1</title><style>'+css+'</style><main>'+body+'</main></html>')
(P/'questions.json').write_text(json.dumps(qs,ensure_ascii=False,indent=2))
md='# Same move, now a ketone\n\nKeep both existing carbon groups. Add the incoming group at the carbon double-bonded to O. After water, finish with OH there. Three direct carbon neighbors make this a tertiary alcohol.\n'
for q in qs:md+=f'\n## {q["id"]}: {q["prompt"]}\n\n**Hint:** {q["hint"]}\n\n**Answer:** {q["answer"]}\n'
(P/'teaching-copy.md').write_text(md)
svgs=re.findall(r'<svg\b.*?</svg>',body,re.S);assert len(svgs)==24
for offset in range(0,24,4):
 pieces=[]
 for j,v in enumerate(svgs[offset:offset+4]):
  inner=re.sub(r'^<svg[^>]*>','',v).removesuffix('</svg>')
  pieces.append(f'<g transform="translate(0 {j*260})">{text(140,23,"Drawing "+str(offset+j+1)+" of 24",18)}<g transform="translate(0 27)">{inner}</g></g>')
 sheet='<svg xmlns="http://www.w3.org/2000/svg" width="1130" height="1040">'+''.join(pieces)+'</svg>'
 d=fitz.open(stream=sheet.encode(),filetype='svg');d[0].get_pixmap(matrix=fitz.Matrix(.85,.85)).save(P/f'review-{offset//4+1}.png')
print('11 practice items, one worked ketone reaction, one numbered-neighbor diagram; 24 drawings.')
