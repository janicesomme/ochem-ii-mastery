from pathlib import Path
import re,json,html,fitz
from drawings import mol,line,text,INK
P=Path(__file__).parent
AMBER='#b87800'
def incoming(size,cue=False):
 # The carbon holding MgBr is (120,118); the existing ethyl C-C bond slopes up-right.
 s=line((120,118),(120,151))+f'<text x="111" y="177" font-family="Arial,sans-serif" font-size="23" fill="{INK}">MgBr</text>'
 if size==2:s+=line((120,118),(162,95))
 if cue:s+=f'<circle cx="120" cy="118" r="12" fill="none" stroke="{AMBER}" stroke-width="2"/>'
 return s

def joined(n,size,cue=False):
 cx,cy=205+(n-1)*21,117
 s=mol('aldehyde',n,True,cue)
 s+=line((cx,cy),(cx+42,cy+23),3.5,AMBER if cue else INK)
 if size==2:s+=line((cx+42,cy+23),(cx+84,cy))
 if cue:s+=f'<circle cx="{cx+42}" cy="{cy+23}" r="11" fill="none" stroke="{AMBER}" stroke-width="2"/>'
 assert cy+23>cy # Added bond leaves the OH-bearing peak downward.
 # Ethyl's pre-existing bond keeps exactly the reagent's direction and length.
 if size==2:assert (84-42,cy-(cy+23))==(42,-23)
 return s

def rxn(n,size,missing=None,cue=False):
 left=mol('aldehyde',n,False,cue)
 reagent=text(120,125,'?',49) if missing=='reagent' else incoming(size,cue)
 right=text(210,129,'?',49) if missing=='product' else joined(n,size,cue)
 arrow=line((580,125),(672,125))+f'<path d="M672 125 l-13 -7 v14 z" fill="{INK}"/>'
 name='' if missing=='reagent' else ('one-carbon group' if size==1 else 'two-carbon group')
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1130 245" role="img" aria-label="Aldehyde and skeletal {"methyl" if size==1 else "ethyl"} Grignard reagent; {missing or "complete product connections"}"><rect width="1130" height="245" fill="white"/>{left}{text(366,123,"+",27)}<g transform="translate(380 0)">{reagent}{text(135,216,name,17)}</g>{arrow}{text(626,92,"dry ether",16)}{text(626,163,"then H₂O",17)}<g transform="translate(700 0)">{right}</g></svg>'
qs=[
 dict(id='1',group='1 · Two familiar methyl additions',n=2,size=1,prompt='Add the methyl group. Draw the product connections.',hint='The reagent has one carbon. Join that carbon to the aldehyde carbon.',answer='Make one new carbon–carbon bond at the aldehyde carbon. After water, its oxygen is OH. Two starting carbons plus one incoming carbon give three carbons.'),
 dict(id='2',group='1 · Two familiar methyl additions',n=3,size=1,prompt='Repeat the methyl move.',hint='The starting chain is longer. The one-carbon group still joins at the aldehyde carbon.',answer='Keep the original three carbons. Add the methyl carbon at the aldehyde site, then finish with OH there. The product has four carbons.'),
 dict(id='3',group='3 · Repeat the ethyl move',n=2,size=2,prompt='Keep the two-carbon piece together.',hint='Find the carbon directly bonded to MgBr. That is the one that joins the aldehyde carbon.',answer='Join the MgBr-holding carbon to the aldehyde carbon. Keep its existing bond to the other carbon. Two plus two gives four carbons in the product.'),
 dict(id='4',group='3 · Repeat the ethyl move',n=3,size=2,prompt='Same joining move, another aldehyde.',hint='Do not split the two-carbon piece. Only its bond to MgBr is replaced by the new bond to the aldehyde carbon.',answer='The ethyl group stays intact as it joins the aldehyde carbon. Finish with OH at the original aldehyde site. Three plus two gives five carbons.'),
 dict(id='5',group='3 · Repeat the ethyl move',n=4,size=2,prompt='One more ethyl addition.',hint='Ignore the extra chain length for a moment. Find the aldehyde carbon and the carbon holding MgBr.',answer='Connect those two carbons and keep all the other carbon–carbon bonds. After water, the original oxygen is OH. Four plus two gives six carbons.'),
 dict(id='6A',group='4 · Same aldehyde, different incoming piece',n=3,size=1,prompt='A: attach the one-carbon piece.',hint='How many carbons are in this reagent’s carbon group?',answer='This reagent adds one carbon. The three-carbon aldehyde gives a four-carbon alcohol.'),
 dict(id='6B',group='4 · Same aldehyde, different incoming piece',n=3,size=2,prompt='B: attach the two-carbon piece.',hint='The aldehyde is identical to A. Only the incoming piece has changed.',answer='This reagent adds two carbons together. The same three-carbon aldehyde now gives a five-carbon alcohol. The joining move has not changed.'),
 dict(id='7',group='5 · Try it without highlighting',n=5,size=2,prompt='Draw the product connections.',hint='Find the carbon bonded to MgBr. Attach that carbon to the aldehyde carbon and carry its partner carbon with it.',answer='The two-carbon piece joins intact. Finish with OH at the old aldehyde site. Five plus two gives seven carbons.'),
 dict(id='8',group='5 · Try it without highlighting',n=4,size=2,missing='reagent',prompt='Draw the methyl or ethyl Grignard reagent that supplies the missing piece.',hint='Look at the new side of the OH carbon. Is the added piece one carbon long, or two?',answer='Choose the ethyl reagent shown. The first new carbon is directly beside the OH carbon; the second is the next line end. The reagent must bring both carbons together.')
]
body='''<header><p class="eyebrow">NO FEAR OCHEM · CHAPTER 17 · V1</p><h1>Same move.<br>A bigger carbon piece.</h1><p>You already know how to add methyl. Now keep the same joining move and bring two carbons instead of one.</p></header><section><h2>The rule stays small</h2><p><strong>Attach the carbon holding MgBr to the aldehyde carbon. Keep the rest of the incoming piece together.</strong></p><p>This sheet asks for product connections. Draw on paper first; then open the skeletal answer.</p></section>'''
last=None
for q in qs:
 if q['id']=='3':
  guide='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 205" role="img" aria-label="Ethyl reagent, carbon bonded to magnesium circled"><rect width="270" height="205" fill="white"/>'+incoming(2,True)+'</svg>'
  body+='''<section><h2>2 · Meet the ethyl piece</h2><p><strong>Methyl has one carbon. Ethyl has two carbons already joined together.</strong> The circled corner below is the carbon holding MgBr. The line end to its right is the other carbon.</p><div class="reagent-guide">'''+guide+'''</div><p>Use the circled carbon to make the new bond. Its partner stays attached.</p><h3>Watch it join</h3><div class="scroll">'''+rxn(2,2,cue=True)+'''</div><p>The amber line is the <strong>new bond</strong>. The black bond inside the incoming two-carbon piece was already there.</p><p>After the water step, the aldehyde’s oxygen is OH. <strong>Two starting carbons + two incoming carbons = four product carbons.</strong></p><div class="note">Do not draw two separate methyl additions. Ethyl arrives as one connected two-carbon piece.</div></section>'''
 if q['group']!=last:body+=f'<h2 class="divider">{q["group"]}</h2>';last=q['group']
 missing=q.get('missing','product')
 body+=f'<section><p class="eyebrow">QUESTION {q["id"]}</p><h3>{q["prompt"]}</h3><div class="scroll">{rxn(q["n"],q["size"],missing)}</div><details><summary>Help me find the joining carbon</summary><p>{q["hint"]}</p></details><details class="answer"><summary>Show the skeletal answer</summary><div class="scroll">{rxn(q["n"],q["size"],cue=True)}</div><p>{q["answer"]}</p></details></section>'
body+='''<section><h2>The check to remember</h2><ol><li>Find the carbon directly bonded to MgBr.</li><li>Join it to the aldehyde carbon.</li><li>Keep the incoming carbon piece intact.</li><li>After water, put OH at the original aldehyde site.</li></ol><p><strong>A bigger incoming piece does not mean a new joining rule.</strong></p><details><summary>Reading these drawings</summary><p>An unlabeled corner or line end represents carbon. MgBr is a labeled group, so the bond ending at that label does not add another carbon. Most H atoms on carbon are left unwritten.</p><p>Amber circles track the joining carbon; amber lines show the new bond. They do not indicate charge.</p></details><details><summary>Keep these conditions with the rule</summary><p>These examples use aldehydes and Grignard reagents in dry ether, followed by water. Water belongs after the addition. Other starting groups and an exposed OH can change what happens.</p></details><details><summary>If a question asks for stereochemistry</summary><p>This first sheet asks which atoms are connected. When the new alcohol carbon has four different groups, these conditions give both mirror-image forms in equal amounts. Draw both if the question asks for stereochemistry. When its two carbon groups match, that carbon is not a stereocenter.</p></details></section><footer>Original skeletal practice questions for Janice’s review. Only the incoming carbon group changes from the earlier worksheet; ketones and extra functional groups are left for later steps.</footer>'''
css='''*{box-sizing:border-box}body{margin:0;background:#f2f5f2;color:#23382f;font:18px/1.65 Arial,sans-serif}main{max-width:1150px;margin:auto;padding:28px}header{padding:34px;background:#193f33;color:white;border-radius:14px}h1{font-size:43px;line-height:1.15}h2{font-size:27px;line-height:1.3}h3{font-size:22px}.divider{margin-top:38px}section{background:white;border:1px solid #dce4dd;border-radius:12px;padding:27px;margin:24px 0}.eyebrow,footer{font-size:14px}.eyebrow{font-weight:bold}.scroll{overflow-x:auto}.scroll svg{display:block;width:100%;min-width:950px;height:auto}.reagent-guide{width:320px;max-width:100%}.reagent-guide svg{width:100%;height:auto}details{padding:14px;border:1px solid #c9d8ca;border-radius:8px;margin:12px 0}.answer{background:#f1f7f2}summary{font-weight:bold;cursor:pointer}summary:focus-visible{outline:3px solid #b87800}.note{padding:16px;background:#fff7e4;border-left:4px solid #b87800}li{margin:9px 0}@media(max-width:650px){main{padding:12px}section,header{padding:18px}h1{font-size:33px}}'''
(P/'methyl-to-ethyl-v1.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Same move, methyl to ethyl — v1</title><style>'+css+'</style><main>'+body+'</main></html>')
(P/'questions.json').write_text(json.dumps(qs,ensure_ascii=False,indent=2))
md='# Same move: methyl to ethyl\n\nAttach the carbon holding MgBr to the aldehyde carbon. Keep the incoming piece together.\n\nMethyl brings one carbon. Ethyl brings two carbons already joined together. The new bond uses the carbon directly bonded to MgBr.\n'
for q in qs:md+=f'\n## {q["id"]}: {q["prompt"]}\n\n**Hint:** {q["hint"]}\n\n**Answer:** {q["answer"]}\n'
(P/'teaching-copy.md').write_text(md)
svgs=re.findall(r'<svg\b.*?</svg>',body,re.S);assert len(svgs)==20
for offset in range(0,20,4):
 pieces=[]
 for j,v in enumerate(svgs[offset:offset+4]):
  inner=re.sub(r'^<svg[^>]*>','',v).removesuffix('</svg>')
  pieces.append(f'<g transform="translate(0 {j*275})">{text(140,22,"Drawing "+str(offset+j+1)+" of 20",18)}<g transform="translate(0 26)">{inner}</g></g>')
 sheet='<svg xmlns="http://www.w3.org/2000/svg" width="1130" height="1100">'+''.join(pieces)+'</svg>'
 d=fitz.open(stream=sheet.encode(),filetype='svg');d[0].get_pixmap(matrix=fitz.Matrix(.85,.85)).save(P/f'review-{offset//4+1}.png')
print('9 practice items, 1 worked ethyl addition, 1 reagent close-up: 20 SVG drawings.')
